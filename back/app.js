const express = require('express');
const app = express();
const port = 3001;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

app.use(express.static('public'));
app.use(express.json());

const preg = 10;
const sessions = new Map();

app.get('/json1', (req, res) => {
    const dades = fs.readFileSync('preguntes.json', 'utf-8');
    const preguntes = JSON.parse(dades).preguntes;

    let p_elegida = [];

    // Seleccionar 10 preguntas aleatorias sin repetir
    while (p_elegida.length < preg) {
        let numero = Math.floor(Math.random() * preguntes.length);
        if (!p_elegida.includes(numero)) {
            p_elegida.push(numero);
        }
    }

    // Generar UUID único para la partida
    const sessionId = uuidv4();

    // Guardar en el Map del servidor las preguntas asociadas al sessionId
    sessions.set(sessionId, {
        questions: p_elegida
    });

    // Mapear la respuesta exactamente como la pide el enunciado (sin la respuesta correcta)
    const clientQuestions = p_elegida.map(index => {
        const p = preguntes[index];
        return {
            id: index,                          // O p.id si tu JSON ya tiene un id
            question: p.pregunta_text,          // El texto de la pregunta
            answers: p.respostes,               // Array de opciones de respuesta
            imatge: p.imatge                    // Tu campo de imagen adicional
        };
    });

    // Retornar exactamente la estructura requerida
    res.json({
        sessionId: sessionId,
        questions: clientQuestions
    });
});

app.post('/comprovar', (req, res) => {
    const { sessionId, respostes_usuari } = req.body;

    if (!sessions.has(sessionId)) {
        return res.status(404).json({ error: "Sessió no trobada o caducada" });
    }

    const session = sessions.get(sessionId);
    const dades = fs.readFileSync('preguntes.json', 'utf-8');
    const preguntesOriginals = JSON.parse(dades).preguntes;

    let encerts = 0;
    let errors = 0;

    session.questions.forEach((indexPregunta, i) => {
        const preguntaOriginal = preguntesOriginals[indexPregunta];
        const respostaUsuari = respostes_usuari[i];

        // Asegúrate de que 'correcta' coincida con la propiedad de tu JSON
        if (respostaUsuari === preguntaOriginal.correcta) {
            encerts++;
        } else {
            errors++;
        }
    });

    // Opcional: Eliminar la sesión una vez corregida
    sessions.delete(sessionId);

    res.json({
        missatge: "Cuestionario corregido correctamente",
        encerts: encerts,
        errors: errors,
        nota: `${encerts} / ${session.questions.length}`
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});