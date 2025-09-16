"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const resins_1 = __importDefault(require("./routes/resins"));
const consumption_1 = __importDefault(require("./routes/consumption"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const materials_1 = __importDefault(require("./routes/materials"));
// Load environment variables
dotenv_1.default.config();
exports.JWT_SECRET = process.env.JWT_SECRET || "potrosnja-smole-jwt-secret-key-2024-production-secure-token-key";
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            'https://stock.eightcode.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        ];
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/resins', resins_1.default);
app.use('/api/consumption', consumption_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/materials', materials_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            message: 'CORS policy violation',
            origin: req.headers.origin,
            allowedOrigins: corsOptions.origin
        });
    }
    else {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://niksys97_mngdb_user:ViMBLXmhnOd9Sc34@potrosnjasmole.jmojzq5.mongodb.net/?retryWrites=true&w=majority&appName=potrosnjaSmole';
mongoose_1.default.connect(mongoUri)
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`JWT Secret configured: ${exports.JWT_SECRET ? 'Yes' : 'No'}`);
});
//# sourceMappingURL=server.js.map