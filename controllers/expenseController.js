const expenseService = require("../services/expenseService");

exports.getExpenses = async (req, res) => {
    try {
        const userId = await expenseService.getUserIdFromRequest(req);
        const { page, limit, itemsPerPage } = req.query;
        const perPage = limit || itemsPerPage;

        const expenses = await expenseService.getExpenses(userId, page, perPage);
        res.status(200).json(expenses);
    } catch (err) {
        console.error("Error fetching expenses:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.addExpense = async (req, res) => {
    try {
        const { amount, description, category, note } = req.body;
        const userId = await expenseService.getUserIdFromRequest(req);

        if (!userId) {
            return res.status(400).json({ message: "User identification required to add expense" });
        }

        const expense = await expenseService.createExpense({
            amount,
            description,
            category,
            note,
            userId,
        });
        res.status(201).json(expense);
    } catch (err) {
        console.error("Error adding expense:", err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = await expenseService.getUserIdFromRequest(req);

        const deleted = await expenseService.deleteExpense(id, userId);
        if (!deleted) {
            return res.status(404).json({ message: "Expense not found or unauthorized" });
        }
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("Error deleting expense:", err.message);
        res.status(500).json({ error: err.message });
    }
};
