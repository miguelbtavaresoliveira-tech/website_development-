const express = require('express')
const router = express.Router()
const ProdutoController = require("../controllers/ProdutoController")
const upload = require ("../config/uploadConfig")

// ✅ Middleware de logging para debug
router.use((req, res, next) => {
    console.log(`📍 Rota de Produtos - ${req.method} ${req.path}`);
    next();
});

router.get('/', ProdutoController.listarProduto)
router.get('/:id', ProdutoController.buscarProdutoPorId)

// POST com upload
router.post('/', (req, res, next) => {
    console.log('📤 POST /produtos - Iniciando upload...');
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            console.error('❌ Erro no upload:', err.message);
            return res.status(400).json({ sucesso: false, mensagem: 'Erro no upload: ' + err.message, erro: err.stack });
        }
        console.log('✅ Upload concluído, chamando controlador...');
        ProdutoController.cadastrarProduto(req, res);
    });
});

router.put('/:id', upload.single('imagem'), ProdutoController.atualizarProduto)
router.delete('/:id', ProdutoController.deletarProduto)


module.exports = router