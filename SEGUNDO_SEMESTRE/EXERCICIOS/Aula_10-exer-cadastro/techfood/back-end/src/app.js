const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const routes = require('./routes'); 


// Middlewares globais
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Registro de todas as rotas da API centralizadas
app.use('/', routes);

module.exports = app;
