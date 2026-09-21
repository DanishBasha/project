import { Router, Request, Response } from 'express';
import { dbService } from '../services/supabaseClient.js';
import { superAgent } from '../agents/superAgent.js';

const router = Router();

// GET /api/incidents - List all incidents
router.get('/', async (_req: Request, res: Response) => {
  try {
    const incidents = await dbService.getIncidents();
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/incidents/:id - Get complete dossier with multi-agent execution traces
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dossier = await dbService.getIncidentDossier(req.params.id);
    if (!dossier) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, data: dossier });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/incidents/analyze - Super Agent Orchestration Entrypoint
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { rawLogs, title, sourceSummary } = req.body;
    if (!rawLogs || typeof rawLogs !== 'string' || rawLogs.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'rawLogs string is required' });
    }

    console.log(`[API] Received incident triage request (${rawLogs.length} characters)`);
    const dossier = await superAgent.orchestrateIncidentTriage({
      rawLogs,
      title,
      sourceSummary
    });

    res.status(201).json({
      success: true,
      message: 'Super Agent successfully completed multi-agent incident triage',
      data: dossier
    });
  } catch (err: any) {
    console.error('[API] Super Agent orchestration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/incidents/:id/status - Update incident status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    await dbService.updateIncidentStatus(req.params.id, status);
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/incidents/recommendations/:recId/status - Update recommendation status
router.patch('/recommendations/:recId/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    await dbService.updateRecommendationStatus(req.params.recId, status);
    res.json({ success: true, message: `Recommendation status updated to ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
