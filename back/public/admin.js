
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

                            <a
                                href="pregunta.html?id=${pregunta.id}"
                                class="btn btn-info btn-sm">
                                Veure
                            </a>    

                            <a
                                href="actualizar.html?id=${pregunta.id}"
                                class="btn btn-warning btn-sm"
                            >
                                Actualizar
                            </a>

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
// 6. VER UNA PREGUNTA
// ============================================================

// Comprobar si estamos en pregunta.html
const contenedorImagen = document.querySelector("#contenedorImagen");

if (contenedorImagen) {

    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    const mensaje = document.querySelector("#mensaje");

    if (!id) {

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No se ha indicado ninguna pregunta.
            </div>
        `;

    } else {

        fetch(`/api/preguntes/${id}`)
            .then(response => {

                if (!response.ok) {
                    throw new Error("No se ha podido obtener la pregunta");
                }

                return response.json();
            })

            .then(pregunta => {

                // Mostrar pregunta
                document.querySelector("#pregunta_text").textContent =
                    pregunta.pregunta_text;


                // ==========================================
                // MOSTRAR IMAGEN
                // ==========================================

                if (pregunta.imatge) {

                    const imagen = document.querySelector("#imatge");

                    imagen.src = pregunta.imatge;

                    contenedorImagen.style.display = "block";
                }


                // ==========================================
                // MOSTRAR OPCIONES
                // ==========================================

                const opciones = pregunta.opcions || [];

                opciones.forEach((opcio, index) => {

                    if (index >= 3) return;

                    const elemento =
                        document.querySelector(`#opcion${index + 1}`);

                    if (opcio.es_correcta) {

                        elemento.innerHTML = `
                            <div class="input-group">
                                <span class="input-group-text bg-success text-white">
                                    ✓
                                </span>

                                <div class="form-control bg-success-subtle">
                                    ${opcio.text_opcio}
                                </div>

                                <span class="input-group-text text-success fw-bold">
                                    Correcta
                                </span>
                            </div>
                        `;

                    } else {

                        elemento.innerHTML = `
                            <div class="input-group">
                                <span class="input-group-text bg-danger text-white">
                                    ✗
                                </span>

                                <div class="form-control bg-danger-subtle">
                                    ${opcio.text_opcio}
                                </div>

                                <span class="input-group-text text-danger fw-bold">
                                    Incorrecta
                                </span>
                            </div>
                        `;
                    }
                });

            })

            .catch(error => {

                console.error(error);

                if (mensaje) {
                    mensaje.innerHTML = `
                        <div class="alert alert-danger">
                            Error al cargar la pregunta.
                        </div>
                    `;
                }
            });
    }
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
// ACTUALIZAR UNA PREGUNTA
// ============================================================

// Solo ejecutar en actualizar.html
const formularioActualizar = document.querySelector("#formActualizar");

