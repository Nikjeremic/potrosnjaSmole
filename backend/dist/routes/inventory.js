"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Material_1 = __importDefault(require("../models/Material"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all inventory
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const inventory = await Inventory_1.default.find().sort({ materialName: 1 });
        res.json(inventory);
    }
    catch (error) {
        next(error);
    }
});
// Get inventory by material ID
router.get('/material/:materialId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const inventory = await Inventory_1.default.findOne({ materialId: req.params.materialId });
        if (!inventory) {
            return res.status(404).json({
                message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen. Molimo kreirajte inventar za ovaj materijal.`
            });
        }
        res.json(inventory);
    }
    catch (error) {
        next(error);
    }
});
// Update inventory total weight (authenticated users)
router.put('/material/:materialId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('totalWeight').isNumeric().withMessage('Ukupna težina mora biti broj')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { totalWeight } = req.body;
        const inventory = await Inventory_1.default.findOne({ materialId: req.params.materialId });
        if (!inventory) {
            return res.status(404).json({
                message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen. Molimo kreirajte inventar za ovaj materijal.`
            });
        }
        inventory.totalWeight = totalWeight;
        inventory.lastUpdated = new Date();
        await inventory.save();
        res.json(inventory);
    }
    catch (error) {
        next(error);
    }
});
// Create inventory for material (authenticated users)
router.post('/material/:materialId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('totalWeight').isNumeric().withMessage('Ukupna težina mora biti broj')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { totalWeight } = req.body;
        // Check if material exists
        const material = await Material_1.default.findById(req.params.materialId);
        if (!material) {
            return res.status(400).json({ message: 'Materijal nije pronađen' });
        }
        // Check if inventory already exists
        const existingInventory = await Inventory_1.default.findOne({ materialId: req.params.materialId });
        if (existingInventory) {
            return res.status(400).json({ message: 'Inventar za ovaj materijal već postoji' });
        }
        const inventory = new Inventory_1.default({
            materialId: req.params.materialId,
            materialName: material.name,
            totalWeight,
            consumedWeight: 0,
            unit: material.unit
        });
        await inventory.save();
        res.status(201).json(inventory);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
// Delete inventory (authenticated users)
router.delete('/material/:materialId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const inventory = await Inventory_1.default.findOne({ materialId: req.params.materialId });
        if (!inventory) {
            return res.status(404).json({
                message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen.`
            });
        }
        await Inventory_1.default.deleteOne({ materialId: req.params.materialId });
        res.json({ message: 'Inventar je uspešno obrisan' });
    }
    catch (error) {
        next(error);
    }
});
// Delete inventory by ID (authenticated users)
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const inventory = await Inventory_1.default.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                message: `Inventar sa ID ${req.params.id} nije pronađen.`
            });
        }
        await Inventory_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inventar je uspešno obrisan' });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=inventory.js.map