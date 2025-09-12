"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/resins', resins_1.default);
app.use('/api/consumption', consumption_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/materials', materials_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running!' });
});
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGO_URI || '')
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map