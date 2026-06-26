/* ==========================================================================
   CADASTRO.JS — Lógica da tela de inserção de novos produtos. 
   ========================================================================== */



// ─────────────────────────────────────────────────────────────────────────────
// MAPEAMENTO GLOBAL DOS ELEMENTOS DO DOM
// ─────────────────────────────────────────────────────────────────────────────
const form = document.querySelector('.form-produto');
const inputImagem = document.getElementById('produto-image');
const btnSubmit = document.getElementById('btn-submit');

// Elementos de Interface (Feedback Visual e Prévia)
const imagemPreviewBox = document.getElementById('imagemPreviewBox');
const imagePreview = document.getElementById('imagePreview');
const feedbackSection = document.getElementById('feedbackSection');
const produtoOut = document.getElementById('produtoOut');
const selecaoCategoria = document.querySelector("#categoria")
const erroSelecaoCategoria = document.querySelector("#erro-categoria")


// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE PREVIEW DE IMAGEM (ATUALIZADO PARA ALTA PERFORMANCE)
// ─────────────────────────────────────────────────────────────────────────────
inputImagem.addEventListener('change', () => {
    const arquivo = inputImagem.files[0];

    if (arquivo) {
        // screateObjectURL cria um link temporário na memória local do navegador.
        // É instantâneo, não exige eventos assíncronos (onload) e consome quase zero memória.
        imagePreview.src = URL.createObjectURL(arquivo);
        imagemPreviewBox.classList.remove('oculta');
    } else {
        limparPainelPreview();
    }
});


