const Expense = require("./expense");
const User = require("./user");
const Order = require("./order");
const ForgotPasswordRequest = require("./forgotPasswordRequest");



User.hasMany(Expense);
Expense.belongsTo(User);


User.hasMany(Order);
Order.belongsTo(User);


User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

module.exports = {
    Expense,
    User,
    Order,
    ForgotPasswordRequest,
}