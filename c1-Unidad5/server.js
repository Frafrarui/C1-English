const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load data
const getTeoria = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'teoria.json'), 'utf8'));
const getPreguntas = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'preguntas.json'), 'utf8'));

// API Endpoints
app.get('/api/teoria', (req, res) => {
    try {
        const teoria = getTeoria();
        res.json(teoria);
    } catch (error) {
        res.status(500).json({ error: 'Error reading teoria data' });
    }
});

app.get('/api/test/:groupId', (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const preguntas = getPreguntas();
        const testPreguntas = preguntas.filter(p => p.test_group === groupId);
        res.json(testPreguntas);
    } catch (error) {
        res.status(500).json({ error: 'Error reading preguntas data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
