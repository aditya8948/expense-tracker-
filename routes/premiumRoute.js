const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");
const{authenticate,checkPremium}= require("../middleware")

router.get("/showLeaderboard", authenticate, checkPremium, premiumController.getLeaderboard);
router.get("/showleaderboard", authenticate, checkPremium, premiumController.getLeaderboard);
router.get("/leaderboard", authenticate, checkPremium, premiumController.getLeaderboard);

module.exports = router;
