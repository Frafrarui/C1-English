// Generates Unidad7.html: a standalone copy of public/ with the data embedded,
// so it can be opened directly in the browser without running the server.
// Run after editing anything in public/ or data/:  npm run build
const fs = require('fs');
const path = require('path');

const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');

const data = {
    teoria: JSON.parse(read('data', 'teoria_u7.json')),
    ejercicios: JSON.parse(read('data', 'ejercicios_u7.json'))
};

const html = read('public', 'index.html')
    .replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${read('public', 'style.css')}    </style>`)
    .replace('<script src="app.js"></script>', () =>
        `<script>\n        // Data embedded directly so this file works standalone (no server needed)\n        window.UNIT_DATA = ${JSON.stringify(data, null, 2)};\n    </script>\n    <script>\n${read('public', 'app.js')}    </script>`
    );

fs.writeFileSync(path.join(__dirname, 'Unidad7.html'), html);
console.log('Unidad7.html generated');
