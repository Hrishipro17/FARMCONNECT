const jwt = require("jsonwebtoken");

// Protect routes that require a logged-in user.
module.exports = function auth(req, res, next) {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication token is required"
        });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        return res.status(401).json({
            message: "Authentication token is required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: String(decoded.id),
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired authentication token"
        });
    }
};
