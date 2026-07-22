const express = require('express');
const path = require('path');
const examService = require('./lib/examService');
const { prepareExamForRender } = require('./lib/clozeRenderer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  const exams = examService.listExams();
  res.render('index', { exams });
});

app.get('/exam/:examId', (req, res) => {
  const exam = examService.getExam(req.params.examId);
  if (!exam) return res.status(404).send('Examen no encontrado');
  res.render('exam', { exam: prepareExamForRender(exam) });
});

app.post('/api/exam/:examId/submit', (req, res) => {
  const result = examService.gradeExam(req.params.examId, req.body.answers || {});
  if (!result) return res.status(404).json({ error: 'Examen no encontrado' });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
