-- init.sql
CREATE DATABASE IF NOT EXISTS quiz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quiz_db;

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS preguntes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_text TEXT NOT NULL,
    imatge VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de opciones de respuesta
CREATE TABLE IF NOT EXISTS opcions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_id INT NOT NULL,
    text_opcio TEXT NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (pregunta_id) REFERENCES preguntes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;