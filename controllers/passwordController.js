const userService = require("../services/userService");
const passwordService = require("../services/passwordService");

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist with this email" });
        }

        await passwordService.sendForgotPasswordMail(email);

        return res.status(200).json({
            message: "Password reset email sent successfully! Please check your inbox.",
            success: true,
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({
            message: "Failed to send password reset email. Please try again later.",
            error: err.message,
        });
    }
};
