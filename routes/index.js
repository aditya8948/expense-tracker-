const express = require("express");
const router = express.Router();

const aiRoute = require("./aiRoute");
const expenseRoute = require("./expenseRoute");
const passwordRoute = require("./passwordRoute");
const premiumRoute = require("./premiumRoute");
const purchaseRoute = require("./purchaseRoute");
const userRoute = require("./userRoute");


router.use("/user", userRoute);
router.use("/api/expenses", expenseRoute);
router.use("/expense", expenseRoute);
router.use("/purchase", purchaseRoute);
router.use("/premium", premiumRoute);
router.use("/ai", aiRoute);
router.use("/password", passwordRoute);

module.exports = router;