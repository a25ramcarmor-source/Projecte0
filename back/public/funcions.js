let tiempo = 0;

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

                        <button onclick="presionado()" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[0]}
                        </button>

                        <button onclick="presionado()" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[1]}
                        </button>

                        <button onclick="presionado()" type="button" class="btn btn-secondary">
                            ${pregunta.respostes[2]}
                        </button>

                    </div>

                    <hr>
                </div>
            `;
        }

        partida.innerHTML = html;

    });


function presionado() {
    console.log('Boton presionado');
}