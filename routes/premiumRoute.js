const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");

router.get("/showLeaderboard", premiumController.getLeaderboard);
router.get("/showleaderboard", premiumController.getLeaderboard);
router.get("/leaderboard", premiumController.getLeaderboard);

module.exports = router;
