const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let users = [];

// Cargar usuarios desde el archivo .json
const usersFilePath = path.join(__dirname, '../../users.json');
fs.readFile(usersFilePath, (err, data) => {
  if (!err) {
    users = JSON.parse(data);
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    res.json({ success: false, message: 'Usuario ya existe' });
  } else {
    users.push({ username, password });
    fs.writeFile(usersFilePath, JSON.stringify(users), err => {
      if (err) {
        res.json({ success: false, message: 'Error al guardar el usuario' });
      } else {
        res.json({ success: true });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
