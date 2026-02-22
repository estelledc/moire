import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const imagesDir = path.resolve('src/memos/images');
const memosDir = path.resolve('src/memos');
const isDryRun = process.argv.includes('--dry-run');

function getAllMarkdownFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'images') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectUsedImageNames(markdown) {
  const usedImageNames = new Set();
  const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;

  const collect = (rawSrc) => {
    const cleaned = rawSrc.split('#')[0].split('?')[0].trim();

    if (!cleaned || cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:')) {
      return;
    }

    const normalized = cleaned.replace(/^['"]|['"]$/g, '');
    const decoded = (() => {
      try {
        return decodeURIComponent(normalized);
      } catch {
        return normalized;
      }
    })();

    const imageName = path.basename(decoded);

    if (imageName) {
      usedImageNames.add(imageName);
    }
  };

  for (const match of markdown.matchAll(markdownImageRegex)) {
    collect(match[1]);
  }

  for (const match of markdown.matchAll(htmlImageRegex)) {
    collect(match[1]);
  }

  return usedImageNames;
}

if (!fs.existsSync(imagesDir)) {
  console.log('Images directory does not exist. Skipping cleanup.');
  process.exit(0);
}

if (!fs.existsSync(memosDir)) {
  console.log('Memos directory does not exist. Skipping cleanup.');
  process.exit(0);
}

const imageFiles = fs.readdirSync(imagesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);

if (imageFiles.length === 0) {
  console.log('No images found in images directory.');
  process.exit(0);
}

const memoFiles = getAllMarkdownFiles(memosDir);

if (memoFiles.length === 0) {
  console.warn('No markdown files found. Skipping cleanup to avoid accidental deletions.');
  process.exit(0);
}

const usedImageNames = new Set();

for (const file of memoFiles) {
  const content = fs.readFileSync(file, 'utf-8');

  for (const imageName of collectUsedImageNames(content)) {
    usedImageNames.add(imageName);
  }
}

const unusedImages = imageFiles.filter((image) => !usedImageNames.has(image));

if (unusedImages.length === 0) {
  console.log('No unused images found.');
  process.exit(0);
}

console.log(`Found ${unusedImages.length} unused image(s):`);
unusedImages.forEach((image) => {
  console.log(` - ${image}`);
});

for (const image of unusedImages) {
  const imagePath = path.join('src/memos/images', image);

  if (isDryRun) {
    console.log(`[dry-run] Would remove ${imagePath}`);
    continue;
  }

  try {
    console.log(`Removing ${imagePath}...`);
    execSync(`git rm -- "${imagePath}"`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to remove ${imagePath} with git rm: ${message}`);

    try {
      fs.unlinkSync(path.join(imagesDir, image));
      console.log(`Removed ${imagePath} with filesystem fallback.`);
    } catch (unlinkError) {
      const unlinkMessage = unlinkError instanceof Error ? unlinkError.message : String(unlinkError);
      console.error(`Failed to remove ${imagePath}: ${unlinkMessage}`);
    }
  }
}

if (isDryRun) {
  console.log('Dry run completed. No files were removed.');
} else {
  console.log('Cleanup completed.');
}
