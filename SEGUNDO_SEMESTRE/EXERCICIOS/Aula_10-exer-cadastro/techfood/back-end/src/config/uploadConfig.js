<<<<<<< HEAD
const multer = require('multer');
const path = require('path');
=======
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs')

const uploadDir = 'uploads'; 
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir); 
}
>>>>>>> upstream/main

// 1. Configuração do armazenamento (Storage)
const storage = multer.diskStorage({
<<<<<<< HEAD
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
=======
  destination: function (req, file, cb) {},
  filename: function (req, file, cb) { 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  }
});

const filtroDeImagem = (req, file, cb) => {
  const formatosPermitidos = /jpeg|jpg|png|webp/

  const extencaoValida = formatosPermitidos.test(path.extname(file.originalname.toLowerCase()))
  const mimeValido = formatosPermitidos.test(file.mimeType)

  if (extencaoValida && mimeValido) {
    cb(null, true)
  } else {
    cb(new Error('Apenas imagens (JPG, JPEG, PNG ou WEBP) são permitidas!'), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: filtroDeImagem
})

module.exports = upload
>>>>>>> upstream/main
