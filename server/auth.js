const router = require("express").Router();
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("./jwtAuth");

require("dotenv").config();

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const userExists = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (userExists.rows.length > 0)
            return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
            [username, hashedPassword, role || "user"]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (user.rows.length === 0)
            return res.status(400).json({ error: "Invalid username or password" });

        const valid = await bcrypt.compare(password, user.rows[0].password);
        if (!valid)
            return res.status(400).json({ error: "Invalid username or password" });

        // Create JWT
        const token = jwt.sign(
            {
                user_id: user.rows[0].user_id,
                username: user.rows[0].username,
                role: user.rows[0].role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false // true only in production
        });

        res.json({ message: "Logged in", user: user.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
});

// Check login status
router.get("/me", jwtAuth, (req, res) => {
    res.json({
        user_id: req.user.user_id,
        username: req.user.username,
        role: req.user.role
    });
});

module.exports = router;