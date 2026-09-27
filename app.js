const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./util/database");
const expenseRoute = require("./routes/expenseRoute");
const userRoute = require("./routes/userRoute");
const purchaseRoute = require("./routes/purchaseRoute");

// Models
const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");

// Associations
User.hasMany(Order);
Order.belongsTo(User);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/user", userRoute);
app.use("/api/expenses", expenseRoute);
app.use("/expense", expenseRoute);
app.use("/purchase", purchaseRoute);

// Default redirect to Login
app.get("/", (req, res) => {
    res.redirect("/Login/login.html");
});

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

module.exports = app;
