const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/json1',(req,res) =>{
    const dades = fs.readFileSync('preguntes.json','utf-8');
    res.send(dades);
});
app.get('/json2',(req,res) =>{
    const dades2 = fs.readFileSync('respostes.json','utf-8');
    res.send(dades2);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});