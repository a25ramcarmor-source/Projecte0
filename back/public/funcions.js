let tiempo = 0;
const preg = 10;

let estat_partida = {
    respostes_usuari: [],
    contador_preg: 0
};

// Temporizador
setInterval(function () {
    tiempo++;

    let minutos = Math.floor(tiempo / 60);
    let segundos = tiempo % 60;

    if (minutos < 10) minutos = "0" + minutos;
    if (segundos < 10) segundos = "0" + segundos;

    const elTiempo = document.getElementById('tiempo');
    if (elTiempo) {
        elTiempo.innerHTML = `Tiempo: ${minutos}:${segundos}`;
    }
}, 1000);

fetch('/json1') // Asegúrate de que apunta a tu endpoint de preguntas
    .then(response => response.json())
    .then(data => {
        let partida = document.getElementById('partida');

        // Inicializar array a null para las 10 preguntas
        for (let i = 0; i < preg; i++) {
            estat_partida.respostes_usuari[i] = null;
        }

        document.getElementById('marcador').innerHTML = `Preguntes respostes: 0 de ${preg}`;

        let html = '';
        const preguntasList = data.preguntes || data;

        // Usamos 'i' directamente como índice
        for (let i = 0; i < preg; i++) {
            let pregunta = preguntasList[i];
            if (!pregunta) break;

            html += `
                <div class="col-10 text-center border rounded p-3 mt-2 mb-4 bg-white">
                    <h2>${pregunta.pregunta_text}</h2>

                    <img src="${pregunta.imatge}" 
                         width="200" 
                         height="200" 
                         class="d-block mx-auto mb-3" alt="Señal">

                    <div class="d-flex flex-column align-items-center gap-2">
                        <button onclick="presionado(${i}, 0)" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[0]}
                        </button>

                        <button onclick="presionado(${i}, 1)" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[1]}
                        </button>

                        <button onclick="presionado(${i}, 2)" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[2]}
                        </button>
                    </div>

                    <hr>
                </div>
            `;
        }

        partida.innerHTML = html;
    })
    .catch(err => console.error('Error al cargar preguntas:', err));

function renderitzar_marcador() {
    document.getElementById('marcador').innerHTML = `Preguntes respostes: ${estat_partida.contador_preg} de ${preg}`;

    let porcentaje = (estat_partida.contador_preg / preg) * 100;
    const progreso = document.getElementById('progreso');
    if (progreso) {
        progreso.style.width = porcentaje + "%";
        progreso.innerHTML = porcentaje + "%";
    }
}

function presionado(indexPregunta, indexResposta) {
    // indexPregunta ya es el índice exacto 0, 1, 2...
    if (estat_partida.respostes_usuari[indexPregunta] === null) {
        estat_partida.respostes_usuari[indexPregunta] = indexResposta;
        estat_partida.contador_preg++;

        renderitzar_marcador();
    }

    if (estat_partida.contador_preg === preg) {
        const btnEnviar = document.getElementById('enviar_res');
        if (btnEnviar) {
            btnEnviar.classList.remove('hidden');
        }
    }
}