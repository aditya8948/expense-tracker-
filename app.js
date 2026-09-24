const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./util/database");
const expenseRoute = require("./routes/expenseRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/expenses", expenseRoute);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server running on http://localhost:3000");
        });
    })
    .catch((err) => {
        console.log(err);
    });
