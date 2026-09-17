let tiempo = 0;

let estat_partida = {
    respostes_usuari: [],
    contador_preg: 0
}

setInterval(function () {
    tiempo++;
    let segundos = tiempo;

    document.getElementById('tiempo').innerHTML =
        `Tiempo: ${segundos} segons`;

}, 1000);


fetch('/json1')
    .then(response => response.json())
    .then(data => {

        let partida = document.getElementById('partida');

        let p_elegida = [];

        while (p_elegida.length < 10) {

            let numero = Math.floor(Math.random() * 25);

            if (!p_elegida.includes(numero)) {
                p_elegida.push(numero);
            }
        }


        for (let i = 0; i < 10; i++) {
            estat_partida.respostes_usuari[i] = null;
        }


        let html = '';

        for (let i = 0; i < p_elegida.length; i++) {

            let pregunta = data.preguntes[p_elegida[i]];

            html += `
                <div class="col-10 text-center border rounded p-3 mt-3 mb-4 bg-white">

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

    document.getElementById('marcador').innerHTML = `Preguntes Respostes: ${estat_partida.contador_preg} de 10`;
}

function presionado(preg, res) {
    if (estat_partida.respostes_usuari[preg] == null) {
        estat_partida.respostes_usuari[preg] = res
        estat_partida.contador_preg++;
        renderitzar_marcador();
    };
}
