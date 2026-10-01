const express = require('express');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const crudRoutes = require('./crud');

const app = express();
const port = Number(process.argv[2]) || 4000;

app.use(crudRoutes);
app.use(express.static('public'));
app.use(express.json());

// Crear la conexión con la base de datos
const pool = mysql.createPool({
  host: "db",
  user: "user",
  password: "user",
  database: "quiz_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const sessions = new Map();
const preg = 10;

// -------------------------------------------------------------
// GET /json1: Obtener preguntas aleatorias de la BDD
// -------------------------------------------------------------
app.get('/json1', async (req, res) => {
  try {
    // 1. Seleccionar 10 preguntas aleatorias
    const [preguntesRow] = await pool.query(
      'SELECT id, pregunta_text, imatge FROM PREGUNTES ORDER BY RAND() LIMIT ?',
      [preg]
    );

    if (preguntesRow.length === 0) {
      return res.status(404).json({ error: 'No hi ha preguntes a la BDD' });
    }

    const questionIds = preguntesRow.map(p => p.id);

    // 2. Seleccionar todas las respuestas de esas 10 preguntas
    const [respostesRows] = await pool.query(
      'SELECT pregunta_id, text_opcio FROM OPCIONS WHERE pregunta_id IN (?)',
      [questionIds]
    );

    // 3. Transformación: Agrupar opciones en el formato que espera el cliente
    const clientQuestions = preguntesRow.map(p => {
      const answers = respostesRows
        .filter(o => o.pregunta_id === p.id)
        .map(o => o.text_opcio);

      return {
        id: p.id,
        question: p.pregunta_text, // Clave 'question' requerida por el cliente
        answers: answers,          // Clave 'answers' requerida por el cliente
        imatge: p.imatge
      };
    });

    // 4. Guardar los IDs en la sesión
    const sessionId = uuidv4();
    sessions.set(sessionId, { questionIds });

    console.log("Session ID creado:", sessionId, questionIds);

    // Retornar exactamente la estructura que espera el cliente
    res.json({
      sessionId: sessionId,
      questions: clientQuestions
    });

  } catch (err) {
    console.error('Error a /json1:', err.message);
    res.status(500).json({ error: "Error en obtenir les preguntes de la Bdd" });
  }
});

// -------------------------------------------------------------
// POST /comprovar: Corregir las respuestas con la BDD
// -------------------------------------------------------------
app.post('/comprovar', async (req, res) => {
  try {
    const { sessionId, respostes_usuari } = req.body;

    // Comprobar que la sesión existe
    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: "Sessió no trobada o caducada" });
    }

    const session = sessions.get(sessionId);
    const { questionIds } = session;

    // Obtener las respuestas correctas de la BDD para estas preguntas
    const [correctesRows] = await pool.query(
      'SELECT pregunta_id, text_opcio FROM OPCIONS WHERE pregunta_id IN (?) AND es_correcta = 1',
      [questionIds]
    );

    // Mapa rápido para buscar la respuesta correcta por pregunta_id
    const mapCorrectes = new Map();
    correctesRows.forEach(r => mapCorrectes.set(r.pregunta_id, r.text_opcio));

    let encerts = 0;
    let errors = 0;

    // Comparar respuestas del usuario
    questionIds.forEach((qId, i) => {
      const respostaCorrecta = mapCorrectes.get(qId);
      const respostaUsuari = respostes_usuari[i];

      if (respostaUsuari && respostaUsuari === respostaCorrecta) {
        encerts++;
      } else {
        errors++;
      }
    });

    res.json({
      missatge: "Cuestionario corregido correctamente",
      encerts: encerts,
      errors: errors,
      nota: `${encerts} / ${questionIds.length}`
    });

  } catch (err) {
    console.error("Error a /comprovar:", err.message);
    res.status(500).json({ error: "Error en corregir el qüestionari" });
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});