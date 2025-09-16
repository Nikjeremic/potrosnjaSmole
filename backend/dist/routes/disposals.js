"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Disposal_1 = __importDefault(require("../models/Disposal"));
const Material_1 = __importDefault(require("../models/Material"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all disposals
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const disposals = await Disposal_1.default.find()
            .populate('materialId', 'name unit')
            .populate('createdBy', 'firstName lastName username')
            .sort({ disposalDate: -1, disposalTime: -1 });
        res.json(disposals);
    }
    catch (error) {
        next(error);
    }
});
// Get disposals by material ID
router.get('/material/:materialId', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const disposals = await Disposal_1.default.find({ materialId: req.params.materialId })
            .populate('materialId', 'name unit')
            .populate('createdBy', 'firstName lastName username')
            .sort({ disposalDate: -1, disposalTime: -1 });
        res.json(disposals);
    }
    catch (error) {
        next(error);
    }
});
// Get disposals by reason
router.get('/reason/:reason', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const disposals = await Disposal_1.default.find({ reason: req.params.reason })
            .populate('materialId', 'name unit')
            .populate('createdBy', 'firstName lastName username')
            .sort({ disposalDate: -1, disposalTime: -1 });
        res.json(disposals);
    }
    catch (error) {
        next(error);
    }
});
// Get disposal by ID
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const disposal = await Disposal_1.default.findById(req.params.id)
            .populate('materialId', 'name unit')
            .populate('createdBy', 'firstName lastName username');
        if (!disposal) {
            return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
        }
        res.json(disposal);
    }
    catch (error) {
        next(error);
    }
});
// Create new disposal
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('materialId').notEmpty().withMessage('Materijal je obavezan'),
    (0, express_validator_1.body)('disposalDate').notEmpty().withMessage('Datum rashodovanja je obavezan'),
    (0, express_validator_1.body)('disposalTime').notEmpty().withMessage('Vreme rashodovanja je obavezno'),
    (0, express_validator_1.body)('reason').notEmpty().withMessage('Razlog rashodovanja je obavezan'),
    (0, express_validator_1.body)('quantity').isNumeric().withMessage('Količina mora biti broj'),
    (0, express_validator_1.body)('unit').optional().isString().withMessage('Jedinica mora biti string')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { materialId, disposalDate, disposalTime, reason, quantity, unit = 'kg', description, location } = req.body;
        // Check if material exists
        const material = await Material_1.default.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: 'Materijal nije pronađen' });
        }
        // Check if material has enough quantity
        if (material.availableWeight < quantity) {
            return res.status(400).json({
                message: `Nedovoljno materijala. Dostupno: ${material.availableWeight} ${material.unit}, pokušavate rashodovati: ${quantity} ${unit}`
            });
        }
        // Create disposal
        const disposal = new Disposal_1.default({
            materialId,
            materialName: material.name,
            disposalDate: new Date(disposalDate),
            disposalTime,
            reason,
            quantity,
            unit,
            description: description || '',
            location: location || '',
            createdBy: req.user._id
        });
        await disposal.save();
        // Update material's consumed weight - refresh from database first
        const updatedMaterial = await Material_1.default.findById(materialId);
        if (updatedMaterial) {
            updatedMaterial.consumedWeight += quantity;
            updatedMaterial.updatedBy = req.user._id;
            await updatedMaterial.save();
        }
        // Update inventory
        const inventory = await Inventory_1.default.findOne({ materialId });
        if (inventory) {
            inventory.consumedWeight += quantity;
            inventory.lastUpdated = new Date();
            await inventory.save();
        }
        // Populate the response
        await disposal.populate([
            { path: 'materialId', select: 'name unit' },
            { path: 'createdBy', select: 'firstName lastName username' }
        ]);
        res.status(201).json(disposal);
    }
    catch (error) {
        next(error);
    }
});
// Update disposal
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('materialId').optional().notEmpty().withMessage('Materijal ne sme biti prazan'),
    (0, express_validator_1.body)('disposalDate').optional().notEmpty().withMessage('Datum rashodovanja ne sme biti prazan'),
    (0, express_validator_1.body)('disposalTime').optional().notEmpty().withMessage('Vreme rashodovanja ne sme biti prazno'),
    (0, express_validator_1.body)('reason').optional().notEmpty().withMessage('Razlog rashodovanja ne sme biti prazan'),
    (0, express_validator_1.body)('quantity').optional().isNumeric().withMessage('Količina mora biti broj'),
    (0, express_validator_1.body)('unit').optional().isString().withMessage('Jedinica mora biti string')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const disposal = await Disposal_1.default.findById(req.params.id);
        if (!disposal) {
            return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
        }
        const oldQuantity = disposal.quantity;
        const oldMaterialId = disposal.materialId;
        // Update disposal fields
        const { materialId, disposalDate, disposalTime, reason, quantity, unit, description, location } = req.body;
        if (materialId)
            disposal.materialId = materialId;
        if (disposalDate)
            disposal.disposalDate = new Date(disposalDate);
        if (disposalTime)
            disposal.disposalTime = disposalTime;
        if (reason)
            disposal.reason = reason;
        if (quantity !== undefined)
            disposal.quantity = quantity;
        if (unit)
            disposal.unit = unit;
        if (description !== undefined)
            disposal.description = description;
        if (location !== undefined)
            disposal.location = location;
        await disposal.save();
        // Update material weights if quantity changed
        if (quantity !== undefined && quantity !== oldQuantity) {
            const quantityDiff = quantity - oldQuantity;
            // Update old material
            const oldMaterial = await Material_1.default.findById(oldMaterialId);
            if (oldMaterial) {
                oldMaterial.consumedWeight += quantityDiff;
                oldMaterial.updatedBy = req.user._id;
                await oldMaterial.save();
            }
            // Update old inventory
            const oldInventory = await Inventory_1.default.findOne({ materialId: oldMaterialId });
            if (oldInventory) {
                oldInventory.consumedWeight += quantityDiff;
                oldInventory.lastUpdated = new Date();
                await oldInventory.save();
            }
            // If material changed, update new material
            if (materialId && materialId.toString() !== oldMaterialId.toString()) {
                const newMaterial = await Material_1.default.findById(materialId);
                if (newMaterial) {
                    newMaterial.consumedWeight += quantity;
                    newMaterial.updatedBy = req.user._id;
                    await newMaterial.save();
                }
                const newInventory = await Inventory_1.default.findOne({ materialId });
                if (newInventory) {
                    newInventory.consumedWeight += quantity;
                    newInventory.lastUpdated = new Date();
                    await newInventory.save();
                }
            }
        }
        // Populate the response
        await disposal.populate([
            { path: 'materialId', select: 'name unit' },
            { path: 'createdBy', select: 'firstName lastName username' }
        ]);
        res.json(disposal);
    }
    catch (error) {
        next(error);
    }
});
// Delete disposal
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const disposal = await Disposal_1.default.findById(req.params.id);
        if (!disposal) {
            return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
        }
        // Update material's consumed weight (subtract the quantity)
        const material = await Material_1.default.findById(disposal.materialId);
        if (material) {
            material.consumedWeight -= disposal.quantity;
            material.updatedBy = req.user._id;
            await material.save();
        }
        // Update inventory
        const inventory = await Inventory_1.default.findOne({ materialId: disposal.materialId });
        if (inventory) {
            inventory.consumedWeight -= disposal.quantity;
            inventory.lastUpdated = new Date();
            await inventory.save();
        }
        await Disposal_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rashodovanje je uspešno obrisano' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=disposals.js.map