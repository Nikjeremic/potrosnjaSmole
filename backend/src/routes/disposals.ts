import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Disposal from '../models/Disposal';
import Material from '../models/Material';
import Inventory from '../models/Inventory';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all disposals
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disposals = await Disposal.find()
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username')
      .sort({ disposalDate: -1, disposalTime: -1 });
    res.json(disposals);
  } catch (error) {
    next(error);
  }
});

// Get disposals by material ID
router.get('/material/:materialId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disposals = await Disposal.find({ materialId: req.params.materialId })
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username')
      .sort({ disposalDate: -1, disposalTime: -1 });
    res.json(disposals);
  } catch (error) {
    next(error);
  }
});

// Get disposals by reason
router.get('/reason/:reason', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disposals = await Disposal.find({ reason: req.params.reason })
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username')
      .sort({ disposalDate: -1, disposalTime: -1 });
    res.json(disposals);
  } catch (error) {
    next(error);
  }
});

// Get disposal by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disposal = await Disposal.findById(req.params.id)
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username');
    if (!disposal) {
      return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
    }
    res.json(disposal);
  } catch (error) {
    next(error);
  }
});

// Create new disposal
router.post('/', 
  authenticateToken, 
  [
    body('materialId').notEmpty().withMessage('Materijal je obavezan'),
    body('disposalDate').notEmpty().withMessage('Datum rashodovanja je obavezan'),
    body('disposalTime').notEmpty().withMessage('Vreme rashodovanja je obavezno'),
    body('reason').notEmpty().withMessage('Razlog rashodovanja je obavezan'),
    body('quantity').isNumeric().withMessage('Količina mora biti broj'),
    body('unit').optional().isString().withMessage('Jedinica mora biti string')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { materialId, disposalDate, disposalTime, reason, quantity, unit = 'kg', description, location } = req.body;

      // Check if material exists
      const material = await Material.findById(materialId);
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
      const disposal = new Disposal({
        materialId,
        materialName: material.name,
        disposalDate: new Date(disposalDate),
        disposalTime,
        reason,
        quantity,
        unit,
        description: description || '',
        location: location || '',
        createdBy: req.user!._id
      });

      await disposal.save();

      // Update material's consumed weight - refresh from database first
      const updatedMaterial = await Material.findById(materialId);
      if (updatedMaterial) {
        updatedMaterial.consumedWeight += quantity;
        updatedMaterial.updatedBy = req.user!._id;
        await updatedMaterial.save();
      }

      // Update inventory
      const inventory = await Inventory.findOne({ materialId });
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
    } catch (error) {
      next(error);
    }
  }
);

// Update disposal
router.put('/:id', 
  authenticateToken,
  [
    body('materialId').optional().notEmpty().withMessage('Materijal ne sme biti prazan'),
    body('disposalDate').optional().notEmpty().withMessage('Datum rashodovanja ne sme biti prazan'),
    body('disposalTime').optional().notEmpty().withMessage('Vreme rashodovanja ne sme biti prazno'),
    body('reason').optional().notEmpty().withMessage('Razlog rashodovanja ne sme biti prazan'),
    body('quantity').optional().isNumeric().withMessage('Količina mora biti broj'),
    body('unit').optional().isString().withMessage('Jedinica mora biti string')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const disposal = await Disposal.findById(req.params.id);
      if (!disposal) {
        return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
      }

      const oldQuantity = disposal.quantity;
      const oldMaterialId = disposal.materialId;

      // Update disposal fields
      const { materialId, disposalDate, disposalTime, reason, quantity, unit, description, location } = req.body;
      
      if (materialId) disposal.materialId = materialId;
      if (disposalDate) disposal.disposalDate = new Date(disposalDate);
      if (disposalTime) disposal.disposalTime = disposalTime;
      if (reason) disposal.reason = reason;
      if (quantity !== undefined) disposal.quantity = quantity;
      if (unit) disposal.unit = unit;
      if (description !== undefined) disposal.description = description;
      if (location !== undefined) disposal.location = location;

      await disposal.save();

      // Update material weights if quantity changed
      if (quantity !== undefined && quantity !== oldQuantity) {
        const quantityDiff = quantity - oldQuantity;
        
        // Update old material
        const oldMaterial = await Material.findById(oldMaterialId);
        if (oldMaterial) {
          oldMaterial.consumedWeight += quantityDiff;
          oldMaterial.updatedBy = req.user!._id;
          await oldMaterial.save();
        }

        // Update old inventory
        const oldInventory = await Inventory.findOne({ materialId: oldMaterialId });
        if (oldInventory) {
          oldInventory.consumedWeight += quantityDiff;
          oldInventory.lastUpdated = new Date();
          await oldInventory.save();
        }

        // If material changed, update new material
        if (materialId && materialId.toString() !== oldMaterialId.toString()) {
          const newMaterial = await Material.findById(materialId);
          if (newMaterial) {
            newMaterial.consumedWeight += quantity;
            newMaterial.updatedBy = req.user!._id;
            await newMaterial.save();
          }

          const newInventory = await Inventory.findOne({ materialId });
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
    } catch (error) {
      next(error);
    }
  }
);

// Delete disposal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const disposal = await Disposal.findById(req.params.id);
    if (!disposal) {
      return res.status(404).json({ message: 'Rashodovanje nije pronađeno' });
    }

    // Update material's consumed weight (subtract the quantity)
    const material = await Material.findById(disposal.materialId);
    if (material) {
      material.consumedWeight -= disposal.quantity;
      material.updatedBy = req.user!._id;
      await material.save();
    }

    // Update inventory
    const inventory = await Inventory.findOne({ materialId: disposal.materialId });
    if (inventory) {
      inventory.consumedWeight -= disposal.quantity;
      inventory.lastUpdated = new Date();
      await inventory.save();
    }

    await Disposal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rashodovanje je uspešno obrisano' });
  } catch (error) {
    next(error);
  }
});

export default router;
