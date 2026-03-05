/**
 * TrackVolt Source Unpacker
 * 
 * Run this script from the TrackVolt-App folder:
 *   node unpack-source.cjs
 * 
 * It reads trackvolt-source.json (from Downloads or current folder)
 * and writes all source files to the correct locations.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// Try to find the JSON file
const possiblePaths = [
  path.join(__dirname, 'trackvolt-source.json'),
  path.join(os.homedir(), 'Downloads', 'trackvolt-source.json'),
  path.join(os.homedir(), 'Downloads', 'trackvolt-source (1).json'),
  path.join(os.homedir(), 'Downloads', 'trackvolt-source (2).json'),
];

let jsonPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    jsonPath = p;
    break;
  }
}

if (!jsonPath) {
  console.error('ERROR: Could not find trackvolt-source.json');
  console.error('Looked in:', possiblePaths.join('\n  '));
  console.error('\nPlease copy trackvolt-source.json to this folder and try again.');
  process.exit(1);
}

console.log('Found source file:', jsonPath);

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const files = Object.keys(data);
console.log(`Unpacking ${files.length} files...`);

let created = 0;
let skipped = 0;

for (const filePath of files) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if needed
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(fullPath, data[filePath], 'utf-8');
  created++;
  console.log('  +', filePath);
}

console.log(`\nDone! Created ${created} files.`);
console.log('You can now delete trackvolt-source.json and this script.');
