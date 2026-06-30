'use client';

import { useState, useEffect } from 'react';
import Button from '../components/common/Button'; 

export default function HomePage() {
  const [produtos, setProdutos] = useState<any[]>([]); 
  const [carrinho, setCarrinho] = useState<any[]>([]); 
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/produtos')
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data);
        setCarregando(false);
      })
      .catch((err) => {
        console.error('Falha na exibição dos produtos', err);
        setCarregando(false);
      });
  }, []);

  function adicionarAoCarrinho(produto: any) {
    setCarrinho([...carrinho, produto]);
  }

  if (carregando) return <p>Carregando Cardápio...</p>;

  return (
    <main style={{ padding: '20px' }}>
      
      {/* O SEU CABEÇALHO ANTIGO */}
      <h1>Bem vindo à Minha Hamburgueria</h1>
      <p>Essa é a página principal</p>
      <a href="/pedidos" style={{ display: 'inline-block', marginBottom: '20px', color: 'blue' }}>
        Ir para Pedidos
      </a>

      <hr style={{ margin: '20px 0' }} />

      {/* O NOVO SISTEMA DE PRODUTOS */}
      <h2>Nosso Cardápio</h2>
      <p>🛒 Itens no carrinho: <strong>{carrinho.length}</strong></p>

      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        
        {produtos.map((produto) => (
          <div key={produto.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            {/* Imagem do produto */}
            {produto.imagem && (
              <img 
                src={produto.imagem} 
                alt={produto.nome} 
                style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }} 
              />
            )}
            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>
            <p style={{ fontWeight: 'bold', color: '#e67e22' }}>R$ {Number(produto.preco).toFixed(2)}</p>

            <Button onClick={() => adicionarAoCarrinho(produto)}>
              Adicionar ao Carrinho
            </Button>
          </div>
        ))}

      </section>

    </main>
  );
}