const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
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

        // Generate unique UUID
        const id = uuidv4();

        // Create forgot password request record in DB
        await ForgotPasswordRequest.create({
            id,
            userId: user.id,
            isActive: true,
        });

        // Build reset URL
        const host = req.get("host");
        const protocol = req.protocol;
        const resetUrl = `${protocol}://${host}/password/resetpassword/${id}`;

        // Send reset email with URL
        await passwordService.sendForgotPasswordMail(email, resetUrl);

        return res.status(200).json({
            message: "Password reset link sent to your email! Please check your inbox.",
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

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether request exists and isActive is true
        const forgotRequest = await ForgotPasswordRequest.findOne({ where: { id } });

        if (!forgotRequest || !forgotRequest.isActive) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Link Expired</title>
                    <style>
                        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8f9fa; }
                        .card { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                        h2 { color: #dc3545; margin-top: 0; }
                        a { color: #007bff; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>Link Expired or Invalid</h2>
                        <p>This password reset link has already been used or is invalid.</p>
                        <p><a href="/login">Return to Login</a></p>
                    </div>
                </body>
                </html>
            `);
        }

        // Return form to update new password
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .container {
                        max-width: 380px;
                        width: 100%;
                        background-color: #ffffff;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 25px;
                        box-sizing: border-box;
                    }
                    h2 {
                        margin-top: 0;
                        margin-bottom: 20px;
                        font-size: 22px;
                        color: #333;
                        text-align: center;
                    }
                    .form-group {
                        margin-bottom: 15px;
                    }
                    label {
                        display: block;
                        margin-bottom: 6px;
                        font-size: 14px;
                        color: #333;
                        font-weight: bold;
                    }
                    input {
                        width: 100%;
                        padding: 8px 10px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 14px;
                        box-sizing: border-box;
                    }
                    input:focus {
                        border-color: #007bff;
                        outline: none;
                    }
                    button {
                        width: 100%;
                        padding: 10px;
                        margin-top: 5px;
                        background-color: #007bff;
                        color: #ffffff;
                        border: none;
                        border-radius: 4px;
                        font-size: 15px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #0069d9;
                    }
                    #message {
                        margin-top: 15px;
                        text-align: center;
                        font-size: 14px;
                    }
                    .error { color: #dc3545; }
                    .success { color: #28a745; }
                    .login-link {
                        display: inline-block;
                        margin-top: 10px;
                        color: #007bff;
                        text-decoration: none;
                    }
                    .login-link:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Reset Password</h2>
                    <form id="resetForm">
                        <div class="form-group">
                            <label for="password">Enter New Password:</label>
                            <input type="password" id="password" name="password" placeholder="Enter new password" required minlength="4" />
                        </div>
                        <button type="submit" id="submitBtn">Update Password</button>
                    </form>
                    <div id="message"></div>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
                <script>
                    const form = document.getElementById("resetForm");
                    const messageDiv = document.getElementById("message");
                    const submitBtn = document.getElementById("submitBtn");

                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const password = document.getElementById("password").value;
                        messageDiv.innerText = "";
                        messageDiv.className = "";
                        submitBtn.disabled = true;
                        submitBtn.innerText = "Updating...";

                        try {
                            const res = await axios.post("/password/updatepassword/${id}", { password });
                            messageDiv.className = "success";
                            messageDiv.innerHTML = res.data.message + '<br><a class="login-link" href="/login">Click here to Login</a>';
                            form.style.display = "none";
                        } catch (err) {
                            messageDiv.className = "error";
                            messageDiv.innerText = (err.response && err.response.data && err.response.data.message) || err.message;
                            submitBtn.disabled = false;
                            submitBtn.innerText = "Update Password";
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        console.error("Reset password page error:", err);
        return res.status(500).send("<h3>Something went wrong. Please try again later.</h3>");
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.query.id;
        const password = req.body.password || req.body.newpassword || req.body.newPassword;

        if (!id) {
            return res.status(400).json({ message: "Reset ID is required" });
        }

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        // Find request in table
        const forgotRequest = await ForgotPasswordRequest.findOne({ where: { id } });

        if (!forgotRequest || !forgotRequest.isActive) {
            return res.status(400).json({
                message: "Password reset link is invalid or has already been used.",
                success: false,
            });
        }

        // Find user by userId in forgotRequest
        const user = await User.findByPk(forgotRequest.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Encrypt the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in DB
        await user.update({ password: hashedPassword });

        // Make isActive false so link cannot be reused
        await forgotRequest.update({ isActive: false });

        return res.status(200).json({
            message: "Password updated successfully!",
            success: true,
        });
    } catch (err) {
        console.error("Update password error:", err);
        return res.status(500).json({
            message: "Failed to update password. Please try again.",
            error: err.message,
        });
    }
};
