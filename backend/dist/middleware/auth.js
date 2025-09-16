"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token je potreban' });
    }
    jsonwebtoken_1.default.verify(token, server_1.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Nevažeći token' });
        }
        // Map userId from token to _id for consistency
        req.user = {
            _id: decoded.userId,
            role: decoded.role
        };
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeAdmin = (req, res, next) => {
    const user = req.user;
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Pristup odbijen. Potrebne su administratorske privilegije.' });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
//# sourceMappingURL=auth.js.map