let usuari = document.getElementById('usuari');

let nomGuardat = localStorage.getItem('nomUsuari');


// -------------------------------------------------------------
// GESTIÓN DEL USUARIO
// -------------------------------------------------------------

if (nomGuardat) {

    usuari.innerHTML = `
        <h2>Benvingut, ${nomGuardat}!</h2>

        <button id="esborrarNom" class="btn btn-danger">
            Esborrar nom
        </button>
    `;

} else {

    let formUsuari = document.getElementById('formUsuari');

    formUsuari.addEventListener('submit', (event) => {

        event.preventDefault();

        let nom = document.getElementById('nomUsuari').value;

        localStorage.setItem('nomUsuari', nom);

        usuari.innerHTML = `
            <h2>Benvingut, ${nom}!</h2>

            <button id="esborrarNom" class="btn btn-danger">
                Esborrar nom
            </button>
        `;
    });
}


usuari.addEventListener('click', (event) => {

    if (event.target.id == 'esborrarNom') {

        localStorage.removeItem('nomUsuari');

        location.reload();
    }

});


// -------------------------------------------------------------
// VARIABLES DE LA PARTIDA
// -------------------------------------------------------------

let tiempo = 0;
const preg = 10;

let estat_partida = {
    sessionId: null,
    respostes_usuari: [],
    contador_preg: 0
};

let num_preg = 0;
let preguntas = [];

let partida = document.getElementById('partida');


// -------------------------------------------------------------
// CRONÓMETRO
// -------------------------------------------------------------

