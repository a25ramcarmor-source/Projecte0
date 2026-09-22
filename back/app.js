const express = require('express');
const app = express();
const port = Number(process.argv[2]) || 3001;
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

    console.log("SessionId:", sessionId);
    console.log("Preguntas:", p_elegida);
    
    // Mapear la respuesta(sin la respuesta correcta)
    const clientQuestions = p_elegida.map(index => {
    const p = preguntes[index];

    return {
        id: p.pregunta,
        question: p.pregunta_text,
        answers: p.respostes,
        imatge: p.imatge
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

    // Comprobar que existe la sesión
    if (!sessions.has(sessionId)) {
        return res.status(404).json({
            error: "Sessió no trobada o caducada"
        });
    }

    // Obtener la sesión
    const session = sessions.get(sessionId);

    // Leer JSON de respuestas correctas
    const dades = fs.readFileSync('respostes.json', 'utf-8');
    const respostesCorrectes = JSON.parse(dades);

    let encerts = 0;
    let errors = 0;

    // Recorrer las preguntas de la sesión
    session.questions.forEach((indexPregunta, i) => {

        // +1 porque el índice empieza en 0
        // pero "pregunta" en respostes.json empieza en 1
        const numeroPregunta = indexPregunta + 1;

        // Buscar la respuesta correcta
        const respostaCorrecta = respostesCorrectes.find(
            r => r.pregunta === numeroPregunta
        );

        // Respuesta que ha dado el usuario
        const respostaUsuari = respostes_usuari[i];

        // Comparar
        if (respostaUsuari === respostaCorrecta.resposta) {
            encerts++;
        } else {
            errors++;
        }
    });

    // Enviar resultado
    res.json({
        missatge: "Cuestionario corregido correctamente",
        encerts: encerts,
        errors: errors,
        nota: `${encerts} / ${session.questions.length}`
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
    console.log();
});