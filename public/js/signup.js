const form = document.getElementById("signupForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.innerText = "";
    messageDiv.className = "";

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userDetails = {
        name: name,
        email: email,
        password: password,
    };

    try {
        const response = await axios.post("/user/signup", userDetails);
        if (response.status === 201) {
            messageDiv.className = "success";
            messageDiv.innerText = response.data.message + ". Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login";
            }, 600);
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
