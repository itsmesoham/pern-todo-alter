const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        const token = req.cookies.token;  // READ COOKIE

        if (!token) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: "Invalid token" });
    }
};