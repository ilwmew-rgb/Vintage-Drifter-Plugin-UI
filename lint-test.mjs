import fs from 'fs';
import { parse } from 'acorn';
import * as walk from 'acorn-walk';

const code = fs.readFileSync('test.js', 'utf8');

const ast = parse(code, { ecmaVersion: 2022, sourceType: 'module' });
let errors = [];

walk.simple(ast, {
  Identifier(node) {
    // A proper static analysis is tricky, but let's just see if there's anything obvious.
  }
});
