const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("expense", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    note:{
        type: Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = Expense;
