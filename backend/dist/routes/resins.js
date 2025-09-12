"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Resin_1 = __importDefault(require("../models/Resin"));
const Material_1 = __importDefault(require("../models/Material"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all resins (sarze)
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const resins = await Resin_1.default.find().sort({ name: 1 });
        res.json(resins);
    }
    catch (error) {
        next(error);
    }
});
// Get resin by ID
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const resin = await Resin_1.default.findById(req.params.id);
        if (!resin) {
            return res.status(404).json({ message: 'Sarza nije pronađena' });
        }
        res.json(resin);
    }
    catch (error) {
        next(error);
    }
});
// Create new resin (sarza) (authenticated users)
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Naziv sarze je obavezan'),
    (0, express_validator_1.body)('materialId').notEmpty().withMessage('ID materijala je obavezan'),
    (0, express_validator_1.body)('weight').isNumeric().withMessage('Težina mora biti broj')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, materialId, weight } = req.body;
        // Check if material exists
        const material = await Material_1.default.findById(materialId);
        if (!material) {
            return res.status(400).json({ message: 'Materijal nije pronađen' });
        }
        // Check if resin already exists
        const existingResin = await Resin_1.default.findOne({ name });
        if (existingResin) {
            return res.status(400).json({ message: 'Sarza sa ovim nazivom već postoji' });
        }
        const resin = new Resin_1.default({
            name,
            materialId,
            materialName: material.name,
            weight
        });
        await resin.save();
        res.status(201).json(resin);
    }
    catch (error) {
        next(error);
    }
});
// Update resin (sarza) (authenticated users)
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Naziv sarze ne sme biti prazan'),
    (0, express_validator_1.body)('materialId').optional().notEmpty().withMessage('ID materijala je obavezan'),
    (0, express_validator_1.body)('weight').optional().isNumeric().withMessage('Težina mora biti broj')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, materialId, weight } = req.body;
        const resin = await Resin_1.default.findById(req.params.id);
        if (!resin) {
            return res.status(404).json({ message: 'Sarza nije pronađena' });
        }
        if (name)
            resin.name = name;
        if (weight !== undefined)
            resin.weight = weight;
        if (materialId) {
            // Check if material exists
            const material = await Material_1.default.findById(materialId);
            if (!material) {
                return res.status(400).json({ message: 'Materijal nije pronađen' });
            }
            resin.materialId = materialId;
            resin.materialName = material.name;
        }
        await resin.save();
        res.json(resin);
    }
    catch (error) {
        next(error);
    }
});
// Delete resin (sarza) (authenticated users)
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const resin = await Resin_1.default.findById(req.params.id);
        if (!resin) {
            return res.status(404).json({ message: 'Sarza nije pronađena' });
        }
        await Resin_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sarza je uspešno obrisana' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=resins.js.map