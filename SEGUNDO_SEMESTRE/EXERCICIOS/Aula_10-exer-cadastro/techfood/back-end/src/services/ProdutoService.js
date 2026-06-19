// CORREÇÃO: Mantido o nome definitivo do arquivo do repositório conforme sua estrutura
const ProdutoRepository = require('../repositories/ProdutoRepository') 
const fs = require('fs').promises
const path = require('path')      

class ProdutoService {

    async listarProdutos () {
        // Correção de nomenclatura: plural, já que é uma lista
        const produtos = await ProdutoRepository.listarProdutos()

        return {
            sucesso: true,
            dados: produtos || [],
            total: produtos ? produtos.length : 0
        }
    }

    async buscarProdutoPorId (id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: 'ID inválido' }
        }

        const produto = await ProdutoRepository.buscarProdutoPorId(id)

        if (!produto) {
            throw { status: 404, mensagem: 'Produto não encontrado' }
        }

        return {
            sucesso: true,
            dados: produto
        }
    }

    async cadastrarProduto (dados, file) {
        
        const { nome, descricao, preco, categoria, disponivel } = dados

        // Validação defensiva: remove espaços antes de checar se está vazio
        if (!nome?.trim() || !descricao?.trim() || preco === undefined) {
            console.error("❌ Validação falhou - campos obrigatórios vazios");
            throw {
                status: 400,
                mensagem: "Nome, descrição e preço devem ser preenchidos"
            }
        }

        const precoNumerico = Number(String(preco).replace(',','.'))
        if (isNaN(precoNumerico) || precoNumerico <= 0) {
            console.error("❌ Preço inválido:", preco);
            throw {
                status: 400,
                mensagem: "Preço deve ser um número positivo"
            }
        }

        const novoProduto = {
            nome: nome.trim(),
            descricao: descricao.trim(),
            preco: precoNumerico,
            categoria: categoria || null,
            disponivel: String(disponivel) === 'false' ? false : true
        }


        // CORREÇÃO: Padronização do caminho da imagem igual ao do Update
        if (file) {
            novoProduto.imagem_url = `uploads/${file.filename}`
            console.log("🖼️ Imagem URL definida:", novoProduto.imagem_url);
        }

        const resultado = await ProdutoRepository.cadastrarProduto(novoProduto)

        
        return {
            sucesso: true,
            mensagem: "Produto cadastrado com sucesso", 
            resultado
        }
    }

    async atualizarProduto (id, dados, file) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" }
        }

        // CORREÇÃO: Nome alterado para 'produtoExistente' para refletir a realidade do dado
        const produtoExistente = await ProdutoRepository.buscarProdutoPorId(id)

        if (!produtoExistente) {
            throw { status: 404, mensagem: "Produto não encontrado" }
        }

        const produtoAtualizado = {}
        const { nome, preco, descricao, categoria, disponivel } = dados

        if (nome !== undefined) produtoAtualizado.nome = nome.trim()
        if (descricao !== undefined) produtoAtualizado.descricao = descricao.trim()
        
        if (preco !== undefined) {
            const precoNumerico = Number(String(preco).replace(',','.'))
            if (isNaN(precoNumerico) || precoNumerico <= 0) {
                throw { status: 400, mensagem: "Preço deve ser um número positivo" }
            }
            produtoAtualizado.preco = precoNumerico
        }

        if (categoria !== undefined) produtoAtualizado.categoria = categoria
        
        if (disponivel !== undefined) {
            produtoAtualizado.disponivel = String(disponivel) === 'false' ? false : true
        }

        if (file) {
            // Se o produto já tinha imagem antiga, remove do disco de forma segura
            if (produtoExistente.imagem_url) {
                const caminhoAntigo = path.join(process.cwd(), produtoExistente.imagem_url)
                await fs.unlink(caminhoAntigo).catch(() => {}) 
            }
            // Mantenho o padrão limpo de salvamento de caminhos relativos
            produtoAtualizado.imagem_url = `uploads/${file.filename}`
        }

        if (Object.keys(produtoAtualizado).length === 0 && !file) {
            throw {
                status: 400,
                mensagem: "Nenhum dado válido enviado para atualização"
            }
        }
        
        await ProdutoRepository.atualizarProduto(id, produtoAtualizado)
        
        return {
            sucesso: true,
            mensagem: "Produto atualizado com sucesso"
        }
    }

    async deletarProduto (id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" }
        }

        const produtoExistente = await ProdutoRepository.buscarProdutoPorId(id)

        if (!produtoExistente) {
            throw { status: 404, mensagem: "Produto não encontrado" }
        }

        if (produtoExistente.imagem_url) {
            const caminhoArquivo = path.join(process.cwd(), produtoExistente.imagem_url)
            await fs.unlink(caminhoArquivo).catch(() => {}) 
        }

        await ProdutoRepository.apagarProduto(id)
        
        // CORREÇÃO: Padronização do contrato de retorno para o Front-end
        return {
            sucesso: true,
            mensagem: "Produto apagado com sucesso"
        }
    }
}

module.exports = new ProdutoService()