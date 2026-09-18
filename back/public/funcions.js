let tiempo = 0;
let preg = 10;

let estat_partida = {
    respostes_usuari: [],
    contador_preg: 0
}

setInterval(function () {
    tiempo++;

    let minutos = Math.floor(tiempo / 60);
    let segundos = tiempo % 60;

    if (minutos < 10) {
        minutos = "0" + minutos;
    }

    if (segundos < 10) {
        segundos = "0" + segundos;
    }

    document.getElementById('tiempo').innerHTML =
        `Tiempo: ${minutos}:${segundos}`;

}, 1000);

fetch('/json1')
    .then(response => response.json())
    .then(data => {

        let partida = document.getElementById('partida');

        for (let i = 0; i < preg; i++) {
            estat_partida.respostes_usuari[i] = null;
        }

        document.getElementById('marcador').innerHTML =
            `Preguntes respostes: 0 de ${preg}`;

        let html = '';

        for (let i = 0; i < data.questions.length; i++) {

            let numero = data.questions[i];

            let pregunta = data.preguntes[numero];

            html += `
                <div class="col-10 text-center border rounded p-3 mt-2 mb-4 bg-white">

                    <h2>${pregunta.pregunta_text}</h2>

                    <img src="${pregunta.imatge}" 
                         width="200" 
                         height="200" 
                         class="d-block mx-auto mb-3">

                    <div class="d-flex flex-column align-items-center gap-2">

                        <button onclick="presionado(${pregunta.pregunta}, '${pregunta.respostes[0]}')" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[0]}
                        </button>

                        <button onclick="presionado(${pregunta.pregunta}, '${pregunta.respostes[1]}')" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[1]}
                        </button>

                        <button onclick="presionado(${pregunta.pregunta}, '${pregunta.respostes[2]}')" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[2]}
                        </button>

                    </div>

                    <hr>
                </div>
            `;
        }

        partida.innerHTML = html;
    });

function renderitzar_marcador() {

    document.getElementById('marcador').innerHTML =
        `Preguntes Respostes: ${estat_partida.contador_preg} de ${preg}`;

    let porcentaje = estat_partida.contador_preg * 10;

    document.getElementById('progreso').style.width = porcentaje + "%";

    document.getElementById('progreso').innerHTML = porcentaje + "%";
}


function presionado(preg, res) {

    if (estat_partida.respostes_usuari[preg] == null) {

        estat_partida.respostes_usuari[preg] = res;
        estat_partida.contador_preg++;

        renderitzar_marcador();
    }

    if (estat_partida.contador_preg == preg) {
        document.getElementById('enviar_res').classList.remove('hidden');
    }
}