const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const routes = require('./routes'); 

// ✅ Middleware de logging PRIMEIRO - deve ser o primeiro para capturar tudo
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📨 [${timestamp}] NOVA REQUISIÇÃO`);
    console.log(`   Método: ${req.method}`);
    console.log(`   Path: ${req.path}`);
    console.log(`   Content-Type: ${req.headers['content-type']}`);
    next();
});

// Middlewares globais
app.use(cors()); // Habilita o CORS para permitir requisições do frontend
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Registro de todas as rotas da API centralizadas
app.use('/', routes);

module.exports = app;