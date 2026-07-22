const fs = require('fs');
const path = require('path');

const inputPath = '/Users/javi_fr03/Desktop/Inglés/AcademiaIngles/C1/word formation/vocabulario.json';

const outputPath = path.join(__dirname, 'words.json');

try {
  console.log('Reading data from:', inputPath);
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`Processing ${data.length} words...`);

  const mappedData = data.map(item => ({
    baseWord: item.palabra_base,
    derivedWord: item.palabra_derivada,
    partOfSpeech: item.tipo,
    translation: item.traduccion,
    example: item.ejemplo
  }));

  fs.writeFileSync(outputPath, JSON.stringify(mappedData, null, 2));
  console.log('Successfully created words.json with English keys!');
} catch (error) {
  console.error('Error processing the JSON file:', error.message);
}
