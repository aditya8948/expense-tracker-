const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const {authenticate, validateExpense} = require("../middleware")

router.get("/", authenticate, expenseController.getExpenses);
router.post("/",authenticate, validateExpense, expenseController.addExpense);
router.delete("/:id", authenticate, expenseController.deleteExpense);

router.get("/get-expenses", authenticate, expenseController.getExpenses);
router.post("/add-expense", authenticate, validateExpense, expenseController.addExpense);
router.delete("/delete-expense/:id", authenticate, expenseController.deleteExpense);

module.exports = router;
