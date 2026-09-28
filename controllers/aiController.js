const aiService = require("../services/aiService");

exports.suggestCategory = async (req, res) => {
    try {
        const { description } = req.body;
        const category = await aiService.suggestCategory(description);
        res.status(200).json({ category });
    } catch (err) {
        console.error("AI controller error:", err.message);
        res.status(200).json({ category: "Other" });
    }
};
