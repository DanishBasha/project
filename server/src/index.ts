import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import incidentsRouter from './routes/incidents.js';
import presetsRouter from './routes/presets.js';
import { isSupabaseConfigured } from './services/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck & System Info Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI Cybersecurity Incident Response Super-Agent',
    version: '1.0.0',
    supabaseConnected: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  });
});

// Main API Endpoints
app.use('/api/incidents', incidentsRouter);
app.use('/api/presets', presetsRouter);

app.listen(PORT, () => {
  console.log('===========================================================');
  console.log(`🛡️  AI Cybersecurity Super-Agent SOC Server running on port ${PORT}`);
  console.log(`📡  API Base: http://localhost:${PORT}/api`);
  console.log(`🗄️   Supabase Online: ${isSupabaseConfigured ? 'ENABLED' : 'MOCK FALLBACK ACTIVE'}`);
  console.log('===========================================================');
});