if (formularioActualizar) {

    // Obtener el ID de la URL
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    const mensaje = document.querySelector("#mensaje");

    // Si no hay ID
    if (!id) {

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No se ha indicado ninguna pregunta.
            </div>
        `;

    } else {

        // ========================================================
        // CARGAR LA PREGUNTA
        // ========================================================

        fetch(`/api/preguntes/${id}`)

            .then(response => {

                if (!response.ok) {
                    throw new Error("No se ha podido obtener la pregunta");
                }

                return response.json();
            })

            .then(pregunta => {

                // Rellenar pregunta
                document.querySelector("#pregunta_text").value =
                    pregunta.pregunta_text;


                // ====================================================
                // RELLENAR OPCIONES
                // ====================================================

                const opciones = pregunta.opcions || [];

                opciones.forEach((opcio, index) => {

                    if (index >= 3) return;

                    const input =
                        document.querySelector(`#opcion${index + 1}`);

                    input.value = opcio.text_opcio;


                    // Marcar radio de respuesta correcta
                    if (opcio.es_correcta) {

                        document.querySelector(
                            `input[name="correcta"][value="${index}"]`
                        ).checked = true;
                    }

                });


                // ====================================================
                // MOSTRAR IMAGEN ACTUAL
                // ====================================================

                if (pregunta.imatge) {

                    document.querySelector("#imagenActual").innerHTML = `
                        <div class="mt-2">
                            <p class="mb-2">
                                <strong>Imagen actual:</strong>
                            </p>

                            <img
                                src="${pregunta.imatge}"
                                alt="Imagen actual"
                                class="img-fluid rounded border"
                                style="max-height: 200px;"
                            >
                        </div>
                    `;
                }

            })

            .catch(error => {

                console.error(error);

                mensaje.innerHTML = `
                    <div class="alert alert-danger">
                        Error al cargar la pregunta.
                    </div>
                `;

            });


        // ========================================================
        // ENVIAR ACTUALIZACIÓN
        // ========================================================

        formularioActualizar.addEventListener("submit", async function (event) {

            event.preventDefault();


            // Obtener datos
            const pregunta_text =
                document.querySelector("#pregunta_text").value.trim();

            const opcion1 =
                document.querySelector("#opcion1").value.trim();

            const opcion2 =
                document.querySelector("#opcion2").value.trim();

            const opcion3 =
                document.querySelector("#opcion3").value.trim();

            const correcta =
                document.querySelector('input[name="correcta"]:checked');


            // ====================================================
            // VALIDACIONES
            // ====================================================

            if (!pregunta_text) {

                mensaje.innerHTML = `
                    <div class="alert alert-warning">
                        Debes escribir una pregunta.
                    </div>
                `;

                return;
            }


            const opcionesTexto = [
                opcion1,
                opcion2,
                opcion3
            ];


            // Eliminar opciones vacías
            const opciones = opcionesTexto
                .map((texto, index) => ({
                    texto: texto,
                    index: index
                }))
                .filter(opcion => opcion.texto !== "");


            // Mínimo 2 opciones
            if (opciones.length < 2) {

                mensaje.innerHTML = `
                    <div class="alert alert-warning">
                        Debes introducir al menos 2 opciones.
                    </div>
                `;

                return;
            }


            // Comprobar que se ha seleccionado una correcta
            if (!correcta) {

                mensaje.innerHTML = `
                    <div class="alert alert-warning">
                        Debes seleccionar cuál es la respuesta correcta.
                    </div>
                `;

                return;
            }


            // Comprobar que la respuesta correcta tiene texto
            const indiceCorrecta = parseInt(correcta.value);

            if (opcionesTexto[indiceCorrecta] === "") {

                mensaje.innerHTML = `
                    <div class="alert alert-warning">
                        La respuesta correcta no puede estar vacía.
                    </div>
                `;

                return;
            }


            // ====================================================
            // CREAR ARRAY DE OPCIONES
            // ====================================================

            const opcions = opciones.map(opcion => {

                return {
                    text_opcio: opcion.texto,
                    es_correcta: opcion.index === indiceCorrecta
                };

            });


            // ====================================================
            // CREAR FORMDATA
            // ====================================================

            const formData = new FormData();

            formData.append(
                "pregunta_text",
                pregunta_text
            );

            formData.append(
                "opcions",
                JSON.stringify(opcions)
            );


            // ====================================================
            // IMAGEN NUEVA
            // ====================================================

            const archivoImagen =
                document.querySelector("#imatge").files[0];

            if (archivoImagen) {

                formData.append(
                    "imatge",
                    archivoImagen
                );
            }


            // ====================================================
            // ENVIAR PUT
            // ====================================================

            try {

                const response = await fetch(
                    `/api/preguntes/${id}`,
                    {
                        method: "PUT",
                        body: formData
                    }
                );


                const resultado = await response.json();


                if (!response.ok) {
                    throw new Error(
                        resultado.error ||
                        "No se ha podido actualizar la pregunta"
                    );
                }


                // Mostrar mensaje
                mensaje.innerHTML = `
                    <div class="alert alert-success">
                        Pregunta actualizada correctamente.
                    </div>
                `;


                // Volver al admin después de 1 segundo
                setTimeout(() => {

                    window.location.href = "admin.html";

                }, 1000);


            } catch (error) {

                console.error(error);

                mensaje.innerHTML = `
                    <div class="alert alert-danger">
                        Error al actualizar la pregunta:
                        ${error.message}
                    </div>
                `;
            }

        });

    }
}

// ============================================================
// 5. CARGAR LAS PREGUNTAS AL ABRIR LA PÁGINA
// ============================================================

cargarPreguntas();