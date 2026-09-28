const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

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
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.create(
            {
                amount,
                description,
                category,
                userId,
            },
            { transaction: t }
        );

        const user = await User.findByPk(userId, { transaction: t });
        if (user) {
            const currentTotal = Number(user.totalExpenses || 0);
            const newTotal = currentTotal + Number(amount);
            await user.update({ totalExpenses: newTotal }, { transaction: t });
        }

        await t.commit();
        return expense;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const deleteExpense = async (id, userId) => {
    const t = await sequelize.transaction();
    try {
        const whereClause = userId ? { id, userId } : { id };
        const expense = await Expense.findOne({ where: whereClause, transaction: t });
        if (!expense) {
            await t.rollback();
            return 0;
        }

        const expenseAmount = Number(expense.amount || 0);
        const expenseUserId = expense.userId;

        const deleted = await Expense.destroy({ where: whereClause, transaction: t });

        if (expenseUserId) {
            const user = await User.findByPk(expenseUserId, { transaction: t });
            if (user) {
                const currentTotal = Number(user.totalExpenses || 0);
                const newTotal = Math.max(0, currentTotal - expenseAmount);
                await user.update({ totalExpenses: newTotal }, { transaction: t });
            }
        }

        await t.commit();
        return deleted;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

module.exports = {
    getUserIdFromRequest,
    getExpenses,
    createExpense,
    deleteExpense,
};
