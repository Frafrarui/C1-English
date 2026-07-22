const fs = require('fs');
const preguntas = JSON.parse(fs.readFileSync('data/preguntas.json', 'utf8'));
const test5 = preguntas.filter(p => p.test_group === 5);

let mistakes = [];
mistakes.push({ question: test5[0], userAnswer: 'Wrong' });

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

let currentQuestions = shuffle(mistakes.map(m => m.question));
console.log(currentQuestions.length);
console.log(currentQuestions[0].word);
