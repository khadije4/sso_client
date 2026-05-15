import { parse } from '@babel/parser';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.argv[2] || 'src';
const errors = [];
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const s = statSync(full);
    if (s.isDirectory()) walk(full);
    else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      try {
        parse(readFileSync(full, 'utf8'), {
          sourceType: 'module',
          plugins: ['jsx'],
          errorRecovery: false,
        });
      } catch (e) {
        errors.push(`${relative(ROOT, full)}: ${e.message}`);
      }
    }
  }
}
walk(ROOT);
if (errors.length === 0) console.log('All JSX/JS files parse cleanly.');
else {
  console.log(`${errors.length} parse errors:`);
  for (const e of errors) console.log('  ' + e);
  process.exitCode = 1;
}
