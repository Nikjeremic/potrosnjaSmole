import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Receipt from '../models/Receipt';
import Material from '../models/Material';
import Inventory from '../models/Inventory';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all receipts
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receipts = await Receipt.find()
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username')
      .sort({ receiptDate: -1, receiptTime: -1 });
    res.json(receipts);
  } catch (error) {
    next(error);
  }
});

// Get receipts by material ID
router.get('/material/:materialId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receipts = await Receipt.find({ materialId: req.params.materialId })
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username')
      .sort({ receiptDate: -1, receiptTime: -1 });
    res.json(receipts);
  } catch (error) {
    next(error);
  }
});

// Get receipt by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('materialId', 'name unit')
      .populate('createdBy', 'firstName lastName username');
    if (!receipt) {
      return res.status(404).json({ message: 'Prijemnica nije pronađena' });
    }
    res.json(receipt);
  } catch (error) {
    next(error);
  }
});

// Create new receipt
router.post('/', 
  authenticateToken, 
  [
    body('materialId').notEmpty().withMessage('Materijal je obavezan'),
    body('receiptDate').notEmpty().withMessage('Datum prijemnice je obavezan'),
    body('receiptTime').notEmpty().withMessage('Vreme prijemnice je obavezno'),
    body('transporter').notEmpty().withMessage('Prevoznik je obavezan'),
    body('quantity').isNumeric().withMessage('Količina mora biti broj'),
    body('unit').optional().isString().withMessage('Jedinica mora biti string')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { materialId, receiptDate, receiptTime, transporter, quantity, unit = 'kg', notes } = req.body;

      // Check if material exists
      const material = await Material.findById(materialId);
      if (!material) {
        return res.status(404).json({ message: 'Materijal nije pronađen' });
      }

      // Create receipt
      const receipt = new Receipt({
        materialId,
        materialName: material.name,
        receiptDate: new Date(receiptDate),
        receiptTime,
        transporter,
        quantity,
        unit,
        notes: notes || '',
        createdBy: req.user!._id
      });

      await receipt.save();

      // Update material's total weight - refresh from database first
      const updatedMaterial = await Material.findById(materialId);
      if (updatedMaterial) {
        updatedMaterial.totalWeight += quantity;
        updatedMaterial.updatedBy = req.user!._id;
        await updatedMaterial.save();
      }

      // Update inventory
      const inventory = await Inventory.findOne({ materialId });
      if (inventory) {
        inventory.totalWeight += quantity;
        inventory.lastUpdated = new Date();
        await inventory.save();
      }

      // Populate the response
      await receipt.populate([
        { path: 'materialId', select: 'name unit' },
        { path: 'createdBy', select: 'firstName lastName username' }
      ]);

      res.status(201).json(receipt);
    } catch (error) {
      next(error);
    }
  }
);

// Update receipt
router.put('/:id', 
  authenticateToken,
  [
    body('materialId').optional().notEmpty().withMessage('Materijal ne sme biti prazan'),
    body('receiptDate').optional().notEmpty().withMessage('Datum prijemnice ne sme biti prazan'),
    body('receiptTime').optional().notEmpty().withMessage('Vreme prijemnice ne sme biti prazno'),
    body('transporter').optional().notEmpty().withMessage('Prevoznik ne sme biti prazan'),
    body('quantity').optional().isNumeric().withMessage('Količina mora biti broj'),
    body('unit').optional().isString().withMessage('Jedinica mora biti string')
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await Receipt.findById(req.params.id);
      if (!receipt) {
        return res.status(404).json({ message: 'Prijemnica nije pronađena' });
      }

      const oldQuantity = receipt.quantity;
      const oldMaterialId = receipt.materialId;

      // Update receipt fields
      const { materialId, receiptDate, receiptTime, transporter, quantity, unit, notes } = req.body;
      
      if (materialId) receipt.materialId = materialId;
      if (receiptDate) receipt.receiptDate = new Date(receiptDate);
      if (receiptTime) receipt.receiptTime = receiptTime;
      if (transporter) receipt.transporter = transporter;
      if (quantity !== undefined) receipt.quantity = quantity;
      if (unit) receipt.unit = unit;
      if (notes !== undefined) receipt.notes = notes;

      await receipt.save();

      // Update material weights if quantity changed
      if (quantity !== undefined && quantity !== oldQuantity) {
        const quantityDiff = quantity - oldQuantity;
        
        // Update old material
        const oldMaterial = await Material.findById(oldMaterialId);
        if (oldMaterial) {
          oldMaterial.totalWeight += quantityDiff;
          oldMaterial.updatedBy = req.user!._id;
          await oldMaterial.save();
        }

        // Update old inventory
        const oldInventory = await Inventory.findOne({ materialId: oldMaterialId });
        if (oldInventory) {
          oldInventory.totalWeight += quantityDiff;
          oldInventory.lastUpdated = new Date();
          await oldInventory.save();
        }

        // If material changed, update new material
        if (materialId && materialId.toString() !== oldMaterialId.toString()) {
          const newMaterial = await Material.findById(materialId);
          if (newMaterial) {
            newMaterial.totalWeight += quantity;
            newMaterial.updatedBy = req.user!._id;
            await newMaterial.save();
          }

          const newInventory = await Inventory.findOne({ materialId });
          if (newInventory) {
            newInventory.totalWeight += quantity;
            newInventory.lastUpdated = new Date();
            await newInventory.save();
          }
        }
      }

      // Populate the response
      await receipt.populate([
        { path: 'materialId', select: 'name unit' },
        { path: 'createdBy', select: 'firstName lastName username' }
      ]);

      res.json(receipt);
    } catch (error) {
      next(error);
    }
  }
);

// Delete receipt
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Prijemnica nije pronađena' });
    }

    // Update material's total weight (subtract the quantity)
    const material = await Material.findById(receipt.materialId);
    if (material) {
      material.totalWeight -= receipt.quantity;
      material.updatedBy = req.user!._id;
      await material.save();
    }

    // Update inventory
    const inventory = await Inventory.findOne({ materialId: receipt.materialId });
    if (inventory) {
      inventory.totalWeight -= receipt.quantity;
      inventory.lastUpdated = new Date();
      await inventory.save();
    }

    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prijemnica je uspešno obrisana' });
  } catch (error) {
    next(error);
  }
});

export default router;
