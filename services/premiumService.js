const User = require("../models/user");
const Expense = require("../models/expense");

User.hasMany(Expense);
Expense.belongsTo(User);

const getUserLeaderboard = async () => {
    const users = await User.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: Expense,
                attributes: ["amount"],
            },
        ],
    });

    const leaderboard = users.map((user) => {
        const total = user.expenses
            ? user.expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
            : 0;
        return {
            id: user.id,
            name: user.name || "User",
            total_cost: total,
            totalExpense: total,
        };
    });

    leaderboard.sort((a, b) => b.total_cost - a.total_cost);
    return leaderboard;
};

module.exports = {
    getUserLeaderboard,
};
