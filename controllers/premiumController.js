const premiumService = require("../services/premiumService");

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await premiumService.getUserLeaderboard();
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error("Error fetching leaderboard:", err.message);
        res.status(500).json({ error: err.message });
    }
};
