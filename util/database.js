const Sequelize = require("sequelize");

const sequelize = new Sequelize("expense_tracker", "root", "aditya89", {
    dialect: "mysql",
    host: "localhost",
    dialectOptions: {
        socketPath: "/tmp/mysql.sock",
    },
});

module.exports = sequelize;
