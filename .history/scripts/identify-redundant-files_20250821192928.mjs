import fs from 'fs';
import path from 'path';

console.log('🔍 Identifying potentially redundant files...');
console.log('='.repeat(50));

// Check for redundant script files
const scriptFiles = [
  'scripts/test-admin-user-functions.mjs',
  'scripts/get-celebrity-url.mjs', 
  'scripts/check-celebrities.mjs',
  'scripts/reset-postgres-password.mjs',
  'scripts/setup-production.mjs',
  'scripts/seed-services.js',
];

console.log('\n📋 Script Files Analysis:');
console.log('='.repeat(50));

scriptFiles.forEach(scriptPath => {
  if (fs.existsSync(scriptPath)) {
    const stats = fs.statSync(scriptPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`📄 ${scriptPath} (${sizeKB} KB)`);
    
    // Check if it's a test/debug script
    if (scriptPath.includes('test-') || scriptPath.includes('check-') || scriptPath.includes('get-')) {
      console.log(`   ⚠️  This appears to be a test/debug script - consider removing if not needed`);
    }
  }
});

// Check for documentation files
const docFiles = [
  'HELP_CONTACT_GUIDE.md',
  'AUTH_SYSTEM_GUIDE.md', 
  'PRODUCTION_READY_SUMMARY.md',
  'IMPLEMENTATION_GUIDE.md',
  'README.md'
];

console.log('\n📚 Documentation Files:');
console.log('='.repeat(50));

docFiles.forEach(docPath => {
  if (fs.existsSync(docPath)) {
    const stats = fs.statSync(docPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`📄 ${docPath} (${sizeKB} KB)`);
  }
});

// Check for large files
console.log('\n📊 Large Files (>100KB):');
console.log('='.repeat(50));

function checkLargeFiles(dir, maxSize = 100 * 1024) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isFile() && stats.size > maxSize) {
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`📄 ${itemPath} (${sizeKB} KB)`);
    } else if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      checkLargeFiles(itemPath, maxSize);
    }
  });
}

checkLargeFiles('.');

// Check for potential duplicate files
console.log('\n🔍 Potential Duplicates:');
console.log('='.repeat(50));

const potentialDuplicates = [
  { pattern: '*.config.*', description: 'Configuration files' },
  { pattern: '*.env*', description: 'Environment files' },
  { pattern: '*.md', description: 'Markdown files' },
];

potentialDuplicates.forEach(({ pattern, description }) => {
  console.log(`\n${description}:`);
  // This would need more sophisticated logic to find actual duplicates
  // For now, just list files matching the pattern
});

console.log('\n💡 Recommendations:');
console.log('='.repeat(50));
console.log('1. Consider removing test/debug scripts if not needed for production');
console.log('2. Keep only essential documentation files');
console.log('3. Review large files to ensure they are necessary');
console.log('4. Consider consolidating similar documentation files');
