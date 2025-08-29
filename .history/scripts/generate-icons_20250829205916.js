const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="url(#grad)" rx="24"/>
  <text x="96" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="white">KO</text>
</svg>`;

// Create a larger version for 512x512
const svgIcon512 = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad512)" rx="64"/>
  <text x="256" y="290" font-family="Arial, sans-serif" font-size="128" font-weight="bold" text-anchor="middle" fill="white">KO</text>
</svg>`;

// Write the SVG files
fs.writeFileSync(path.join(__dirname, '../public/icon-192x192.svg'), svgIcon);
fs.writeFileSync(path.join(__dirname, '../public/icon-512x512.svg'), svgIcon512);

console.log('✅ Icon files created successfully!'); 