-- init.sql
CREATE DATABASE IF NOT EXISTS quiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_db;

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS PREGUNTES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_text TEXT NOT NULL,
    imatge VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de opciones de respuesta
CREATE TABLE IF NOT EXISTS OPCIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_id INT NOT NULL,
    text_opcio VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (pregunta_id) REFERENCES PREGUNTES(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pregunta_opcio (pregunta_id, text_opcio) -- ✅ Restricción de unicidad
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;