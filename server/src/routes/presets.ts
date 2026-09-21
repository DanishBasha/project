import { Router, Request, Response } from 'express';
import { ATTACK_PRESETS } from '../sample_data/attackPresets.js';

const router = Router();

// GET /api/presets - Return available realistic incident simulation templates
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: ATTACK_PRESETS.length,
    data: ATTACK_PRESETS
  });
});

export default router;
