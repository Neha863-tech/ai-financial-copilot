#!/usr/bin/env node

/**
 * FinSight AI — Unified All-In-One Runner
 * Launches Node.js Backend (with auto-spawned FastAPI AI Microservice) and React Frontend in a single terminal.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[36m%s\x1b[0m', '===========================================================');
console.log('\x1b[1m\x1b[32m%s\x1b[0m', '   FinSight AI — Starting Unified Full-Stack Environment');
console.log('\x1b[36m%s\x1b[0m', '===========================================================');
console.log('• Frontend:           http://localhost:5173');
console.log('• Backend API:        http://localhost:5000');
console.log('• AI Microservice:    http://localhost:8001 (Docs: /docs)');
console.log('• Database:           PostgreSQL (Connected via Prisma)');
console.log('-----------------------------------------------------------\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Launch Backend (which auto-spawns Python FastAPI on port 8001)
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'pipe',
  shell: isWin,
});

backend.stdout.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('\x1b[34m[BACKEND]\x1b[0m ' + line);
});

backend.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('\x1b[33m[BACKEND]\x1b[0m ' + line);
});

// 2. Launch Frontend
const frontend = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: frontendDir,
  stdio: 'pipe',
  shell: isWin,
});

frontend.stdout.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('\x1b[35m[FRONTEND]\x1b[0m ' + line);
});

frontend.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line) console.log('\x1b[35m[FRONTEND]\x1b[0m ' + line);
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down FinSight AI full-stack services...');
  if (isWin) {
    if (backend.pid) spawn('taskkill', ['/pid', String(backend.pid), '/f', '/t'], { stdio: 'ignore' });
    if (frontend.pid) spawn('taskkill', ['/pid', String(frontend.pid), '/f', '/t'], { stdio: 'ignore' });
  } else {
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
