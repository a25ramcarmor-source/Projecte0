// crud.js
const express = require('express');
const pool = require('./db');

const router = express.Router();

// =========================================================================
// 1. CREATE (POST) - Crear una pregunta
// =========================================================================
router.post('/api/preguntes', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { pregunta_text, imatge, opcions } = req.body;

    if (!pregunta_text) {
      return res.status(400).json({
        error: 'El campo pregunta_text es obligatorio'
      });
    }

    await connection.beginTransaction();

    // Insertar la pregunta
    const [resultPregunta] = await connection.query(
      'INSERT INTO PREGUNTES (pregunta_text, imatge) VALUES (?, ?)',
      [pregunta_text, imatge || null]
    );

    const preguntaId = resultPregunta.insertId;

    // Insertar las opciones
    if (Array.isArray(opcions) && opcions.length > 0) {
      for (const opcio of opcions) {
        await connection.query(
          `INSERT INTO OPCIONS
           (pregunta_id, text_opcio, es_correcta)
           VALUES (?, ?, ?)`,
          [
            preguntaId,
            opcio.text_opcio,
            opcio.es_correcta || false
          ]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Pregunta creada correctamente',
      id: preguntaId,
      pregunta_text,
      imatge: imatge || null,
      opcions: opcions || []
    });

  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      error: error.message
    });

  } finally {
    connection.release();
  }
});


// =========================================================================
// 2. READ ALL (GET) - Obtener todas las preguntas
// =========================================================================
router.get('/api/preguntes', async (req, res) => {
  try {
    const [preguntes] = await pool.query(
      'SELECT * FROM PREGUNTES'
    );

    const [opcions] = await pool.query(
      'SELECT * FROM OPCIONS'
    );

    const respuesta = preguntes.map((p) => ({
      ...p,
      opcions: opcions.filter(
        (o) => o.pregunta_id === p.id
      )
    }));

    res.json(respuesta);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// =========================================================================
// 3. READ ONE (GET) - Obtener una pregunta por ID
// =========================================================================
router.get('/api/preguntes/:id', async (req, res) => {
  try {
    const [preguntes] = await pool.query(
      'SELECT * FROM PREGUNTES WHERE id = ?',
      [req.params.id]
    );

    if (preguntes.length === 0) {
      return res.status(404).json({
        error: 'Pregunta no encontrada'
      });
    }

    const [opcions] = await pool.query(
      'SELECT * FROM OPCIONS WHERE pregunta_id = ?',
      [req.params.id]
    );

    res.json({
      ...preguntes[0],
      opcions
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// =========================================================================
// 4. UPDATE (PUT) - Actualizar pregunta
// =========================================================================
router.put('/api/preguntes/:id', async (req, res) => {
  try {
    const { pregunta_text, imatge } = req.body;

    const [result] = await pool.query(
      `UPDATE PREGUNTES
       SET pregunta_text = ?, imatge = ?
       WHERE id = ?`,
      [
        pregunta_text,
        imatge || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Pregunta no encontrada'
      });
    }

    res.json({
      message: 'Pregunta actualizada correctamente'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


// =========================================================================
// 5. DELETE (DELETE) - Eliminar una pregunta
// =========================================================================
router.delete('/api/preguntes/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM PREGUNTES WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Pregunta no encontrada'
      });
    }

    res.json({
      message: 'Pregunta y sus opciones asociadas eliminadas correctamente'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


module.exports = router;