import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Resin from '../models/Resin';
import Material from '../models/Material';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all resins (sarze)
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resins = await Resin.find().sort({ name: 1 });
    res.json(resins);
  } catch (error) {
    next(error);
  }
});

// Get resin by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resin = await Resin.findById(req.params.id);
    if (!resin) {
      return res.status(404).json({ message: 'Sarza nije pronađena' });
    }
    res.json(resin);
  } catch (error) {
    next(error);
  }
});

// Create new resin (sarza) (authenticated users)
router.post('/', 
  authenticateToken, 
  [
    body('name').notEmpty().withMessage('Naziv sarze je obavezan'),
    body('materialId').notEmpty().withMessage('ID materijala je obavezan'),
    body('weight').isNumeric().withMessage('Težina mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, materialId, weight } = req.body;

      // Check if material exists
      const material = await Material.findById(materialId);
      if (!material) {
        return res.status(400).json({ message: 'Materijal nije pronađen' });
      }

      // Check if resin already exists
      const existingResin = await Resin.findOne({ name });
      if (existingResin) {
        return res.status(400).json({ message: 'Sarza sa ovim nazivom već postoji' });
      }

      const resin = new Resin({
        name,
        materialId,
        materialName: material.name,
        weight
      });

      await resin.save();
      res.status(201).json(resin);
    } catch (error) {
      next(error);
    }
  }
);

// Update resin (sarza) (authenticated users)
router.put('/:id', 
  authenticateToken, 
  [
    body('name').optional().notEmpty().withMessage('Naziv sarze ne sme biti prazan'),
    body('materialId').optional().notEmpty().withMessage('ID materijala je obavezan'),
    body('weight').optional().isNumeric().withMessage('Težina mora biti broj')
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, materialId, weight } = req.body;
      const resin = await Resin.findById(req.params.id);

      if (!resin) {
        return res.status(404).json({ message: 'Sarza nije pronađena' });
      }

      if (name) resin.name = name;
      if (weight !== undefined) resin.weight = weight;
      
      if (materialId) {
        // Check if material exists
        const material = await Material.findById(materialId);
        if (!material) {
          return res.status(400).json({ message: 'Materijal nije pronađen' });
        }
        resin.materialId = materialId;
        resin.materialName = material.name;
      }

      await resin.save();
      res.json(resin);
    } catch (error) {
      next(error);
    }
  }
);

// Delete resin (sarza) (authenticated users)
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resin = await Resin.findById(req.params.id);
    if (!resin) {
      return res.status(404).json({ message: 'Sarza nije pronađena' });
    }

    await Resin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sarza je uspešno obrisana' });
  } catch (error) {
    next(error);
  }
});

export default router;
