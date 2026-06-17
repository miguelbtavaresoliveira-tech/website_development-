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

// ─────────────────────────────────────────────────────────────────────────────
// CAPTURA DO FORMULÁRIO E ENVIO ASSÍNCRONO (ATUALIZADO PARA ESCALABILIDADE)
// ─────────────────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    // Validação da imagem isolada
    if (!inputImagem.files[0]) {
        alert('Por favor, selecione uma foto para o produto.');
        return;
    }

    try {
        // Bloqueio de Segurança contra Duplo Clique
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = 'Cadastrando... ⏳';

        // MUDANÇA: Passando o 'form' diretamente, o JS captura automaticamente 
        // TODOS os inputs que possuem o atributo 'name' no HTML. 
        // Exemplo no HTML: <input type="text" name="nome" id="produto-nome">
        const formData = new FormData(form);

        // MUDANÇA INTELIGENTE: Varre todos os dados capturados.
        // Se o dado for um texto (string), ele aplica o .trim() para remover espaços.
        // Assim, você não precisa fazer isso manualmente um por um!
        for (let [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                formData.set(key, value.trim());
            }
        }

        // Validação genérica: garante que nenhum texto ficou vazio após o trim
        if (!formData.get('nome') || !formData.get('preco') || !formData.get('descricao')) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return; // Interrompe a execução antes de chamar a API
        }

        // Consome a função assíncrona (api.js) enviando o formData automatizado
        const respostaServidor = await cadastrarProduto(formData);

        // Exibe o card passando o formData para que ele saiba quais dados foram enviados
        exibirCardSucesso(respostaServidor, formData);
        
        // Reseta tudo
        form.reset();
        limparPainelPreview();

    } catch (erro) {
        console.error('Falha na operação de cadastro:', erro);
        alert(`Falha no cadastro: ${erro.message}`);
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
    const precoFormatado = Number(dadosEnviados.get('preco')).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // MUDANÇA: HTML mais limpo. Recomendo criar as classes 'card-sucesso' e 'texto-sucesso' no seu arquivo CSS.
    produtoOut.innerHTML = `
        <div class="card-sucesso">
            <p class="texto-sucesso"><strong>✔️ ${resposta.mensagem || 'Produto salvo com sucesso!'}</strong></p>
            <p><strong>Item:</strong> ${dadosEnviados.get('nome')}</p>
            <p><strong>Valor cadastrado:</strong> ${precoFormatado}</p>
        </div>
    `;

    feedbackSection.scrollIntoView({ behavior: 'smooth' });
}

function limparPainelPreview() {
    // MUDANÇA: Boa prática para liberar a memória cache gerada pelo createObjectURL
    if (imagePreview.src) URL.revokeObjectURL(imagePreview.src);
    
    imagePreview.src = '';
    imagemPreviewBox.classList.add('oculta');
}