const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.postSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists, Please Login" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "Successfuly signed up" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isMatch = (await bcrypt.compare(password, user.password)) || (password === user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        res.status(200).json({ message: "User login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
