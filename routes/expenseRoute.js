const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.get("/", expenseController.getExpenses);
router.post("/", expenseController.addExpense);
router.delete("/:id", expenseController.deleteExpense);

router.get("/get-expenses", expenseController.getExpenses);
router.post("/add-expense", expenseController.addExpense);
router.delete("/delete-expense/:id", expenseController.deleteExpense);

module.exports = router;
