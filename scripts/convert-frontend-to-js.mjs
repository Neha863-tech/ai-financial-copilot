import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');
const srcDir = path.join(frontendDir, 'src');

// Use typescript from frontend/node_modules with file:// url
const tsUrl = pathToFileURL(path.join(frontendDir, 'node_modules/typescript/lib/typescript.js')).href;
const ts = await import(tsUrl);

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        files = files.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.includes(path.extname(entry.name)) && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

console.log('🚀 Converting frontend from TypeScript (.ts/.tsx) to pure JavaScript (.js/.jsx)...');

const tsFiles = getAllFiles(srcDir);
console.log(`Found ${tsFiles.length} TypeScript source files in src/`);

let convertedCount = 0;

for (const filePath of tsFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  const isTsx = ext === '.tsx';

  // Transpile TypeScript to JavaScript while PRESERVING JSX intact
  const result = ts.default.transpileModule(content, {
    compilerOptions: {
      jsx: ts.default.JsxEmit.Preserve,
      target: ts.default.ScriptTarget.ESNext,
      module: ts.default.ModuleKind.ESNext,
      removeComments: false,
    },
    fileName: path.basename(filePath),
  });

  let jsOutput = result.outputText;

  // Extra cleanup for type-only imports or interface exports in JS
  jsOutput = jsOutput.replace(/import\s+type\s+[^;]+;/g, '');

  const newExt = isTsx ? '.jsx' : '.js';
  const newFilePath = filePath.slice(0, -ext.length) + newExt;

  fs.writeFileSync(newFilePath, jsOutput, 'utf8');
  fs.unlinkSync(filePath);
  convertedCount++;
}

// Convert vite.config.ts if present
const viteConfigTs = path.join(frontendDir, 'vite.config.ts');
if (fs.existsSync(viteConfigTs)) {
  const content = fs.readFileSync(viteConfigTs, 'utf8');
  const result = ts.default.transpileModule(content, {
    compilerOptions: {
      target: ts.default.ScriptTarget.ESNext,
      module: ts.default.ModuleKind.ESNext,
    },
  });
  fs.writeFileSync(path.join(frontendDir, 'vite.config.js'), result.outputText, 'utf8');
  fs.unlinkSync(viteConfigTs);
  console.log('✓ Converted vite.config.ts -> vite.config.js');
}

// Update index.html
const indexHtmlPath = path.join(frontendDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  html = html.replace('/src/main.tsx', '/src/main.jsx');
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('✓ Updated index.html to reference /src/main.jsx');
}

// Update package.json
const pkgPath = path.join(frontendDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts.build = 'vite build';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('✓ Updated package.json build script to "vite build"');
}

// Remove vite-env.d.ts, tsconfig.json, tsconfig.node.json
const filesToRemove = [
  path.join(srcDir, 'vite-env.d.ts'),
  path.join(frontendDir, 'tsconfig.json'),
  path.join(frontendDir, 'tsconfig.node.json'),
];

for (const file of filesToRemove) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✓ Removed TypeScript config: ${path.basename(file)}`);
  }
}

// Ensure type files provide empty fallback objects so dummy imports never break in JS
const typesDir = path.join(srcDir, 'types');
if (fs.existsSync(typesDir)) {
  const typeFiles = fs.readdirSync(typesDir);
  for (const tf of typeFiles) {
    if (tf.endsWith('.js')) {
      const full = path.join(typesDir, tf);
      const text = fs.readFileSync(full, 'utf8');
      // Add safe export wildcard
      fs.writeFileSync(full, text + '\nexport default {};\n', 'utf8');
    }
  }
}

console.log(`\n🎉 Successfully converted ${convertedCount} files into pure modern JavaScript (.js and .jsx)!`);
