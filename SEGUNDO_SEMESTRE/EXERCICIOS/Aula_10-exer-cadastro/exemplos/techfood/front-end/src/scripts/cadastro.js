/* ==========================================================================
   CADASTRO.JS — Lógica da tela de inserção de novos produtos. 

   ROADMAP DESTE ARQUIVO:
   [✔] Aula 7  — Manipulação do DOM: Captura de inputs do formulário.
   [✔] Aula 8  — UX/UI: Sistema de Pré-visualização (Preview) de Imagem local.
   [✔] Aula 10 — Integração Assíncrona: Consumo da função cadastrarProduto()
                 da camada api.js usando blocos try/catch/finally.
   [ ] Futuro  — Validação Avançada: Bloqueio de tamanho máximo de arquivo (ex: 2MB)
                 para evitar sobrecarga no servidor de armazenamento.

   Depende de api.js carregado previamente no escopo global do HTML.
   ========================================================================== */

// ─────────────────────────────────────────────────────────────────────────────
// MAPEAMENTO GLOBAL DOS ELEMENTOS DO DOM
// Centralizar as buscas por IDs no topo evita processamento repetido do navegador.
// ─────────────────────────────────────────────────────────────────────────────
const form = document.querySelector('.form-produto');
const inputNome = document.getElementById('produto-nome');
const inputPreco = document.getElementById('produto-preco');
const inputDescricao = document.getElementById('produto-descricao');
const inputImagem = document.getElementById('produto-image');
const btnSubmit = document.getElementById('btn-submit');

// Elementos de Interface (Feedback Visual e Prévia)
const imagemPreviewBox = document.getElementById('imagemPreviewBox');
const imagePreview = document.getElementById('imagePreview');
const feedbackSection = document.getElementById('feedbackSection');
const produtoOut = document.getElementById('produtoOut');

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE PREVIEW DE IMAGEM
// Monitora a escolha do arquivo para renderizar na tela antes de fazer o upload.
// ─────────────────────────────────────────────────────────────────────────────
inputImagem.addEventListener('change', () => {
    const arquivo = inputImagem.files[0]; // Captura o primeiro arquivo selecionado da lista

    if (arquivo) {
        // O FileReader() é uma API nativa do navegador que lê arquivos locais
        // do computador do usuário de forma assíncrona, sem gastar internet.
        const reader = new FileReader();

        // Evento gatilho: roda assim que o navegador terminar de ler o arquivo em memória
        reader.onload = (e) => {
            imagePreview.src = e.target.result; // O arquivo lido vira uma string no formato Base64 DataURL
            imagemPreviewBox.classList.remove('oculta'); // Remove a classe que escondia a caixa
        };

        // Solicita ao sistema operacional a leitura do arquivo para conversão de exibição
        reader.readAsDataURL(arquivo);
    } else {
        // Caso o usuário abra a janela de seleção e clique em "Cancelar"
        limparPainelPreview();
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA DO FORMULÁRIO E ENVIO ASSÍNCRONO
// ─────────────────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Detém o comportamento padrão do HTML de recarregar a página

    // Validação de segurança primária (Front-end defensive design)
    if (!inputNome.value.trim() || !inputPreco.value || !inputDescricao.value.trim()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!inputImagem.files[0]) {
        alert('Por favor, selecione uma foto para o prato.');
        return;
    }

    try {
        // Bloqueio de Segurança contra Duplo Clique:
        // Evita que usuários ansiosos cliquem 5 vezes seguidas e dupliquem o item no MySQL
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Cadastrando... ⏳';

        // Criação do contêiner FormData necessário para envios Multipart
        const formData = new FormData();
        formData.append('nome', inputNome.value.trim());
        formData.append('preco', inputPreco.value);
        formData.append('descricao', inputDescricao.value.trim());
        formData.append('imagem', inputImagem.files[0]); // Chave "imagem" combinada com o upload.single('imagem') do back-end

        // Consome a função assíncrona declarada na camada de rede (api.js)
        const respostaServidor = await cadastrarProduto(formData);

        // Se chegou aqui, a resposta foi de sucesso (Status 200/21)
        exibirCardSucesso(respostaServidor);
        
        // Reseta o formulário para os valores padrão de fábrica
        form.reset();
        limparPainelPreview();

    } catch (erro) {
        // Tratamento centralizado de exceções: exibe a mensagem tratada vinda do servidor
        console.error('Falha na operação de cadastro:', erro);
        alert(`Falha no cadastro: ${erro.message}`);
    } finally {
        // Bloco obrigatório: Restaura o botão para uso futuro, dando certo ou dando errado
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Cadastrar Produtos';
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÕES AUXILIARES E DE RENDERIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrói dinamicamente o painel de confirmação visual com dados da API
 * @param {Object} resposta Dados devolvidos pelo banco de dados após a inserção
 */
function exibirCardSucesso(resposta) {
    feedbackSection.classList.remove('oculto');
    
    // Formata o número bruto em padrão monetário brasileiro (R$ XX,XX)
    const precoFormatado = Number(inputPreco.value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Injeta a estrutura de feedback customizada
    produtoOut.innerHTML = `
        <div style="padding: 15px; border-left: 5px solid #27ae60; background: #f9fefb; margin-top: 15px; border-radius: 4px;">
            <p style="margin-bottom: 5px; color: #27ae60;"><strong>✔️ ${resposta.mensagem || 'Produto salvo com sucesso!'}</strong></p>
            <p style="margin: 3px 0;"><strong>Item:</strong> ${inputNome.value.trim()}</p>
            <p style="margin: 3px 0;"><strong>Valor cadastrado:</strong> ${precoFormatado}</p>
        </div>
    `;

    // Efeito sênior: Rola a viewport até a caixinha de sucesso de forma suave
    feedbackSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reseta o elemento visual da imagem de prévia
 */
function limparPainelPreview() {
    imagePreview.src = '';
    imagemPreviewBox.classList.add('oculta');
}