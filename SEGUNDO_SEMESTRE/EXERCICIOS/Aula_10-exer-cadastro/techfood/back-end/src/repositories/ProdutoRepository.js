const pool = require("../config/database.js")





class ProdutoRepository {

    async listarProdutos () {
        // AJUSTE: Adicionado [ ] para pegar apenas as linhas de registros
        const [listaProdutos] = await pool.query('SELECT * FROM produto')
        return listaProdutos
    }

    async buscarProdutoPorId (id) {
        // AJUSTE: Adicionado [ ] para extrair o resultado puro da query
        const [mostrarProduto] = await pool.query('SELECT * FROM produto WHERE id = ?', [id])
        return mostrarProduto[0] // Retorna o objeto do produto ou undefined
    } 

    async findById (id) {
        return this.buscarProdutoPorId(id)
    } 
    
    async cadastrarProduto (dadosDoProduto) {
        try {
            const [resultadoCadastroDeProduto] = await pool.query('INSERT INTO produto SET ?', [dadosDoProduto])
            return resultadoCadastroDeProduto.insertId
        } catch (erro) {
            throw erro;
        }
    }

    async atualizarProduto (id, dadosDoProduto){
        const camposProduto = []
        const dadosProduto = []

        for (const [key, value] of Object.entries(dadosDoProduto)){
            camposProduto.push(`${key} = ?`)
            dadosProduto.push(value)
        }

        if(camposProduto.length === 0) return null 

        dadosProduto.push(id)

        const query = `UPDATE produto SET ${camposProduto.join(',')} WHERE id = ?`

        const [resultado] = await pool.query(query, dadosProduto)
        return resultado.affectedRows
    }

    async apagarProduto (id) {
        await pool.query('DELETE FROM produto WHERE id = ?', [id])
        return true
    }
}
    

module.exports = new ProdutoRepository()


