const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint para obtener la teoría
app.get('/api/teoria', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'teoria_u7.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading teoria_u7.json:', err);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint para obtener las preguntas
app.get('/api/preguntas', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'preguntas_u7.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading preguntas_u7.json:', err);
            return res.status(500).json({ error: 'Failed to read data' });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
