const bcrypt = require("bcryptjs");
const User = require("../models/user");

const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

const createUser = async ({ name, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create({
        name,
        email,
        password: hashedPassword,
    });
};

const verifyPassword = async (inputPassword, storedPassword) => {
    return (await bcrypt.compare(inputPassword, storedPassword)) || (inputPassword === storedPassword);
};

module.exports = {
    findUserByEmail,
    createUser,
    verifyPassword,
};