selecaoCategoria.addEventListener("change", function() {
        if (selecaoCategoria.value !== "") {
            selecaoCategoria.classList.remove("input-erro")
            erroSelecaoCategoria.style.display = "none"
        } 
    })

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA DO FORMULÁRIO E ENVIO ASSÍNCRONO (ATUALIZADO PARA ESCALABILIDADE)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA DO FORMULÁRIO E ENVIO ASSÍNCRONO (ATUALIZADO E UNIFICADO)
// ─────────────────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    
    // 1. Limpa os erros visuais antes de tentar validar novamente
    limparErrosFormulario();
    let temErro = false; // "Bandeira" para saber se paramos o envio

    // 2. Validação da Imagem
    if (!inputImagem.files[0]) {
        // Crie um <span class="mensagem-erro" id="erro-imagem"></span> no seu HTML embaixo do input da imagem
        mostrarErro('produto-image', 'erro-imagem', 'Por favor, selecione uma foto.');
        temErro = true;
    }

    const formData = new FormData(form);

    // 3. Aplica o .trim() para limpar espaços em branco de todos os textos
    for (let [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            formData.set(key, value.trim());
        }
    }

    // 4. Validação do Nome
    if (!formData.get('nome')) {
        mostrarErro('produto-nome', 'erro-nome', 'O nome do produto é obrigatório.');
        temErro = true;
    }

    // 5. Validação e Normalização do Preço (A técnica que resolveu nosso problema!)
    const precoBruto = formData.get('preco');
    const precoNormalizado = precoBruto ? precoBruto.replace(',', '.') : '';
    formData.set('preco', precoNormalizado); // Salva de volta no FormData com ponto

    const precoNumerico = Number(precoNormalizado);
    if (!precoNumerico || precoNumerico <= 0) {
        mostrarErro('produto-preco', 'erro-preco', 'Digite um preço válido maior que zero.');
        temErro = true;
    }

    // 6. Validação da Descrição
    // (Certifique-se de que o input da descrição tem o id "produto-descricao" e o span tem o id "erro-descricao")
    if (!formData.get('descricao')) {
        mostrarErro('produto-descricao', 'erro-descricao', 'A descrição é obrigatória.');
        temErro = true;
    }

    if (!formData.get('categoria')) {
        selecaoCategoria.classList.add("input-erro")
        erroSelecaoCategoria.style.display = 'block'
        temErro = true
    }

    // Se a nossa bandeira de erro foi levantada, paramos o código aqui!
    if (temErro) return;

    // --- SE CHEGOU AQUI, OS DADOS ESTÃO PERFEITOS ---
    try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Cadastrando... ⏳';

        const respostaServidor = await cadastrarProduto(formData);

        exibirCardSucesso(respostaServidor, formData);
        
        form.reset();
        limparPainelPreview();

    } catch (erro) {
        console.error('Falha na operação de cadastro:', erro);
        // Mantemos o alert AQUI porque isso é um erro de Servidor (API), e não de digitação do usuário.
        alert(`Falha no servidor: ${erro.message}`);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Cadastrar Produtos';
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÕES AUXILIARES E DE RENDERIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrói o painel de confirmação visual
 * @param {Object} resposta Dados devolvidos pelo servidor
 * @param {FormData} dadosEnviados Os dados validados que acabaram de ser enviados
 */
function exibirCardSucesso(resposta, dadosEnviados) {
    feedbackSection.classList.remove('oculto');
    
    // MUDANÇA: Agora pegamos o valor direto do formData, que já passou pelo .trim()
    const precoFormatado = parseFloat(dadosEnviados.get('preco')).toFixed(2).replace('.',',')

    // 1. Limpa qualquer card anterior com segurança
    produtoOut.textContent = ''; 

    // 2. Cria a caixa principal (div)
    const cardSucesso = document.createElement('div');
    cardSucesso.classList.add('card-sucesso');

    // 3. Cria o parágrafo de mensagem do servidor
    const pMensagem = document.createElement('p');
    pMensagem.classList.add('texto-sucesso');
    pMensagem.innerHTML = `<strong>✔️ ${resposta.mensagem || 'Produto salvo com sucesso!'}</strong>`; 
    // (Podemos usar innerHTML aqui porque a 'resposta.mensagem' vem do NOSSO servidor, não do input do usuário)

    // 4. Cria o parágrafo do Nome do Produto (AQUI ESTÁ A SEGURANÇA)
    const pNome = document.createElement('p');
    const strongNome = document.createElement('strong');
    strongNome.textContent = 'Item: '; // textContent é blindado contra hackers
    pNome.appendChild(strongNome);
    pNome.appendChild(document.createTextNode(dadosEnviados.get('nome'))); 

    // 5. Cria o parágrafo do Preço
    const pPreco = document.createElement('p');
    const strongPreco = document.createElement('strong');
    strongPreco.textContent = 'Valor cadastrado: ';
    pPreco.appendChild(strongPreco);
    pPreco.appendChild(document.createTextNode(precoFormatado));

    // Parágrafo categoria
    const pCategoria = document.createElement("p")
    const strongCategoria = document.createElement("strong")
    strongCategoria.textContent = 'Categoria: '
    pCategoria.appendChild(strongCategoria)
    pCategoria.appendChild(document.createTextNode(dadosEnviados.get('categoria')))

    // 6. Monta o quebra-cabeça colocando os parágrafos dentro do card, e o card na tela
    cardSucesso.append(pMensagem, pNome, pCategoria, pPreco);
    produtoOut.appendChild(cardSucesso);

    feedbackSection.scrollIntoView({ behavior: 'smooth' });
}

function limparPainelPreview() {
    // MUDANÇA: Boa prática para liberar a memória cache gerada pelo createObjectURL
    if (imagePreview.src) URL.revokeObjectURL(imagePreview.src);
    
    imagePreview.src = '';
    imagemPreviewBox.classList.add('oculta');
}

// Função para exibir o erro no campo específico
function mostrarErro(idInput, idSpan, mensagem) {
    const input = document.getElementById(idInput);
    const span = document.getElementById(idSpan);
    
    input.classList.add('input-erro');
    span.textContent = mensagem;
    span.style.display = 'block'; // Mostra o texto
}

// Função para limpar todos os erros (chamada sempre que tentamos enviar novamente)
function limparErrosFormulario() {
    document.querySelectorAll('.input-erro').forEach(input => input.classList.remove('input-erro'));
    document.querySelectorAll('.mensagem-erro').forEach(span => span.style.display = 'none');
}