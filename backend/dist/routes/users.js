"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all users (admin only)
router.get('/', auth_1.authenticateToken, auth_1.authorizeAdmin, async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password');
        res.json(users);
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Create new user (admin only)
router.post('/', auth_1.authenticateToken, auth_1.authorizeAdmin, [
    (0, express_validator_1.body)('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('role').isIn(['admin', 'user']).withMessage('Role must be admin or user')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, password, firstName, lastName, role } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = new User_1.default({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role
        });
        await user.save();
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update user (admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.authorizeAdmin, [
    (0, express_validator_1.body)('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updateData = req.body;
        // Remove password from update data if present
        delete updateData.password;
        const user = await User_1.default.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            message: 'User updated successfully',
            user
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Reset user password (admin only)
router.put('/:id/reset-password', auth_1.authenticateToken, auth_1.authorizeAdmin, [
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { newPassword } = req.body;
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        const user = await User_1.default.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            message: 'Password reset successfully',
            user
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete user (admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent admin from deleting themselves
        if (req.user && req.user._id.toString() === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        const user = await User_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map