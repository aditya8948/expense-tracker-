require("dotenv").config();
const express = require("express");
const {requestLogger, errorLogger} = require("./middleware");
const path = require("path");
const cors = require("cors");
const sequelize = require("./config/database");
const expenseRoute = require("./routes/expenseRoute");
const userRoute = require("./routes/userRoute");
const purchaseRoute = require("./routes/purchaseRoute");
const premiumRoute = require("./routes/premiumRoute");
const aiRoute = require("./routes/aiRoute");
const passwordRoute = require("./routes/passwordRoute");

const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");
const ForgotPasswordRequest = require("./models/forgotPasswordRequest");

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

const app = express();
app.use(requestLogger);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.get("/expense", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "expense.html"));
});

app.get("/reports", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "report.html"));
});

app.get("/report", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "report.html"));
});

app.get("/Login/login.html", (req, res) => {
    res.redirect("/login");
});

app.get("/Signup/signup.html", (req, res) => {
    res.redirect("/signup");
});

app.get("/Expense/expense.html", (req, res) => {
    res.redirect("/expense");
});

app.use("/user", userRoute);
app.use("/api/expenses", expenseRoute);
app.use("/expense", expenseRoute);
app.use("/purchase", purchaseRoute);
app.use("/premium", premiumRoute);
app.use("/ai", aiRoute);
app.use("/password", passwordRoute);

app.use(errorLogger);

const PORT = process.env.PORT || 3000;

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`Port ${port} in use, trying ${Number(port) + 1}...`);
            startServer(Number(port) + 1);
        } else {
            console.error("Server error:", err);
        }
    });
}

sequelize
    .sync()
    .then(() => {
        startServer(PORT);
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

module.exports = app;
