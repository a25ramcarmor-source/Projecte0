fetch('/json1')
    .then(response => response.json())
    .then(data => {

        let partida = document.getElementById('partida');

        let html = '';

        for (let i = 0; i < data.preguntes.length; i++) {

            let pregunta = data.preguntes[i];

           html += `
    <div class="col-10 text-center border rounded p-3 mt-3 mb-4 bg-white">
        <h2>${pregunta.pregunta_text}</h2>

        <img src="${pregunta.imatge}" width="200" height="200" class="d-block mx-auto mb-3">

        <div class="d-flex flex-column align-items-center gap-2">
            <button onclick="presionado()" type="button" class="btn btn-secondary">${pregunta.respostes[0]}</button>
            <button onclick="presionado()" type="button" class="btn btn-secondary">${pregunta.respostes[1]}</button>
            <button onclick="presionado()" type="button" class="btn btn-secondary">${pregunta.respostes[2]}</button>
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