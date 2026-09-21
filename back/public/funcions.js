let tiempo = 0;
const preg = 10;

let estat_partida = {
    sessionId: null,
    respostes_usuari: [],
    contador_preg: 0
};

// Petición inicial para cargar el test
fetch('/json1')
    .then(response => response.json())
    .then(data => {
        // Guardar el sessionId
        estat_partida.sessionId = data.sessionId;

        let partida = document.getElementById('partida');

        for (let i = 0; i < preg; i++) {
            estat_partida.respostes_usuari[i] = null;
        }

        // Inicializar marcador y barra de progreso a 0%
        document.getElementById('marcador').innerHTML = `Preguntes respostes: 0 de ${preg}`;
        actualitzarBarraProgres(0);

        let html = '';

        // Iterar sobre data.questions
        for (let i = 0; i < data.questions.length; i++) {
            let pregunta = data.questions[i];

            html += `
                <div class="col-10 text-center border rounded p-3 mt-2 mb-4 bg-white">
                    <h2>${pregunta.question}</h2>
                    <img src="${pregunta.imatge}" width="200" height="200" class="d-block mx-auto mb-3">
                    <div class="d-flex flex-column align-items-center gap-2">
                        <button onclick="presionado(${i}, 0)" type="button" class="btn btn-secondary">
                            ${pregunta.answers[0]}
                        </button>
                        <button onclick="presionado(${i}, 1)" type="button" class="btn btn-secondary">
                            ${pregunta.answers[1]}
                        </button>
                        <button onclick="presionado(${i}, 2)" type="button" class="btn btn-secondary">
                            ${pregunta.answers[2]}
                        </button>
                    </div>
                    <hr>
                </div>
            `;
        }

        partida.innerHTML = html;
    })
    .catch(err => console.error('Error al cargar preguntas:', err));

function presionado(indexPregunta, indexResposta) {
    if (estat_partida.respostes_usuari[indexPregunta] === null) {
        estat_partida.respostes_usuari[indexPregunta] = indexResposta;
        estat_partida.contador_preg++;

        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: ${estat_partida.contador_preg} de ${preg}`;

        // Actualizar la barra de progreso
        actualitzarBarraProgres(estat_partida.contador_preg);
    }

    if (estat_partida.contador_preg === preg) {
        enviarRespostes();
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