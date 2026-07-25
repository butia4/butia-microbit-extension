#!/usr/bin/env node
// Run with: bun scripts/serve.ts
//           npx tsx scripts/serve.ts
//
// Automates the local dev loop documented in SIMULATOR.md:
//   1. Patch node_modules/pxt-microbit/built/target.js so the local editor
//      knows to open an iframe pointing at the botsim dev server.
//   2. Build the extension (produces built/binary.hex).
//   3. Start the local MakeCode editor (`pxt serve`).
//
// What this script can NOT automate (must be done manually):
//   - Start the botsim dev server yourself in another terminal, from the
//     sibling repo:
//       cd ../butia-botsim && npm run dev
//   - Once both servers are up (see SIMULATOR.md steps 4-5): import
//     built/binary.hex as a project via Extensions -> Import File, and add
//     ?simxdev to the editor URL.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync, ChildProcess } from 'node:child_process';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const BOTSIM_DEV_URL = 'http://localhost:5173';
const SIM_CHANNEL = 'butia4/butia-microbit-extension';

function patchTargetJs(): void {
    const targetJsPath = join(ROOT, 'node_modules/pxt-microbit/built/target.js');
    if (!existsSync(targetJsPath)) {
        console.warn(`[serve] ${targetJsPath} not found — run "npm install" first. Skipping target.js patch.`);
        return;
    }
    const content = readFileSync(targetJsPath, 'utf-8');
    const patchedEntry = `"testSimulatorExtensions":{"${SIM_CHANNEL}":{"devUrl":"${BOTSIM_DEV_URL}"}}`;
    if (content.includes(patchedEntry)) {
        console.log('[serve] target.js already patched for botsim dev.');
        return;
    }
    if (!content.includes('"testSimulatorExtensions":{}')) {
        console.warn('[serve] Could not find an untouched "testSimulatorExtensions":{} in target.js — leaving it as-is (it may already be patched differently, or the pxt-microbit target version changed the format).');
        return;
    }
    writeFileSync(targetJsPath, content.replace('"testSimulatorExtensions":{}', patchedEntry));
    console.log('[serve] Patched target.js with the botsim devUrl.');
}

function buildExtension(): void {
    console.log('[serve] Building extension (pxt build)...');
    const result = spawnSync('npx', ['pxt', 'build'], { cwd: ROOT, stdio: 'inherit', shell: true });
    if (result.status !== 0) {
        console.error('[serve] Build failed — aborting.');
        process.exit(result.status ?? 1);
    }
}

function prefixOutput(child: ChildProcess, label: string): void {
    const prefix = (data: Buffer): void => { data.toString().split('\n').filter(Boolean).forEach((line: string) => console.log(`[${label}] ${line}`)); };
    child.stdout?.on('data', prefix);
    child.stderr?.on('data', prefix);
}

patchTargetJs();
buildExtension();

console.log('[serve] Starting local MakeCode editor (pxt serve)...');
const pxt = spawn('npx', ['pxt', 'serve'], { cwd: ROOT, shell: true });
prefixOutput(pxt, 'pxt');

console.log(`[serve] Remember to start the botsim dev server yourself in another terminal: cd ../butia-botsim && npm run dev (expected at ${BOTSIM_DEV_URL})`);
console.log('[serve] Once both servers are up: import built/binary.hex into the editor (Extensions -> Import File),');
console.log('[serve] then open it with ?simxdev added to the URL, e.g. http://localhost:3232/index.html?simxdev#editor');

let shuttingDown = false;
function shutdown(code: number): void {
    if (shuttingDown) return;
    shuttingDown = true;
    pxt.kill();
    process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
pxt.on('exit', (code: number | null) => shutdown(code ?? 0));
