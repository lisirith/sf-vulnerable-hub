'use strict';
// Copies the finished site into the local clone of the GitHub repository. Pushing main updates Vercel.
// Repository root = the live site. Repository 121121/ = this project's source.
// Usage: node tools/sync-repo.cjs [path-to-clone]
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist');
const repo = path.resolve(process.argv[2] || path.join(process.env.USERPROFILE || '', 'Documents/GitHub/sf-vulnerable-hub'));
if (!fs.existsSync(path.join(repo, '.git'))) throw new Error('Not a Git clone: ' + repo);
require('./package.cjs');

// Everything else in the root is replaced. The Google file proves site ownership to Search Console.
const keepAtRoot = name => name.startsWith('.git') || name === '121121' || /^google[0-9a-f]+\.html$/.test(name);
for (const name of fs.readdirSync(repo)) if (!keepAtRoot(name)) fs.rmSync(path.join(repo, name), { recursive: true, force: true });
const hostOnly = new Set(['.nojekyll', '_headers', '.git', '.gitattributes']); // Not used by Vercel.
for (const name of fs.readdirSync(dist)) if (!hostOnly.has(name)) fs.cpSync(path.join(dist, name), path.join(repo, name), { recursive: true });

// Never publish backups, local tool settings, Git data or paths from this computer.
const skip = new Set(['.original', '.claude', '.git', '.gitignore', path.join('tools', 'local-node.txt')]);
const source = path.join(repo, '121121');
fs.rmSync(source, { recursive: true, force: true });
fs.cpSync(root, source, { recursive: true, filter: from => !skip.has(path.relative(root, from)) && path.basename(from) !== '.git' });
console.log('Repository updated at ' + repo + '. Review, commit and push it in GitHub Desktop.');
