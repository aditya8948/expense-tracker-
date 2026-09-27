const userService = require("../services/userService");

exports.postSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists, Please Login" });
        }

        await userService.createUser({ name, email, password });

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

        const user = await userService.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isMatch = await userService.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        res.status(200).json({
            message: "User login successful",
            userId: user.id,
            isPremiumUser: !!user.isPremiumUser,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
