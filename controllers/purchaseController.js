const purchaseService = require("../services/purchaseService");

exports.createOrder = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await purchaseService.createCashfreeOrder(email);
        if (result.error) {
            return res.status(result.status || 400).json({ message: result.error });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error("Error creating order:", err.response?.data || err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { orderId, email } = req.body;
        const result = await purchaseService.updateTransaction(orderId, email);
        if (result.error) {
            return res.status(result.status || 400).json({ message: result.error });
        }
        if (result.success) {
            return res.status(200).json({
                message: result.message,
                isPremiumUser: result.isPremiumUser,
            });
        } else {
            return res.status(400).json({
                message: result.message,
                isPremiumUser: result.isPremiumUser,
            });
        }
    } catch (err) {
        console.error("Error updating transaction:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getUserStatus = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const isPremiumUser = await purchaseService.getUserStatus(email);
        if (isPremiumUser === null) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ isPremiumUser });
    } catch (err) {
        console.error("Error fetching user status:", err.message);
        res.status(500).json({ error: err.message });
    }
};
