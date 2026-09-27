const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Order = sequelize.define("order", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    orderId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    paymentSessionId: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: "PENDING",
    },
});

module.exports = Order;
