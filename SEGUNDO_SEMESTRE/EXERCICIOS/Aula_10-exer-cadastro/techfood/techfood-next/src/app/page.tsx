'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModalBoasVindas from '@/components/ModalBoasVindas';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string | null;
  disponivel: boolean;
  imagem_url: string | null;
}

export default function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, boolean>>({});

  const carregarProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/produtos');
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem || 'Erro ao carregar produtos');
      setProdutos(dados.dados || []);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria || 'Outros'))];

  const produtosAgrupados = produtos.reduce<Record<string, Produto[]>>((acc, produto) => {
    const cat = produto.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(produto);
    return acc;
  }, {});

  const getQtd = (id: number) => quantidades[id] || 1;

  const setQtd = (id: number, val: number) => {
    setQuantidades(prev => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const salvarPedido = (produto: Produto) => {
    const quantidade = getQtd(produto.id);
    const subtotal = Number(produto.preco) * quantidade;

    const lista = JSON.parse(localStorage.getItem('techfood_pedidos') || '[]');
    lista.push({
      produto_id: produto.id,
      quantidade,
      nome: produto.nome,
      preco: Number(produto.preco),
      subtotal,
    });
    localStorage.setItem('techfood_pedidos', JSON.stringify(lista));

    // Feedback visual
    setFeedbacks(prev => ({ ...prev, [produto.id]: true }));

    setTimeout(() => {
      setFeedbacks(prev => ({ ...prev, [produto.id]: false }));
      setQtd(produto.id, 1);
    }, 1500);
  };

  const calcPreco = (produto: Produto) => {
    const qtd = getQtd(produto.id);
    return (Number(produto.preco) * qtd).toFixed(2).replace('.', ',');
  };

  return (
    <>
      <ModalBoasVindas onNomeConfirmado={() => {}} />
      <Header />
      <main>
        <section id="secao-cardapio">
          <h2 className="titulo-secao">Nosso Cardápio</h2>

          {!loading && !erro && (
            <div className="filtros-container" id="filtros-categoria">
              {categorias.map(cat => (
                <button
                  key={cat}
                  className={`btn-filtro ${filtroAtivo === cat ? 'ativo' : ''}`}
                  onClick={() => setFiltroAtivo(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div id="grid-cardapio">
            {loading && (
              <div className="vitrine-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="card-skeleton" />
                ))}
              </div>
            )}

            {erro && <p className="loading-erro">Erro ao carregar o cardápio: {erro}</p>}

            {!loading && !erro &&
              Object.entries(produtosAgrupados)
                .filter(([cat]) => filtroAtivo === 'Todos' || cat === filtroAtivo)
                .map(([nomeCategoria, pratos]) => (
                  <section key={nomeCategoria} className="categoria-section">
                    <h2>{nomeCategoria}</h2>
                    <div className="vitrine-grid">
                      {pratos.map(produto => (
                        <article key={produto.id} className="card" data-id={produto.id}>
                          <img
                            src={produto.imagem_url ? `/${produto.imagem_url}` : '/images/espaguete.png'}
                            alt={produto.nome}
                          />
                          <h3>{produto.nome}</h3>
                          <p className="desc">{produto.descricao}</p>
                          <div className="quantidade-box">
                            <button
                              className="btn-qtd btn-menos"
                              onClick={() => setQtd(produto.id, getQtd(produto.id) - 1)}
                            >
                              -
                            </button>
                            <span className="qtd-valor">{getQtd(produto.id)}</span>
                            <button
                              className="btn-qtd btn-mais"
                              onClick={() => setQtd(produto.id, getQtd(produto.id) + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="preco" data-preco={produto.preco}>
                            R$ {calcPreco(produto)}
                          </span>
                          <button
                            className="btn-pedido"
                            style={feedbacks[produto.id] ? { backgroundColor: '#27ae60' } : {}}
                            onClick={() => salvarPedido(produto)}
                            disabled={feedbacks[produto.id]}
                          >
                            {feedbacks[produto.id] ? '✓ Adicionado!' : 'Pedir Agora'}
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
