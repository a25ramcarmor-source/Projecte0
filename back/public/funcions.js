fetch('/json1')
    .then(response => response.json())
    .then(data => {

        let partida = document.getElementById('partida');

        let html = '';

        for (let i = 0; i < data.preguntes.length; i++) {

            let pregunta = data.preguntes[i];

            html += `
                <h2>${pregunta.pregunta_text}</h2>

                <img src="${pregunta.imatge}" width="400">

                <p>${pregunta.respostes[0]}</p>
                <p>${pregunta.respostes[1]}</p>
                <p>${pregunta.respostes[2]}</p>

                <hr>
            `;
        }

        partida.innerHTML = html;
    });