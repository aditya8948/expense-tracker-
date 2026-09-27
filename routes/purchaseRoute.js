const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const premiumController = require("../controllers/premiumController");

router.post("/premiummembership", purchaseController.createOrder);
router.post("/updatetransactionstatus", purchaseController.updateTransactionStatus);
router.get("/userstatus", purchaseController.getUserStatus);
router.get("/showLeaderboard", premiumController.getLeaderboard);

module.exports = router;
