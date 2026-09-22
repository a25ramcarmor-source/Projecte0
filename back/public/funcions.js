let tiempo = 0;
const preg = 10;

let estat_partida = {
    sessionId: null,
    respostes_usuari: [],
    contador_preg: 0
};
setInterval(() => {
    tiempo++;

    let minutos = Math.floor(tiempo / 60);
    let segundos = tiempo % 60;

    if (minutos < 10) {
        minutos = "0" + minutos;
    }

    if (segundos < 10) {
        segundos = "0" + segundos;
    }

    document.getElementById("tiempo").textContent =
        "Tiempo: " + minutos + ":" + segundos;

}, 1000);

// Petición inicial para cargar el test
let num_preg = 0;
let preguntas = [];
let partida = document.getElementById('partida');

fetch('/json1')
    .then(response => response.json())
    .then(data => {

        // Guardar sessionId
        estat_partida.sessionId = data.sessionId;

        // Guardar las preguntas
        preguntas = data.questions;

        // Inicializar respuestas
        for (let i = 0; i < preg; i++) {
            estat_partida.respostes_usuari[i] = null;
        }

        // Inicializar marcador
        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: 0 de ${preg}`;

        // Inicializar barra
        actualitzarBarraProgres(0);

        // Mostrar primera pregunta
        mostrarpregunta();

    })
    .catch(err => console.error('Error al cargar preguntas:', err));


function mostrarpregunta() {

    // Cogemos la pregunta actual
    let pregunta = preguntas[num_preg];

    let html = `
        <div class="col-10 text-center border rounded p-3 mt-2 mb-4 bg-white">

            <h2>${pregunta.question}</h2>

            <img src="${pregunta.imatge}" width="200" height="200"
                class="d-block mx-auto mb-3">

            <div class="d-flex flex-column align-items-center gap-2">

                <button onclick="presionado(${num_preg}, 0)"
                    type="button" class="btn btn-secondary">
                    ${pregunta.answers[0]}
                </button>

                <button onclick="presionado(${num_preg}, 1)"
                    type="button" class="btn btn-secondary">
                    ${pregunta.answers[1]}
                </button>

                <button onclick="presionado(${num_preg}, 2)"
                    type="button" class="btn btn-secondary">
                    ${pregunta.answers[2]}
                </button>

            </div>

            <hr>

            <div class="d-flex justify-content-between">

                <button type="button"
                    class="btn btn-primary"
                    onclick="anterior()">
                    🡸
                </button>

                <button type="button"
                    class="btn btn-primary"
                    onclick="siguiente()">
                    🡺
                </button>

            </div>

        </div>
    `;

    partida.innerHTML = html;
}


function siguiente() {

    if (num_preg < preguntas.length - 1) {
        num_preg++;
        mostrarpregunta();
    }

}


function anterior() {

    if (num_preg > 0) {
        num_preg--;
        mostrarpregunta();
    }

}

function presionado(indexPregunta, indexResposta) {

    if (estat_partida.respostes_usuari[indexPregunta] === null) {

        // Guardar el texto de la respuesta
        estat_partida.respostes_usuari[indexPregunta] =
            preguntas[indexPregunta].answers[indexResposta];

        estat_partida.contador_preg++;

        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: ${estat_partida.contador_preg} de ${preg}`;

        actualitzarBarraProgres(estat_partida.contador_preg);
    }

    if (estat_partida.contador_preg === preg) {
        document.getElementById('enviar_res').style.display = "block";
    }
}

// Función auxiliar para recalcular y pintar el porcentaje de la barra
function actualitzarBarraProgres(contador) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        let percentatge = (contador / preg) * 100;
        progressBar.style.width = `${percentatge}%`;
        progressBar.setAttribute('aria-valuenow', percentatge);
        progressBar.innerText = `${Math.round(percentatge)}%`;
    }
}

function enviarRespostes() {
    document.getElementById('enviar_res').style.display = "none";
    fetch('/comprovar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: estat_partida.sessionId,
            respostes_usuari: estat_partida.respostes_usuari
        })
    })
        .then(response => response.json())
        .then(data => {
            const contenedorPartida = document.getElementById('partida');
            contenedorPartida.innerHTML = `
            <div class="col-10 text-center border rounded p-4 my-4 bg-white mx-auto">
                <h2>Cuestionario Finalizado</h2>
                <p class="fs-4">Has acertado <strong>${data.encerts}</strong> de <strong>${data.encerts + data.errors}</strong> preguntas.</p>
            </div>
        `;
        })
        .catch(err => console.error('Error al enviar respuestas:', err));
}