let intervalo_tiempo = setInterval(() => {

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


// -------------------------------------------------------------
// EVENTOS DE LOS BOTONES
// -------------------------------------------------------------

partida.addEventListener('click', (event) => {

    // Botón de respuesta
    if (event.target.classList.contains('btn-resposta')) {

        const indexResposta = Number(event.target.dataset.resposta);

        presionado(num_preg, indexResposta);
    }

    // Botón anterior
    if (event.target.classList.contains('btn-anterior')) {
        anterior();
    }

    // Botón siguiente
    if (event.target.classList.contains('btn-seguent')) {
        siguiente();
    }

    if (event.target.id === 'enviar_res') {
        // Ocultar el temporizador
        document.querySelector('.tiempo').style.display = 'none';

        // Enviar las respuestas
        enviarRespostes();
    }

});


// -------------------------------------------------------------
// CARGAR LAS PREGUNTAS
// -------------------------------------------------------------

fetch('/json1')
    .then(response => {

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.json();
    })

    .then(data => {

        // Guardar el ID de sesión
        estat_partida.sessionId = data.sessionId;

        // Guardar las preguntas
        preguntas = data.questions;

        // Reiniciar respuestas
        estat_partida.respostes_usuari = [];

        for (let i = 0; i < preguntas.length; i++) {
            estat_partida.respostes_usuari[i] = null;
        }

        // Reiniciar contador
        estat_partida.contador_preg = 0;

        // Reiniciar pregunta actual
        num_preg = 0;

        // Reiniciar marcador
        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: 0 de ${preguntas.length}`;

        // Reiniciar barra
        actualitzarBarraProgres(0);

        // Mostrar primera pregunta
        mostrarpregunta();
    })

    .catch(err => {
        console.error('Error al cargar preguntas:', err);
    });


// -------------------------------------------------------------
// MOSTRAR PREGUNTA
// -------------------------------------------------------------

function mostrarpregunta() {

    // Obtener la pregunta actual
    let pregunta = preguntas[num_preg];

    // Generar los botones de respuesta
    const botons = pregunta.answers.map((respuesta, index) => `
        <button
            type="button"
            class="btn btn-secondary btn-resposta"
            data-resposta="${index}">
            ${respuesta}
        </button>
    `).join('');


    // Generar HTML
    let html = `
        <div class="col-10 text-center border rounded p-3 mt-2 mb-4 bg-white">

            <h2>${pregunta.question}</h2>

            <img
                src="${pregunta.imatge}"
                width="200"
                height="200"
                class="d-block mx-auto mb-3"
            >

            <div class="d-flex flex-column align-items-center gap-2">

                ${botons}

            </div>

            <hr>

            <div class="d-flex justify-content-between">

                <button
                    type="button"
                    class="btn btn-primary btn-anterior">
                    🡸
                </button>

                <button
                    type="button"
                    class="btn btn-primary btn-seguent">
                    🡺
                </button>

                <button
                    id="enviar_res"
                    type="button"
                    class="btn btn-success btn-enviar"
                    style="display: none;">
                    Enviar Resultats
                </button>

            </div>


        </div>
    `;


    // Pintar la pregunta dentro de #partida
    partida.innerHTML = html;


    // ---------------------------------------------------------
    // RECUPERAR RESPUESTA GUARDADA
    // ---------------------------------------------------------

    let resposta_guardada =
        estat_partida.respostes_usuari[num_preg];


    if (resposta_guardada != null) {

        let botones =
            partida.querySelectorAll('.btn-resposta');

        botones.forEach((boton) => {

            if (boton.textContent.trim() == resposta_guardada) {

                boton.classList.remove('btn-secondary');
                boton.classList.add('btn-warning');
            }

        });
    }
}


// -------------------------------------------------------------
// SIGUIENTE PREGUNTA
// -------------------------------------------------------------

function siguiente() {

    if (num_preg < preguntas.length - 1) {

        num_preg++;

        mostrarpregunta();
    }
}


// -------------------------------------------------------------
// PREGUNTA ANTERIOR
// -------------------------------------------------------------

function anterior() {

    if (num_preg > 0) {

        num_preg--;

        mostrarpregunta();
    }
}


// -------------------------------------------------------------
// SELECCIONAR RESPUESTA
// -------------------------------------------------------------

function presionado(indexPregunta, indexResposta) {

    let botones =
        partida.querySelectorAll('.btn-resposta');


    // Quitar selección anterior
    botones.forEach((boton) => {

        boton.classList.remove('btn-warning');
        boton.classList.add('btn-secondary');

    });


    // Marcar la respuesta seleccionada
    botones[indexResposta].classList.remove('btn-secondary');
    botones[indexResposta].classList.add('btn-warning');


    // Si todavía no había respuesta para esta pregunta
    if (estat_partida.respostes_usuari[indexPregunta] === null) {

        // Guardar el texto de la respuesta
        estat_partida.respostes_usuari[indexPregunta] =
            preguntas[indexPregunta].answers[indexResposta];


        // Aumentar contador
        estat_partida.contador_preg++;


        // Actualizar marcador
        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: ${estat_partida.contador_preg} de ${preg}`;


        // Actualizar barra
        actualitzarBarraProgres(
            estat_partida.contador_preg
        );
    }


    // Mostrar botón enviar cuando se hayan respondido todas
   if (estat_partida.contador_preg === preguntas.length) {

    document.querySelector('.btn-seguent').style.display = "none";

    document.getElementById('enviar_res').style.display = "block";
}


}


// -------------------------------------------------------------
// BARRA DE PROGRESO
// -------------------------------------------------------------

function actualitzarBarraProgres(contador) {

    const progressBar =
        document.getElementById('progress-bar');

    if (progressBar) {

        let percentatge =
            (contador / preg) * 100;

        progressBar.style.width =
            `${percentatge}%`;

        progressBar.setAttribute(
            'aria-valuenow',
            percentatge
        );

        progressBar.innerText =
            `${Math.round(percentatge)}%`;
    }
}


// -------------------------------------------------------------
// ENVIAR RESPUESTAS
// -------------------------------------------------------------

function enviarRespostes() {

    // Detener el temporizador
    clearInterval(intervalo_tiempo);

    // Ocultar botón de enviar
    document.getElementById('enviar_res').style.display = "none";


    // Convertir el tiempo a minutos y segundos
    let minutos = Math.floor(tiempo / 60);
    let segundos = tiempo % 60;

    if (minutos < 10) {
        minutos = "0" + minutos;
    }

    if (segundos < 10) {
        segundos = "0" + segundos;
    }

    let tiempoFinal = `${minutos}:${segundos}`;


    fetch('/comprovar', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            sessionId: estat_partida.sessionId,

            respostes_usuari:
                estat_partida.respostes_usuari
        })

    })

    .then(response => {

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.json();
    })

    .then(data => {

        const contenedorPartida =
            document.getElementById('partida');


        contenedorPartida.innerHTML = `
            <div class="col-10 text-center border rounded p-4 my-4 bg-white mx-auto">

                <h2>Cuestionario Finalizado</h2>

                <p class="fs-4">
                    Has acertado
                    <strong>${data.encerts}</strong>
                    de
                    <strong>${data.encerts + data.errors}</strong>
                    preguntas.
                </p>

                <p class="fs-4">
                    Tiempo:
                    <strong>${tiempoFinal}</strong>
                </p>

            </div>
        `;
    })

    .catch(err => {

        console.error(
            'Error al enviar respuestas:',
            err
        );

    });
}
