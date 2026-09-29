const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

router.post("/forgotpassword", passwordController.forgotPassword);
router.get("/resetpassword/:id", passwordController.resetPassword);
router.post("/updatepassword/:id", passwordController.updatePassword);
router.post("/updatepassword", passwordController.updatePassword);

module.exports = router;
