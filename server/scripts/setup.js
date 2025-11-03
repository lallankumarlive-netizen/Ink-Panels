const fs = require('fs');
const path = require('path');

// Create necessary directories
const dirs = [
    'public',
    'public/js',
    'public/css',
    'public/images'
];

dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
});