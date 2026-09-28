const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  try {
    // Leer JSON
    const json = fs.readFileSync('./preguntes.json', 'utf-8');
    const preguntes = JSON.parse(json);

    // Conectar a la base de datos
    const con = await mysql.createConnection({
      host: "db",
      user: "user",
      password: "user",
      database: "quiz_db"
    });

    console.log("¡Conectado exitosamente!");

    // Cerrar conexión al terminar
    await con.end();
  } catch (err) {
    console.error("Ocurrió un error:", err.message);
  }
}

main();