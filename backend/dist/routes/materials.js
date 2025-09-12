"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Material_1 = __importDefault(require("../models/Material"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const auth_1 = require("../middleware/auth");
const Resin_1 = __importDefault(require("../models/Resin"));
const Consumption_1 = __importDefault(require("../models/Consumption"));
const router = express_1.default.Router();
// Get all materials
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const materials = await Material_1.default.find()
            .populate('createdBy', 'firstName lastName username')
            .populate('updatedBy', 'firstName lastName username')
            .sort({ name: 1 });
        res.json(materials);
    }
    catch (error) {
        next(error);
    }
});
// Get material by ID
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const material = await Material_1.default.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Materijal nije pronađen' });
        }
        res.json(material);
    }
    catch (error) {
        next(error);
    }
});
// Create new material (authenticated users)
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Naziv materijala je obavezan'),
    (0, express_validator_1.body)('totalWeight').isNumeric().withMessage('Ukupna težina mora biti broj'),
    (0, express_validator_1.body)('unit').optional().isString().withMessage('Jedinica mora biti string')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, totalWeight, unit = 'kg' } = req.body;
        // Check if material already exists
        const existingMaterial = await Material_1.default.findOne({ name });
        if (existingMaterial) {
            return res.status(400).json({ message: 'Materijal sa ovim nazivom već postoji' });
        }
        const material = new Material_1.default({
            name,
            totalWeight,
            consumedWeight: 0,
            unit,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });
        await material.save();
        // Automatically create inventory for the new material
        try {
            const inventory = new Inventory_1.default({
                materialId: material._id,
                materialName: material.name,
                totalWeight: material.totalWeight,
                consumedWeight: 0,
                unit: material.unit
            });
            await inventory.save();
        }
        catch (inventoryError) {
            console.error('Failed to create inventory for material:', inventoryError);
            // Don't fail the whole operation if inventory creation fails
        }
        res.status(201).json(material);
    }
    catch (error) {
        next(error);
    }
});
// Update material (authenticated users only)
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Naziv materijala ne sme biti prazan'),
    (0, express_validator_1.body)('totalWeight').optional().isNumeric().withMessage('Ukupna težina mora biti broj'),
    (0, express_validator_1.body)('unit').optional().isString().withMessage('Jedinica mora biti string')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, totalWeight, unit } = req.body;
        const material = await Material_1.default.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Materijal nije pronađen' });
        }
        // Update material fields
        if (name)
            material.name = name;
        if (totalWeight !== undefined)
            material.totalWeight = totalWeight;
        if (unit)
            material.unit = unit;
        material.updatedBy = req.user._id;
        await material.save();
        // IMPORTANT: Update associated inventory
        const inventory = await Inventory_1.default.findOne({ materialId: req.params.id });
        if (inventory) {
            if (name)
                inventory.materialName = name;
            if (totalWeight !== undefined)
                inventory.totalWeight = totalWeight;
            if (unit)
                inventory.unit = unit;
            inventory.lastUpdated = new Date();
            await inventory.save();
        }
        res.json(material);
    }
    catch (error) {
        next(error);
    }
});
// Delete material (authenticated users only)
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const material = await Material_1.default.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: 'Materijal nije pronađen' });
        }
        // Check if material is used in resins
        const resinsUsingMaterial = await Resin_1.default.find({ materialId: req.params.id });
        if (resinsUsingMaterial.length > 0) {
            return res.status(400).json({
                message: `Materijal se koristi u ${resinsUsingMaterial.length} sarza(i). Prvo obrišite sarze koje koriste ovaj materijal.`
            });
        }
        // Check if material is used in consumption records
        const consumptionsUsingMaterial = await Consumption_1.default.find({ materialId: req.params.id });
        if (consumptionsUsingMaterial.length > 0) {
            return res.status(400).json({
                message: `Materijal se koristi u ${consumptionsUsingMaterial.length} zapisa potrošnje. Prvo obrišite zapise potrošnje koji koriste ovaj materijal.`
            });
        }
        // Delete associated inventory first
        await Inventory_1.default.deleteOne({ materialId: req.params.id });
        // Then delete the material
        await Material_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Materijal je uspešno obrisan' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=materials.js.map