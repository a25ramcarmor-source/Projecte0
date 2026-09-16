fetch('http://localhost:3000/json1')
    .then(response => response.json())
    .then(data => {

        let partida = document.getElementById('partida');

        let pregunta = data.preguntes[0];

        let html = `
            <h2>${pregunta.pregunta}</h2>

            <img src="${pregunta.imatge}" width="400">

            <p>${pregunta.respostes[0].etiqueta}</p>
            <p>${pregunta.respostes[1].etiqueta}</p>
            <p>${pregunta.respostes[2].etiqueta}</p>
        `;

        partida.innerHTML = html;
    });