const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WORDS_FILE = path.join(__dirname, 'words.json');

// Middleware to serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve the vocabulary
app.get('/api/words', (req, res) => {
  if (!fs.existsSync(WORDS_FILE)) {
    return res.status(404).json({ error: 'words.json not found. Please run setup.js first.' });
  }

  try {
    const rawData = fs.readFileSync(WORDS_FILE, 'utf8');
    const words = JSON.parse(rawData);
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read vocabulary data.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
