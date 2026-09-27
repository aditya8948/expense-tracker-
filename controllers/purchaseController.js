const axios = require("axios");
const Order = require("../models/order");
const User = require("../models/user");

// Cashfree Sandbox credentials
const CASHFREE_APP_ID = "TEST430329ae80e0f32e41a393d78b923034";
const CASHFREE_SECRET_KEY = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg/orders";

// Step 1: Create order on Cashfree and save it in DB with PENDING status
exports.createOrder = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a unique order id
        const orderId = "order_" + Date.now();

        // Call Cashfree Sandbox API to create the order
        const response = await axios.post(
            CASHFREE_API_URL,
            {
                order_id: orderId,
                order_amount: 2500,
                order_currency: "INR",
                customer_details: {
                    customer_id: String(user.id),
                    customer_email: user.email,
                    customer_phone: "9999999999",
                },
                order_meta: {
                    return_url: "http://localhost:3000/Expense/expense.html",
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-client-id": CASHFREE_APP_ID,
                    "x-client-secret": CASHFREE_SECRET_KEY,
                    "x-api-version": "2025-01-01",
                },
            }
        );

        // Save the order in our database with PENDING status
        await Order.create({
            orderId: orderId,
            paymentSessionId: response.data.payment_session_id,
            status: "PENDING",
            userId: user.id,
        });

        // Send session id back to frontend
        res.status(200).json({
            orderId: orderId,
            paymentSessionId: response.data.payment_session_id,
        });
    } catch (err) {
        console.error("Error creating order:", err.response?.data || err.message);
        res.status(500).json({ error: err.message });
    }
};

// Step 2: After payment, update order status and make user premium
exports.updateTransactionStatus = async (req, res) => {
    try {
        const { orderId, email } = req.body;

        // Find the order
        const order = await Order.findOne({ where: { orderId } });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify payment status with Cashfree
        const response = await axios.get(
            `${CASHFREE_API_URL}/${orderId}`,
            {
                headers: {
                    "x-client-id": CASHFREE_APP_ID,
                    "x-client-secret": CASHFREE_SECRET_KEY,
                    "x-api-version": "2025-01-01",
                },
            }
        );

        const paymentStatus = response.data.order_status;

        if (paymentStatus === "PAID") {
            // Update order status to SUCCESSFUL
            await order.update({ status: "SUCCESSFUL" });

            // Make the user a premium user
            const user = await User.findOne({ where: { email } });
            if (user) {
                await user.update({ isPremiumUser: true });
            }

            return res.status(200).json({
                message: "Transaction successful",
                isPremiumUser: true,
            });
        } else {
            // Update order status to FAILED
            await order.update({ status: "FAILED" });

            return res.status(400).json({
                message: "TRANSACTION FAILED",
                isPremiumUser: false,
            });
        }
    } catch (err) {
        console.error("Error updating transaction:", err.message);
        res.status(500).json({ error: err.message });
    }
};
