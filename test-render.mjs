import fs from 'fs';
import { transformSync } from 'esbuild';

const code = fs.readFileSync('VintageDrifter_UI.jsx', 'utf8');

const { code: compiled } = transformSync(code, {
  loader: 'jsx',
  target: 'esnext'
});

fs.writeFileSync('test.js', compiled);
