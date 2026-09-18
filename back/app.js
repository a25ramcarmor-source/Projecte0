const express = require('express');
const app = express();
const port = 3001;
const fs = require('fs');

app.use(express.static('public'));
app.use(express.json());

const { v4: uuidv4 } = require('uuid');
let preg = 10;

const sessions = new Map();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/json1', (req, res) => {

    const dades = fs.readFileSync('preguntes.json', 'utf-8');
    const preguntes = JSON.parse(dades);

    let p_elegida = [];

    while (p_elegida.length < preg) {

        let numero = Math.floor(Math.random() * preguntes.preguntes.length);

        if (!p_elegida.includes(numero)) {
            p_elegida.push(numero);
        }
    }

    const sessionId = uuidv4();

    sessions.set(sessionId, {
        questions: p_elegida
    });

    console.log(sessionId);
    console.log(sessions.get(sessionId));

    res.json({
        sessionId: sessionId,
        questions: p_elegida,
        preguntes: preguntes.preguntes
    });
});

app.get('/json2', (req, res) => {

    const dades2 = fs.readFileSync('respostes.json', 'utf-8');
    const respostes = JSON.parse(dades2);

    res.send(dades2);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});