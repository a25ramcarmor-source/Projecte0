const mysql = require('mysql2/promise');
const fs = require('fs');

const json = fs.readFileSync('./preguntes.json', 'utf-8');
const preguntes = JSON.parse(json);

const Rjson = fs.readFileSync('./respostes.json', 'utf-8');
const respostes = JSON.parse(Rjson);

async function main() {
  try {
    // Conectar a la base de datos
    const con = await mysql.createConnection({
      host: "db",
      user: "user",
      password: "user",
      database: "quiz_db"
    });

    console.log("¡Conectado exitosamente!");

    await insertBdd(con,preguntes, respostes);

    // Cerrar conexión al terminar
    await con.end();
  } catch (err) {
    console.error("Ocurrió un error:", err.message);
  }
}

async function insertBdd(con,preguntes, respostes) {
  const v_preguntes = preguntes.preguntes.map(p => [
    p.pregunta,
    p.pregunta_text,
    p.imatge
  ]);

  await con.query('INSERT IGNORE INTO PREGUNTES (id,pregunta_text,imatge) VALUES ?',
    [v_preguntes]
  );

  console.log('!preguntes inserides a la BDD¡');
  //Insert per les respostes
  const v_opcions = preguntes.preguntes.flatMap(p =>{

    const respostaCorrecte = respostes.find(r => p.pregunta == r.pregunta);
      return p.respostes.map(text_res =>[
        p.pregunta,
        text_res,
        Boolean(respostaCorrecte && respostaCorrecte.resposta === text_res)
      ]);
  });
  await con.query('INSERT IGNORE INTO OPCIONS (pregunta_id,text_opcio,es_correcta) VALUES ?',
    [v_opcions]
  );

  console.log('!respostes inserides a la BDD¡');

}
main();