
// Obtener el tbody de la tabla
const tabla = document.querySelector("tbody");

// ============================================================
// 1. MOSTRAR TODAS LAS PREGUNTAS
// ============================================================

function cargarPreguntas() {

    fetch("/api/preguntes")
        .then(response => {

            if (!response.ok) {
                throw new Error("Error al obtener las preguntas");
            }

            return response.json();
        })
        .then(preguntes => {

            let html = "";

            preguntes.forEach(pregunta => {

                html += `
                    <tr>
                        <td>${pregunta.id}</td>

                        <td>
                            ${pregunta.pregunta_text}
                        </td>

                        <td>
                            <button 
                                class="btn btn-warning btn-sm"
                                onclick="editarPregunta(${pregunta.id}, '${pregunta.pregunta_text.replace(/'/g, "\\'")}')">
                                Actualizar
                            </button>

                            <button 
                                class="btn btn-danger btn-sm"
                                onclick="eliminarPregunta(${pregunta.id})">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                `;
            });

            tabla.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            tabla.innerHTML = `
                <tr>
                    <td colspan="3">
                        Error al cargar las preguntas
                    </td>
                </tr>
            `;
        });
}



// ============================================================
// CREAR PREGUNTA
// ============================================================

const formPregunta = document.querySelector("#formPregunta");

if (formPregunta) {

    formPregunta.addEventListener("submit", function (event) {

        event.preventDefault();


        // Obtener pregunta
        const preguntaText =
            document.querySelector("#pregunta_text").value.trim();


        // Obtener opciones
        const opcion1 =
            document.querySelector("#opcion1").value.trim();

        const opcion2 =
            document.querySelector("#opcion2").value.trim();

        const opcion3 =
            document.querySelector("#opcion3").value.trim();


        // Obtener respuesta correcta
        const correcta =
            document.querySelector('input[name="correcta"]:checked');


        // Comprobar que se ha seleccionado una correcta
        if (!correcta) {

            document.querySelector("#mensaje").innerHTML = `
                <div class="alert alert-danger">
                    Debes seleccionar cuál es la respuesta correcta.
                </div>
            `;

            return;
        }


        // Crear las opciones
        const opcions = [

            {
                text_opcio: opcion1,
                es_correcta: correcta.value === "0"
            },

            {
                text_opcio: opcion2,
                es_correcta: correcta.value === "1"
            },

            {
                text_opcio: opcion3,
                es_correcta: correcta.value === "2"
            }

        ]
        // Eliminar las opciones que estén vacías
        .filter(opcio => opcio.text_opcio !== "");


        // Comprobar que hay al menos 2 opciones
        if (opcions.length < 2) {

            document.querySelector("#mensaje").innerHTML = `
                <div class="alert alert-danger">
                    Debes introducir al menos 2 opciones.
                </div>
            `;

            return;
        }


        // Comprobar que la respuesta correcta no sea
        // una opción que hemos dejado vacía
        const tieneCorrecta = opcions.some(
            opcio => opcio.es_correcta
        );

        if (!tieneCorrecta) {

            document.querySelector("#mensaje").innerHTML = `
                <div class="alert alert-danger">
                    La respuesta correcta debe ser una opción rellenada.
                </div>
            `;

            return;
        }


        // Crear FormData
        const datos = new FormData();

        datos.append(
            "pregunta_text",
            preguntaText
        );

        datos.append(
            "opcions",
            JSON.stringify(opcions)
        );


        // Imagen
        const inputImagen =
            document.querySelector("#imatge");

        if (inputImagen.files.length > 0) {

            datos.append(
                "imatge",
                inputImagen.files[0]
            );
        }


        // Enviar al servidor
        fetch("/api/preguntes", {

            method: "POST",

            body: datos

        })

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "No se ha podido crear la pregunta"
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(data);

            document.querySelector("#mensaje").innerHTML = `
                <div class="alert alert-success">
                    Pregunta creada correctamente.
                </div>
            `;

            formPregunta.reset();

        })

        .catch(error => {

            console.error(error);

            document.querySelector("#mensaje").innerHTML = `
                <div class="alert alert-danger">
                    Error al crear la pregunta.
                </div>
            `;

        });

    });

}


// ============================================================
// 3. ELIMINAR UNA PREGUNTA
// ============================================================

function eliminarPregunta(id) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar esta pregunta?"
    );

    if (!confirmar) {
        return;
    }

    fetch(`/api/preguntes/${id}`, {

        method: "DELETE"

    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Error al eliminar la pregunta");
        }

        return response.json();
    })

    .then(data => {

        console.log(data);

        // Actualizar la tabla
        // sin recargar la página
        cargarPreguntas();
    })

    .catch(error => {

        console.error(error);

        alert("No se ha podido eliminar la pregunta");
    });
}


// ============================================================
// 4. ACTUALIZAR UNA PREGUNTA
// ============================================================

function editarPregunta(id, preguntaActual) {

    const nuevaPregunta = prompt(
        "Modifica la pregunta:",
        preguntaActual
    );

    // Cancelar
    if (nuevaPregunta === null) {
        return;
    }

    // Campo vacío
    if (nuevaPregunta.trim() === "") {
        alert("La pregunta no puede estar vacía");
        return;
    }

    fetch(`/api/preguntes/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            pregunta_text: nuevaPregunta
        })
    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Error al actualizar la pregunta");
        }

        return response.json();
    })

    .then(data => {

        console.log(data);

        // Actualizar tabla sin recargar
        cargarPreguntas();
    })

    .catch(error => {

        console.error(error);

        alert("No se ha podido actualizar la pregunta");
    });
}


// ============================================================
// 5. CARGAR LAS PREGUNTAS AL ABRIR LA PÁGINA
// ============================================================

cargarPreguntas();