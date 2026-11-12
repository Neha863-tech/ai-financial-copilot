import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const aiDir = path.resolve(__dirname, '../../../ai-integration');

let aiProcess = null;

async function isAiServiceLive(url = 'http://localhost:8001/health') {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function startAiMicroservice() {
  const isAlreadyRunning = await isAiServiceLive();
  if (isAlreadyRunning) {
    logger.info('[AI-PROCESS] FastAPI microservice is already active on port 8001');
    return;
  }

  logger.info(`[AI-PROCESS] Auto-launching Python FastAPI microservice from ${aiDir}...`);

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const args = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001'];

  try {
    aiProcess = spawn(pythonCmd, args, {
      cwd: aiDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      shell: process.platform === 'win32',
    });

    aiProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) logger.info(`[FastAPI] ${msg}`);
    });

    aiProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) logger.warn(`[FastAPI] ${msg}`);
    });

    aiProcess.on('error', (err) => {
      logger.error('[AI-PROCESS] Failed to spawn FastAPI microservice:', { error: err.message });
      aiProcess = null;
    });

    aiProcess.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        logger.warn(`[AI-PROCESS] FastAPI microservice process exited with code ${code} (${signal || 'none'})`);
      }
      aiProcess = null;
    });

    // Wait up to 6 seconds for FastAPI to report healthy
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isAiServiceLive()) {
        logger.info('✓ [AI-PROCESS] FastAPI microservice successfully linked and healthy on http://localhost:8001');
        return;
      }
    }
    logger.warn('[AI-PROCESS] FastAPI microservice started, awaiting first request.');
  } catch (error) {
    logger.error('[AI-PROCESS] Could not auto-start AI microservice:', { error: error.message });
  }
}

export function stopAiMicroservice() {
  if (aiProcess) {
    logger.info('[AI-PROCESS] Terminating managed FastAPI microservice process...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(aiProcess.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        aiProcess.kill('SIGTERM');
      }
    } catch {}
    aiProcess = null;
  }
}
