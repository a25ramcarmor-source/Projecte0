
const express = require('express');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ======================================================
// CONFIGURACIÓN DE MULTER
// ======================================================

// Carpeta donde se guardarán las imágenes
const carpetaImagenes = path.join(__dirname, 'public', 'img');

// Crear la carpeta si no existe
if (!fs.existsSync(carpetaImagenes)) {
    fs.mkdirSync(carpetaImagenes, { recursive: true });
}

// Configuración para guardar archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaImagenes);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const nombre = Date.now() + extension;

        cb(null, nombre);
    }
});

const upload = multer({
    storage: storage
});


// ======================================================
// GET - OBTENER TODAS LAS PREGUNTAS
// ======================================================

router.get('/api/preguntes', async (req, res) => {

    try {

        const [preguntes] = await pool.query(
            'SELECT * FROM PREGUNTES'
        );

        const [opcions] = await pool.query(
            'SELECT * FROM OPCIONS'
        );

        const resultado = preguntes.map((pregunta) => {

            return {
                ...pregunta,

                opcions: opcions.filter(
                    (opcio) => opcio.pregunta_id === pregunta.id
                )
            };

        });

        res.json(resultado);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});


// ======================================================
// GET - OBTENER UNA PREGUNTA
// ======================================================

router.get('/api/preguntes/:id', async (req, res) => {

    try {

        const [preguntes] = await pool.query(
            'SELECT * FROM PREGUNTES WHERE id = ?',
            [req.params.id]
        );

        if (preguntes.length === 0) {

            return res.status(404).json({
                error: 'Pregunta no encontrada'
            });
        }

        const [opcions] = await pool.query(
            'SELECT * FROM OPCIONS WHERE pregunta_id = ?',
            [req.params.id]
        );

        res.json({
            ...preguntes[0],
            opcions: opcions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});


// ======================================================
// POST - CREAR UNA PREGUNTA
// ======================================================

router.post(
    '/api/preguntes',
    upload.single('imatge'),
    async (req, res) => {

        const connection = await pool.getConnection();

        try {

            const pregunta_text = req.body.pregunta_text;

            // Comprobar pregunta
            if (!pregunta_text) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    error: 'El campo pregunta_text es obligatorio'
                });
            }


            // Obtener opciones
            let opcions = [];

            if (req.body.opcions) {

                try {

                    opcions = JSON.parse(req.body.opcions);

                } catch (error) {

                    if (req.file) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(400).json({
                        error: 'El formato de las opciones no es válido'
                    });
                }
            }


            // Ruta de la imagen que se guardará en la BD
            let rutaImagen = null;

            if (req.file) {
                rutaImagen = '/images/' + req.file.filename;
            }


            // Comenzar transacción
            await connection.beginTransaction();


            // Crear pregunta
            const [resultPregunta] = await connection.query(
                `INSERT INTO PREGUNTES
                (pregunta_text, imatge)
                VALUES (?, ?)`,
                [
                    pregunta_text,
                    rutaImagen
                ]
            );


            const preguntaId = resultPregunta.insertId;


            // Crear opciones
            for (const opcio of opcions) {

                await connection.query(
                    `INSERT INTO OPCIONS
                    (pregunta_id, text_opcio, es_correcta)
                    VALUES (?, ?, ?)`,
                    [
                        preguntaId,
                        opcio.text_opcio,
                        opcio.es_correcta ? 1 : 0
                    ]
                );

            }


            // Confirmar cambios
            await connection.commit();


            res.status(201).json({

                message: 'Pregunta creada correctamente',

                id: preguntaId,

                pregunta_text: pregunta_text,

                imatge: rutaImagen,

                opcions: opcions

            });

        } catch (error) {

            await connection.rollback();

            // Si se había subido una imagen y hubo error,
            // eliminarla del servidor
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error(error);

            res.status(500).json({
                error: error.message
            });

        } finally {

            connection.release();
        }
    }
);


// ======================================================
// PUT - ACTUALIZAR UNA PREGUNTA
// ======================================================

router.put(
    '/api/preguntes/:id',
    upload.single('imatge'),
    async (req, res) => {

        const connection = await pool.getConnection();

        try {

            const id = req.params.id;


            // Buscar pregunta existente
            const [preguntes] = await connection.query(
                'SELECT * FROM PREGUNTES WHERE id = ?',
                [id]
            );


            if (preguntes.length === 0) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    error: 'Pregunta no encontrada'
                });
            }


            const preguntaActual = preguntes[0];


            // Si no se envía texto, mantener el anterior
            const pregunta_text =
                req.body.pregunta_text || preguntaActual.pregunta_text;


            // Mantener imagen anterior por defecto
            let rutaImagen = preguntaActual.imatge;


            // Si se ha enviado una nueva imagen
            if (req.file) {

                rutaImagen = '/images/' + req.file.filename;
            }


            // Obtener opciones
            let opcions = null;

            if (req.body.opcions) {

                try {

                    opcions = JSON.parse(req.body.opcions);

                } catch (error) {

                    if (req.file) {
                        fs.unlinkSync(req.file.path);
                    }

                    return res.status(400).json({
                        error: 'El formato de las opciones no es válido'
                    });
                }
            }


            // Comenzar transacción
            await connection.beginTransaction();


            // Actualizar pregunta
            await connection.query(
                `UPDATE PREGUNTES
                SET pregunta_text = ?, imatge = ?
                WHERE id = ?`,
                [
                    pregunta_text,
                    rutaImagen,
                    id
                ]
            );


            // Si se han enviado opciones,
            // sustituir las antiguas por las nuevas
            if (opcions !== null) {

                await connection.query(
                    'DELETE FROM OPCIONS WHERE pregunta_id = ?',
                    [id]
                );


                for (const opcio of opcions) {

                    await connection.query(
                        `INSERT INTO OPCIONS
                        (pregunta_id, text_opcio, es_correcta)
                        VALUES (?, ?, ?)`,
                        [
                            id,
                            opcio.text_opcio,
                            opcio.es_correcta ? 1 : 0
                        ]
                    );

                }
            }


            // Confirmar
            await connection.commit();


            // Si había una imagen antigua y se ha cambiado,
            // eliminar la antigua del servidor
            if (
                req.file &&
                preguntaActual.imatge
            ) {

                const imagenAntigua = path.join(
                    __dirname,
                    'public',
                    preguntaActual.imatge
                );

                if (fs.existsSync(imagenAntigua)) {
                    fs.unlinkSync(imagenAntigua);
                }
            }


            res.json({

                message: 'Pregunta actualizada correctamente',

                id: id,

                pregunta_text: pregunta_text,

                imatge: rutaImagen,

                opcions: opcions

            });

        } catch (error) {

            await connection.rollback();

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error(error);

            res.status(500).json({
                error: error.message
            });

        } finally {

            connection.release();
        }
    }
);


// ======================================================
// DELETE - ELIMINAR UNA PREGUNTA
// ======================================================

router.delete('/api/preguntes/:id', async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const id = req.params.id;


        // Buscar pregunta
        const [preguntes] = await connection.query(
            'SELECT * FROM PREGUNTES WHERE id = ?',
            [id]
        );


        if (preguntes.length === 0) {

            return res.status(404).json({
                error: 'Pregunta no encontrada'
            });
        }


        const pregunta = preguntes[0];


        await connection.beginTransaction();


        // Eliminar opciones
        await connection.query(
            'DELETE FROM OPCIONS WHERE pregunta_id = ?',
            [id]
        );


        // Eliminar pregunta
        await connection.query(
            'DELETE FROM PREGUNTES WHERE id = ?',
            [id]
        );


        await connection.commit();


        // Eliminar imagen del servidor
        if (pregunta.imatge) {

            const imagen = path.join(
                __dirname,
                'public',
                pregunta.imatge
            );

            if (fs.existsSync(imagen)) {
                fs.unlinkSync(imagen);
            }
        }


        res.json({

            message: 'Pregunta eliminada correctamente'

        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        connection.release();
    }
});


module.exports = router;
