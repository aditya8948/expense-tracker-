const SibApiV3Sdk = require("sib-api-v3-sdk");

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildEmailData(sender, recipientEmail, resetUrl, originalEmail = null) {
    const fallbackNoteText = originalEmail
        ? `\n[Note: Delivery to "${originalEmail}" failed, so this reset link was sent to the default email.]\n`
        : "";
    const fallbackNoteHtml = originalEmail
        ? `<p style="color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 4px; font-size: 13px;">Note: Email delivery to <strong>${escapeHtml(originalEmail)}</strong> failed, so this reset link was sent to the default email.</p>`
        : "";

    return {
        sender,
        to: [{ email: recipientEmail }],
        subject: "Expense Tracker - Password Reset Request",
        textContent: `Hello,\n${fallbackNoteText}\nYou requested to reset your password. Click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nThank you,\nExpense Tracker Team`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h2 style="color: #007bff; text-align: center;">Expense Tracker</h2>
                <h3 style="color: #333;">Reset Your Password</h3>
                ${fallbackNoteHtml}
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 13px; color: #666;">Or copy and paste this link in your browser:</p>
                <p style="font-size: 13px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">This link can only be used once. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        `,
    };
}

exports.sendForgotPasswordMail = async (recipientEmail, resetUrl) => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.SIB_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
        email: process.env.SIB_SENDER_EMAIL || "aditya89pandey89@gmail.com",
        name: "Expense Tracker",
    };

    const fallbackEmail = (process.env.DEFAULT_DUMMY_EMAIL || "89adityapandey@gmail.com").trim();
    const normalizedRecipient = String(recipientEmail || "").trim();

    try {
        return await tranEmailApi.sendTransacEmail(
            buildEmailData(sender, normalizedRecipient, resetUrl)
        );
    } catch (err) {
        if (!fallbackEmail || normalizedRecipient.toLowerCase() === fallbackEmail.toLowerCase()) {
            throw err;
        }

        console.warn(
            `Failed to send reset email to "${normalizedRecipient}" (${err.message}). Falling back to "${fallbackEmail}".`
        );

        return await tranEmailApi.sendTransacEmail(
            buildEmailData(sender, fallbackEmail, resetUrl, normalizedRecipient)
        );
    }
};
