const Expense = require("../models/expense");
const User = require("../models/user");

const getUserIdFromRequest = async (req) => {
    if (req.user && req.user.id) {
        return req.user.id;
    }
    const userId = req.body?.userId || req.query?.userId || req.headers["user-id"];
    if (userId) {
        return parseInt(userId);
    }
    const email = req.body?.email || req.query?.email || req.headers["user-email"];
    if (email) {
        const user = await User.findOne({ where: { email } });
        if (user) {
            return user.id;
        }
    }
    return null;
};

const getExpenses = async (userId) => {
    const whereClause = userId ? { userId } : {};
    return await Expense.findAll({ where: whereClause });
};

const createExpense = async ({ amount, description, category, userId }) => {
    return await Expense.create({
        amount,
        description,
        category,
        userId,
    });
};

const deleteExpense = async (id, userId) => {
    const whereClause = userId ? { id, userId } : { id };
    return await Expense.destroy({ where: whereClause });
};

module.exports = {
    getUserIdFromRequest,
    getExpenses,
    createExpense,
    deleteExpense,
};
