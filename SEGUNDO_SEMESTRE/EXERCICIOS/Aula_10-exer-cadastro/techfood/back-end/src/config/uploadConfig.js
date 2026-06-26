const multer = require('multer');
const path = require('path');

// 1. Configuração do armazenamento (Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde será salvo
    },
    filename: (req, file, cb) => {
        // Cria um nome único: Data de agora + extensão original (.jpg, .png)
        const nomeUnico = Date.now() + path.extname(file.originalname);
        cb(null, nomeUnico);
    }
});

// 2. Filtro de Segurança (File Filter)
const filtroDeImagem = (req, file, cb) => {
    // Definimos os formatos que aceitamos
    const formatosPermitidos = /jpeg|jpg|png|webp/;
    
    // Verificamos a extensão do arquivo e o tipo MIME (assinatura digital do arquivo)
    const extensaoValida = formatosPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = formatosPermitidos.test(file.mimetype);

    if (extensaoValida && mimeValido) {
        cb(null, true); // Passou no teste! Pode salvar.
    } else {
        cb(new Error('Apenas imagens (JPG, JPEG, PNG ou WEBP) são permitidas!'), false); // Barrado!
    }
};

// 3. Montando o Upload com o limite de 2MB
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // A matemática de 2MB: 2 * 1024KB * 1024Bytes
    },
    fileFilter: filtroDeImagem
});

// Exporte o upload para usar nas suas rotas (ex: upload.single('imagem'))
module.exports = upload;