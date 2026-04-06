import jwt from "jsonwebtoken";
import httpStatus from "http-status";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Access Denied: No Token Provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_insecure_secret');
        req.user = decoded; // add user id & username to request
        next();
    } catch (error) {
        return res.status(httpStatus.FORBIDDEN).json({ message: "Invalid or Expired Token!" });
    }
};

export default authenticateToken;
