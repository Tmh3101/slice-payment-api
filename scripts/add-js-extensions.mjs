import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (!dirent.name.includes('node_modules') && !dirent.name.includes('dist')) {
        yield* getFiles(res);
      }
    } else if (dirent.name.endsWith('.ts') && !dirent.name.endsWith('.d.ts')) {
      yield res;
    }
  }
}

async function addJsExtensions() {
  const srcDir = join(rootDir, 'src');
  const apiDir = join(rootDir, 'api');
  
  for await (const filePath of getFiles(srcDir)) {
    await processFile(filePath);
  }
  
  for await (const filePath of getFiles(apiDir)) {
    await processFile(filePath);
  }
}

async function processFile(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let modified = false;

  // Match import/export statements with relative paths
  const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, path) => {
    // Skip if already has .js extension
    if (path.endsWith('.js')) {
      return match;
    }
    
    // Skip if it's importing from node_modules (no ./ or ../)
    if (!path.startsWith('./') && !path.startsWith('../')) {
      return match;
    }
    
    modified = true;
    return match.replace(path, `${path}.js`);
  });

  if (modified) {
    await writeFile(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${relative(rootDir, filePath)}`);
  }
}

addJsExtensions().catch(console.error);
