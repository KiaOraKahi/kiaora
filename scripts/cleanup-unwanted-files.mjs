import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Cleaning up unwanted files...');
console.log('='.repeat(50));

// Files and directories to remove
const filesToRemove = [
  // Build artifacts and cache
  '.next',
  'node_modules/.cache',
  
  // History files (VS Code history)
  '.history',
  
  // Log files
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  '*.log',
  
  // Temporary files
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.old',
  
  // OS generated files
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',
  
  // IDE files
  '.vscode/settings.json',
  '.idea',
  '*.swp',
  '*.swo',
  
  // Environment files (keep .env but remove backups)
  '.env.backup',
  '.env.local.backup',
  
  // Test coverage
  'coverage',
  '.nyc_output',
  
  // Storybook
  'storybook-static',
  
  // PWA
  'public/sw.js',
  'public/workbox-*.js',
  
  // Backup files
  '*.backup',
  '*.backup.*',
];

// Directories to clean (but keep the directory itself)
const dirsToClean = [
  'public/uploads/temp',
  'public/uploads/cache',
  'logs',
  'tmp',
];

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed file: ${filePath}`);
      }
      return true;
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${filePath}: ${error.message}`);
  }
  return false;
}

function cleanDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        removeFile(filePath);
      });
      console.log(`🧹 Cleaned directory: ${dirPath}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not clean ${dirPath}: ${error.message}`);
  }
}

// Remove specific files and directories
let removedCount = 0;

console.log('\n📁 Removing build artifacts and cache...');
filesToRemove.forEach(file => {
  if (removeFile(file)) {
    removedCount++;
  }
});

console.log('\n🧹 Cleaning temporary directories...');
dirsToClean.forEach(dir => {
  cleanDirectory(dir);
});

// Clean .next directory specifically (Next.js build cache)
if (fs.existsSync('.next')) {
  console.log('\n🗑️  Removing Next.js build cache (.next)...');
  try {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Removed .next directory');
    removedCount++;
  } catch (error) {
    console.log(`⚠️  Could not remove .next: ${error.message}`);
  }
}

// Clean .history directory (VS Code history)
if (fs.existsSync('.history')) {
  console.log('\n🗑️  Removing VS Code history (.history)...');
  try {
    fs.rmSync('.history', { recursive: true, force: true });
    console.log('✅ Removed .history directory');
    removedCount++;
  } catch (error) {
    console.log(`⚠️  Could not remove .history: ${error.message}`);
  }
}

// Clean node_modules cache
if (fs.existsSync('node_modules/.cache')) {
  console.log('\n🗑️  Removing node_modules cache...');
  try {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('✅ Removed node_modules/.cache');
    removedCount++;
  } catch (error) {
    console.log(`⚠️  Could not remove node_modules/.cache: ${error.message}`);
  }
}

console.log('\n🎉 Cleanup completed!');
console.log(`📊 Removed ${removedCount} files/directories`);
console.log('\n💡 Next steps:');
console.log('1. Run "npm install" to ensure dependencies are intact');
console.log('2. Run "npm run dev" to rebuild the application');
console.log('3. The application should now be cleaner and faster');
