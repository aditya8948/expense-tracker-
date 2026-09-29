const SibApiV3Sdk = require("sib-api-v3-sdk");

exports.sendForgotPasswordMail = async (recipientEmail) => {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.SIB_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
        email: process.env.SIB_SENDER_EMAIL || "aditya89pandey89@gmail.com",
        name: "Expense Tracker",
    };

    const receivers = [
        {
            email: recipientEmail,
        },
    ];

    const emailData = {
        sender,
        to: receivers,
        subject: "Expense Tracker - Password Reset Request",
        textContent: "Hello,\n\nYou requested to reset your password. This is a dummy email for password reset verification.\n\nThank you,\nExpense Tracker Team",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h2 style="color: #007bff; text-align: center;">Expense Tracker</h2>
                <h3 style="color: #333;">Password Reset Request</h3>
                <p>Hello,</p>
                <p>We received a request to reset your password for your <strong>Expense Tracker</strong> account.</p>
                <p>This is a verification email to confirm that your password reset request was received successfully.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                    <p style="margin: 0; color: #555;"><strong>Recipient Email:</strong> ${recipientEmail}</p>
                    <p style="margin: 5px 0 0 0; color: #555;"><strong>Status:</strong> Request recorded successfully.</p>
                </div>
                <p style="color: #777; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Expense Tracker. All rights reserved.</p>
            </div>
        `,
    };

    return await tranEmailApi.sendTransacEmail(emailData);
};
