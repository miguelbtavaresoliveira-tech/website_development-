const multer = require('multer'); //biblioteca para lidar com multipart/form-data(enviar arquivos através de formularios)
const path = require('path'); // Serve para manipular os caminhos de pasta 
const fs = require('fs'); // Significa File System(sistema de arquivos, permitindo que o código crie, delete ou altere pastas e arquivos diretamente no disco rígido do servidor)

const uploadDir = 'uploads'; //cria uma constante com o nome da pasta onde as fotos serão salvas
if (!fs.existsSync(uploadDir)){ //verifica se existe uma pasta com esse nome, retornando true ou false
    fs.mkdirSync(uploadDir); // O node cria a pasta uploads de forma sincrona, garantindo que a foto não seja salva em uma pasta que não existe
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { //o multer passa a requisição(req), dados do arquivo(file) e uma função callback(cb)
    cb(null, uploadDir + '/'); // o calbeck avisa que a decisão foi tomada e o primeiro parâmetro null(indica que não houve erros), o segundo é o caminho final da pasta(uploads/)
  },
  filename: function (req, file, cb) { //para que evite um usuario colocar o mesmo nome da foto de outro e assim sobre escrever e atualizar a imagem errada geramos um numero aleatório
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // pega a data e hora exata gera um número aleatório e junta os valores com um traço no meio
    cb(null, uniqueSuffix + path.extname(file.originalname)); //o patch.extname descobre a extenção EX:(.png), originalname é o nome da foto no computador do usuário
  }
});

module.exports = multer({ storage }); //storage significa armazenamento