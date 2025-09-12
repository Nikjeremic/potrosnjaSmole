import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Consumption from '../models/Consumption';
import Resin from '../models/Resin';
import Material from '../models/Material';
import Inventory from '../models/Inventory';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Get all consumptions
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    let query = {};
    
    if (date) {
      query = { date };
    }
    
    const consumptions = await Consumption.find(query).sort({ date: -1, shift: 1 });
    res.json(consumptions);
  } catch (error) {
    next(error);
  }
});

// Get consumption by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consumption = await Consumption.findById(req.params.id);
    if (!consumption) {
      return res.status(404).json({ message: 'Zapis potrošnje nije pronađen' });
    }
    res.json(consumption);
  } catch (error) {
    next(error);
  }
});

// Create new consumption
router.post('/', 
  authenticateToken,
  [
    body('date').notEmpty().withMessage('Datum je obavezan'),
    body('shift').isIn(['first', 'second', 'third']).withMessage('Smena mora biti first, second ili third'),
    body('employeeName').notEmpty().withMessage('Ime zaposlenog je obavezno'),
    body('resinId').notEmpty().withMessage('ID sarze je obavezan'),
    body('usageCount').isNumeric().withMessage('Broj veziva mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { date, shift, employeeName, resinId, usageCount } = req.body;

      // Get resin details
      const resin = await Resin.findById(resinId);
      if (!resin) {
        return res.status(400).json({ message: 'Sarza nije pronađena' });
      }

      // Get material details
      const material = await Material.findById(resin.materialId);
      if (!material) {
        return res.status(400).json({ message: 'Materijal nije pronađen' });
      }

      const totalConsumption = resin.weight * usageCount;

      // Check if there's enough material available
      const inventory = await Inventory.findOne({ materialId: material._id });
      if (!inventory) {
        return res.status(400).json({ 
          message: `Inventar za materijal "${material.name}" nije pronađen. Molimo kreirajte inventar za ovaj materijal pre dodavanja potrošnje.` 
        });
      }

      if (inventory.availableWeight < totalConsumption) {
        return res.status(400).json({ 
          message: `Nedovoljno materijala. Dostupno: ${inventory.availableWeight}kg, Potrebno: ${totalConsumption}kg` 
        });
      }

      // Create consumption record
      const consumption = new Consumption({
        date,
        shift,
        employeeName,
        resinId,
        resinName: resin.name,
        materialId: material._id,
        materialName: material.name,
        resinWeight: resin.weight,
        usageCount,
        totalConsumption
      });

      await consumption.save();

      // Update inventory
      inventory.consumedWeight += totalConsumption;
      inventory.lastUpdated = new Date();
      await inventory.save();

      res.status(201).json(consumption);
    } catch (error) {
      next(error);
    }
  }
);

// Update consumption
router.put('/:id', 
  authenticateToken,
  [
    body('date').optional().notEmpty().withMessage('Datum ne sme biti prazan'),
    body('shift').optional().isIn(['first', 'second', 'third']).withMessage('Smena mora biti first, second ili third'),
    body('employeeName').optional().notEmpty().withMessage('Ime zaposlenog ne sme biti prazno'),
    body('resinId').optional().notEmpty().withMessage('ID sarze je obavezan'),
    body('usageCount').optional().isNumeric().withMessage('Broj veziva mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const consumption = await Consumption.findById(req.params.id);
      if (!consumption) {
        return res.status(404).json({ message: 'Zapis potrošnje nije pronađen' });
      }

      const oldTotalConsumption = consumption.totalConsumption;

      // Update fields
      if (req.body.date) consumption.date = req.body.date;
      if (req.body.shift) consumption.shift = req.body.shift;
      if (req.body.employeeName) consumption.employeeName = req.body.employeeName;
      if (req.body.usageCount !== undefined) consumption.usageCount = req.body.usageCount;

      if (req.body.resinId) {
        const resin = await Resin.findById(req.body.resinId);
        if (!resin) {
          return res.status(400).json({ message: 'Sarza nije pronađena' });
        }
        consumption.resinId = (resin._id as any).toString();
        consumption.resinName = resin.name;
        consumption.materialId = resin.materialId;
        consumption.materialName = resin.materialName;
        consumption.resinWeight = resin.weight;
      }

      consumption.totalConsumption = consumption.resinWeight * consumption.usageCount;

      // Check if there's enough material available (considering the change)
      const inventory = await Inventory.findOne({ materialId: consumption.materialId });
      if (!inventory) {
        return res.status(400).json({ 
          message: `Inventar za materijal "${consumption.materialName}" nije pronađen. Molimo kreirajte inventar za ovaj materijal pre dodavanja potrošnje.` 
        });
      }

      const newConsumption = consumption.totalConsumption;
      const availableAfterOldConsumption = inventory.availableWeight + oldTotalConsumption;
      
      if (availableAfterOldConsumption < newConsumption) {
        return res.status(400).json({ 
          message: `Nedovoljno materijala. Dostupno: ${availableAfterOldConsumption}kg, Potrebno: ${newConsumption}kg` 
        });
      }

      await consumption.save();

      // Update inventory
      inventory.consumedWeight = inventory.consumedWeight - oldTotalConsumption + newConsumption;
      inventory.lastUpdated = new Date();
      await inventory.save();

      res.json(consumption);
    } catch (error) {
      next(error);
    }
  }
);

// Delete consumption
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consumption = await Consumption.findById(req.params.id);
    if (!consumption) {
      return res.status(404).json({ message: 'Zapis potrošnje nije pronađen' });
    }

    // Update inventory (add back the consumed amount)
    const inventory = await Inventory.findOne({ materialId: consumption.materialId });
    if (inventory) {
      inventory.consumedWeight -= consumption.totalConsumption;
      inventory.lastUpdated = new Date();
      await inventory.save();
    }

    await Consumption.findByIdAndDelete(req.params.id);
    res.json({ message: 'Zapis potrošnje je uspešno obrisan' });
  } catch (error) {
    next(error);
  }
});

export default router;
