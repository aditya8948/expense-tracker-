const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/suggest-category", aiController.suggestCategory);

module.exports = router;
