const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../config/database");

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

const getExpenses = async (userId, page, limit) => {
    const whereClause = userId ? { userId } : {};

    if (page !== undefined && limit !== undefined) {
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 5);
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Expense.findAndCountAll({
            where: whereClause,
            offset: offset,
            limit: limitNum,
            order: [["createdAt", "DESC"]],
        });

        const totalPages = Math.ceil(count / limitNum) || 1;

        return {
            expenses: rows,
            totalExpenses: count,
            currentPage: pageNum,
            totalPages: totalPages,
            hasNextPage: pageNum < totalPages,
            nextPage: pageNum + 1,
            hasPreviousPage: pageNum > 1,
            previousPage: pageNum - 1,
            lastPage: totalPages,
        };
    }

    return await Expense.findAll({ where: whereClause, order: [["createdAt", "DESC"]] });
};

const createExpense = async ({ amount, description, category, note, userId }) => {
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.create(
            {
                amount,
                description,
                category,
                note,
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
