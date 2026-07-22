const fs = require('fs');
const path = require('path');

const EXAMS_DIR = path.join(__dirname, '..', 'data', 'exams');

function loadExamRaw(examId) {
  const filePath = path.join(EXAMS_DIR, `${examId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function listExams() {
  const files = fs.readdirSync(EXAMS_DIR).filter((f) => f.endsWith('.json'));
  return files
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(EXAMS_DIR, f), 'utf-8'));
      return { id: data.id, title: data.title, description: data.description || '' };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getExam(examId) {
  return loadExamRaw(examId);
}

// Los teclados de móvil suelen sustituir el apóstrofe recto (') por una
// comilla tipográfica (' o similares) al escribir contracciones como
// "hadn't". Sin esto, esas respuestas se marcarían como incorrectas aunque
// sean idénticas en contenido.
function normalizeApostrophes(value) {
  return String(value ?? '').replace(/[‘’ʼ´`]/g, "'");
}

function normalize(value) {
  return normalizeApostrophes(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function wordsOf(value) {
  return normalize(value).split(' ').filter(Boolean);
}

// Proporción de palabras de `a` que también aparecen en `b` (cada palabra de
// `b` solo puede usarse una vez), usada para aproximar el "medio punto" que
// Cambridge concede en key word transformation cuando la respuesta capta la
// transformación pero tiene un error menor.
function wordOverlapRatio(a, b) {
  const wordsA = wordsOf(a);
  const poolB = wordsOf(b);
  if (!wordsA.length || !poolB.length) return 0;
  let matches = 0;
  for (const word of wordsA) {
    const idx = poolB.indexOf(word);
    if (idx !== -1) {
      matches++;
      poolB.splice(idx, 1);
    }
  }
  return matches / Math.max(wordsA.length, wordsOf(b).length);
}

function isExactMatch(question, userAnswer) {
  const candidates = [question.answer, ...(question.acceptedAnswers || [])];
  return candidates.some((c) => normalize(c) === normalize(userAnswer));
}

// Cambridge da 2 puntos por una key word transformation totalmente correcta
// y 1 punto si la respuesta demuestra haber entendido la transformación (usa
// la palabra clave correctamente) pero tiene algún error. Esto es una
// aproximación automática de ese criterio, no un juicio de examinador real.
function scoreKeyWordTransformation(question, userAnswer, pointsPerItem) {
  if (isExactMatch(question, userAnswer)) {
    return { correct: true, partial: false, pointsAwarded: pointsPerItem };
  }
  if (!normalize(userAnswer)) {
    return { correct: false, partial: false, pointsAwarded: 0 };
  }

  const candidates = [question.answer, ...(question.acceptedAnswers || [])];
  const keyword = question.keyword ? normalize(question.keyword) : null;
  const keywordPresent = keyword ? wordsOf(userAnswer).includes(keyword) : true;

  let bestRatio = 0;
  for (const candidate of candidates) {
    bestRatio = Math.max(bestRatio, wordOverlapRatio(userAnswer, candidate));
  }

  const partial = keywordPresent && bestRatio >= 0.5;
  return { correct: false, partial, pointsAwarded: partial ? Math.floor(pointsPerItem / 2) : 0 };
}

function scoreQuestion(question, userAnswer, part, pointsPerItem) {
  if (part.type === 'key-word-transformation') {
    return scoreKeyWordTransformation(question, userAnswer, pointsPerItem);
  }
  const correct = isExactMatch(question, userAnswer);
  return { correct, partial: false, pointsAwarded: correct ? pointsPerItem : 0 };
}

// Puntos por ítem correcto en el Reading and Use of English de Cambridge C1
// Advanced: Parts 1, 2, 3 y 8 valen 1 punto; Parts 4, 5, 6 y 7 valen 2 puntos.
const DEFAULT_PART_POINTS = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 2, 8: 1 };

// Puntos de anclaje (porcentaje medio de las 5 destrezas -> Cambridge English
// Scale) tomados de la tabla oficial de conversión del C1 Advanced.
const CS_ANCHORS = [
  { pct: 45, score: 160 },
  { pct: 60, score: 180 },
  { pct: 75, score: 193 },
  { pct: 80, score: 200 },
  { pct: 100, score: 210 },
];

function percentageToCambridgeScale(pct) {
  if (pct < CS_ANCHORS[0].pct) {
    return { score: null, grade: 'Por debajo de B2 (Suspenso)' };
  }
  let score = CS_ANCHORS[CS_ANCHORS.length - 1].score;
  for (let i = 0; i < CS_ANCHORS.length - 1; i++) {
    const lower = CS_ANCHORS[i];
    const upper = CS_ANCHORS[i + 1];
    if (pct >= lower.pct && pct <= upper.pct) {
      const ratio = (pct - lower.pct) / (upper.pct - lower.pct);
      score = Math.round(lower.score + ratio * (upper.score - lower.score));
      break;
    }
  }
  let grade;
  if (score >= 200) grade = 'Grade A';
  else if (score >= 193) grade = 'Grade B';
  else if (score >= 180) grade = 'Grade C';
  else grade = 'Level B2 (Fail)';
  return { score, grade };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function gradeExam(examId, answers) {
  const exam = loadExamRaw(examId);
  if (!exam) return null;

  const scoring = exam.scoring || {};
  const sectionsResult = {};
  let totalCorrect = 0;
  let totalQuestions = 0;
  const details = {};

  let totalPartial = 0;

  for (const [sectionKey, section] of Object.entries(exam.sections)) {
    let sectionCorrect = 0;
    let sectionPartial = 0;
    let sectionTotal = 0;
    let earnedPoints = 0;
    let maxRawPoints = 0;
    const sectionScoring = scoring[sectionKey];
    const partPoints = sectionScoring ? sectionScoring.partPoints || {} : null;

    for (const part of section.parts) {
      const pointsPerItem = partPoints
        ? partPoints[String(part.partNumber)] ?? DEFAULT_PART_POINTS[part.partNumber] ?? 1
        : 1;

      for (const question of part.questions) {
        sectionTotal++;
        totalQuestions++;
        maxRawPoints += pointsPerItem;

        const userAnswer = answers[question.id];
        const { correct, partial, pointsAwarded } = scoreQuestion(question, userAnswer, part, pointsPerItem);

        if (correct) {
          sectionCorrect++;
          totalCorrect++;
        } else if (partial) {
          sectionPartial++;
          totalPartial++;
        }
        earnedPoints += pointsAwarded;

        details[question.id] = {
          correct,
          partial,
          pointsAwarded,
          pointsPossible: pointsPerItem,
          userAnswer: userAnswer ?? '',
          correctAnswer: question.answer,
          explanation: question.explanation || null,
        };
      }
    }

    const percentage = maxRawPoints ? round1((earnedPoints / maxRawPoints) * 100) : 0;
    const nominalMax = sectionScoring ? sectionScoring.nominalMax : null;
    const nominalEarned = nominalMax !== null && maxRawPoints
      ? round1((earnedPoints / maxRawPoints) * nominalMax)
      : null;
    const passPercentage = sectionScoring ? sectionScoring.passPercentage : null;

    sectionsResult[sectionKey] = {
      title: section.title,
      correct: sectionCorrect,
      partial: sectionPartial,
      total: sectionTotal,
      earnedPoints,
      maxRawPoints,
      nominalMax,
      nominalEarned,
      percentage,
      passPercentage,
      passed: passPercentage !== null ? percentage >= passPercentage : null,
    };
  }

  let caeEstimate = null;
  if (exam.examType === 'cae') {
    const skillKeys = ['reading', 'useOfEnglish', 'listening'];
    const percentages = skillKeys
      .filter((k) => sectionsResult[k])
      .map((k) => sectionsResult[k].percentage);

    if (percentages.length) {
      const average = round1(percentages.reduce((a, b) => a + b, 0) / percentages.length);
      caeEstimate = {
        skillsIncluded: skillKeys.filter((k) => sectionsResult[k]),
        averagePercentage: average,
        ...percentageToCambridgeScale(average),
      };
    }
  }

  return {
    examId,
    totalCorrect,
    totalPartial,
    totalQuestions,
    percentage: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    sections: sectionsResult,
    details,
    caeEstimate,
  };
}

module.exports = { listExams, getExam, gradeExam, percentageToCambridgeScale };
