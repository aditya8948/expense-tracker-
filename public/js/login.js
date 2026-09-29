const form = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerText = "";
    messageDiv.className = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userDetails = {
        email: email,
        password: password,
    };

    try {
        const response = await axios.post("/user/login", userDetails);
        if (response.status === 200) {
            messageDiv.className = "success";
            messageDiv.innerText = response.data.message;

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", email);
            if (response.data.userId) {
                localStorage.setItem("userId", response.data.userId);
            }
            localStorage.setItem("isPremiumUser", response.data.isPremiumUser ? "true" : "false");
            window.location.href = "/expense";
        }
    } catch (err) {
        messageDiv.className = "error";
        if (err.response && err.response.data && err.response.data.message) {
            messageDiv.innerText = err.response.data.message;
        } else {
            messageDiv.innerText = `Error: ${err.message}`;
        }
    }
});

// Forgot Password Elements
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotPasswordContainer = document.getElementById("forgotPasswordContainer");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const cancelForgotBtn = document.getElementById("cancelForgotBtn");
const forgotEmailInput = document.getElementById("forgotEmail");
const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");
const forgotMessage = document.getElementById("forgotMessage");

if (forgotPasswordBtn && forgotPasswordContainer) {
    // Show forgot password form
    forgotPasswordBtn.addEventListener("click", () => {
        const isHidden = forgotPasswordContainer.style.display === "none";
        forgotPasswordContainer.style.display = isHidden ? "block" : "none";
        if (isHidden) {
            forgotEmailInput.focus();
            forgotMessage.innerText = "";
            forgotMessage.className = "";
        }
    });

    // Cancel / Hide forgot password form
    if (cancelForgotBtn) {
        cancelForgotBtn.addEventListener("click", () => {
            forgotPasswordContainer.style.display = "none";
            forgotPasswordForm.reset();
            forgotMessage.innerText = "";
            forgotMessage.className = "";
        });
    }

    // Submit forgot password form
    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        forgotMessage.innerText = "";
        forgotMessage.className = "";

        const email = forgotEmailInput.value.trim();
        if (!email) {
            forgotMessage.className = "error";
            forgotMessage.innerText = "Please enter your email address";
            return;
        }

        const originalBtnText = forgotSubmitBtn.innerText;
        forgotSubmitBtn.disabled = true;
        forgotSubmitBtn.innerText = "Sending mail...";

        try {
            const response = await axios.post("/password/forgotpassword", { email });
            forgotMessage.className = "success";
            forgotMessage.innerText = response.data.message || "Reset mail sent successfully!";
            alert(response.data.message || "Reset mail sent successfully!");
            forgotPasswordForm.reset();
        } catch (err) {
            forgotMessage.className = "error";
            const errMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : "Failed to send reset email. Please try again.";
            forgotMessage.innerText = errMsg;
            alert(errMsg);
        } finally {
            forgotSubmitBtn.disabled = false;
            forgotSubmitBtn.innerText = originalBtnText;
        }
    });
}
