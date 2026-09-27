const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

router.post("/premiummembership", purchaseController.createOrder);
router.post("/updatetransactionstatus", purchaseController.updateTransactionStatus);

module.exports = router;
