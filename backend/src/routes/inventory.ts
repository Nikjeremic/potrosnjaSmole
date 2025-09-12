import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Inventory from '../models/Inventory';
import Material from '../models/Material';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Get all inventory
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inventory = await Inventory.find().sort({ materialName: 1 });
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// Get inventory by material ID
router.get('/material/:materialId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inventory = await Inventory.findOne({ materialId: req.params.materialId });
    if (!inventory) {
      return res.status(404).json({ 
        message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen. Molimo kreirajte inventar za ovaj materijal.` 
      });
    }
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// Update inventory total weight (authenticated users)
router.put('/material/:materialId', 
  authenticateToken, 
  [
    body('totalWeight').isNumeric().withMessage('Ukupna težina mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { totalWeight } = req.body;
      const inventory = await Inventory.findOne({ materialId: req.params.materialId });

      if (!inventory) {
        return res.status(404).json({ 
          message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen. Molimo kreirajte inventar za ovaj materijal.` 
        });
      }

      inventory.totalWeight = totalWeight;
      inventory.lastUpdated = new Date();
      await inventory.save();

      res.json(inventory);
    } catch (error) {
      next(error);
    }
  }
);

// Create inventory for material (authenticated users)
router.post('/material/:materialId', 
  authenticateToken, 
  [
    body('totalWeight').isNumeric().withMessage('Ukupna težina mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { totalWeight } = req.body;
      
      // Check if material exists
      const material = await Material.findById(req.params.materialId);
      if (!material) {
        return res.status(400).json({ message: 'Materijal nije pronađen' });
      }

      // Check if inventory already exists
      const existingInventory = await Inventory.findOne({ materialId: req.params.materialId });
      if (existingInventory) {
        return res.status(400).json({ message: 'Inventar za ovaj materijal već postoji' });
      }

      const inventory = new Inventory({
        materialId: req.params.materialId,
        materialName: material.name,
        totalWeight,
        consumedWeight: 0,
        unit: material.unit
      });

      await inventory.save();
      res.status(201).json(inventory);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

// Delete inventory (authenticated users)
router.delete('/material/:materialId', 
  authenticateToken, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventory = await Inventory.findOne({ materialId: req.params.materialId });

      if (!inventory) {
        return res.status(404).json({ 
          message: `Inventar za materijal sa ID ${req.params.materialId} nije pronađen.` 
        });
      }

      await Inventory.deleteOne({ materialId: req.params.materialId });
      res.json({ message: 'Inventar je uspešno obrisan' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete inventory by ID (authenticated users)
router.delete('/:id', 
  authenticateToken, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ 
          message: `Inventar sa ID ${req.params.id} nije pronađen.` 
        });
      }

      await Inventory.findByIdAndDelete(req.params.id);
      res.json({ message: 'Inventar je uspešno obrisan' });
    } catch (error) {
      next(error);
    }
  }
);
