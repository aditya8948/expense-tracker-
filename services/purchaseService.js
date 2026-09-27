const axios = require("axios");
const Order = require("../models/order");
const User = require("../models/user");

const CASHFREE_APP_ID = "TEST430329ae80e0f32e41a393d78b923034";
const CASHFREE_SECRET_KEY = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg/orders";

const createCashfreeOrder = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return { error: "User not found", status: 404 };
    }

    const orderId = "order_" + Date.now();

    let customerEmail = user.email ? user.email.trim() : "customer@example.com";
    if (!customerEmail.includes(".")) {
        customerEmail = `${customerEmail}.com`;
    }
    if (!customerEmail.includes("@")) {
        customerEmail = "customer@example.com";
    }

    const response = await axios.post(
        CASHFREE_API_URL,
        {
            order_id: orderId,
            order_amount: 25.00,
            order_currency: "INR",
            customer_details: {
                customer_id: String(user.id),
                customer_name: user.name || "Customer",
                customer_email: customerEmail,
                customer_phone: "9999999999",
            },
            order_meta: {
                return_url: "http://localhost:3000/expense?order_id={order_id}",
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
            },
        }
    );

    await Order.create({
        orderId: orderId,
        paymentSessionId: response.data.payment_session_id,
        status: "PENDING",
        userId: user.id,
    });

    return {
        orderId: orderId,
        paymentSessionId: response.data.payment_session_id,
    };
};

const updateTransaction = async (orderId, email) => {
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
        return { error: "Order not found", status: 404 };
    }

    const response = await axios.get(
        `${CASHFREE_API_URL}/${orderId}`,
        {
            headers: {
                "x-client-id": CASHFREE_APP_ID,
                "x-client-secret": CASHFREE_SECRET_KEY,
                "x-api-version": "2023-08-01",
            },
        }
    );

    let isPaid = response.data.order_status === "PAID";
    if (!isPaid) {
        try {
            const paymentsRes = await axios.get(
                `${CASHFREE_API_URL}/${orderId}/payments`,
                {
                    headers: {
                        "x-client-id": CASHFREE_APP_ID,
                        "x-client-secret": CASHFREE_SECRET_KEY,
                        "x-api-version": "2023-08-01",
                    },
                }
            );
            if (Array.isArray(paymentsRes.data)) {
                isPaid = paymentsRes.data.some((p) => p.payment_status === "SUCCESS");
            }
        } catch (pErr) {
            console.error("Error fetching payments list:", pErr.message);
        }
    }

    if (isPaid) {
        await order.update({ status: "SUCCESSFUL" });
        const user = await User.findOne({ where: { email } });
        if (user) {
            await user.update({ isPremiumUser: true });
        }
        return {
            success: true,
            message: "Transaction successful",
            isPremiumUser: true,
        };
    } else {
        await order.update({ status: "FAILED" });
        return {
            success: false,
            message: "TRANSACTION FAILED",
            isPremiumUser: false,
        };
    }
};

const getUserStatus = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return null;
    }
    return !!user.isPremiumUser;
};

module.exports = {
    createCashfreeOrder,
    updateTransaction,
    getUserStatus,
};
