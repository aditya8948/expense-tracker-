const User = require("../models/user");

const getUserLeaderboard = async () => {
    const users = await User.findAll({
        attributes: ["id", "name", "totalExpenses"],
        order: [["totalExpenses", "DESC"]],
    });

    return users.map((user) => ({
        id: user.id,
        name: user.name || "User",
        total_cost: user.totalExpenses || 0,
        totalExpense: user.totalExpenses || 0,
    }));
};

module.exports = {
    getUserLeaderboard,
};
