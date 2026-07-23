'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModalBoasVindas from '@/components/ModalBoasVindas';

interface ItemPedido {
  produto_id: number;
  quantidade: number;
  nome: string;
  preco: number;
  subtotal: number;
}

interface ItemHistorico {
  nome: string;
  quantidade: number;
  preco: number;
  subtotal: number;
}

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<ItemPedido[]>([]);
  const [totalMesa, setTotalMesa] = useState(0);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [painelContaAberto, setPainelContaAberto] = useState(false);
  const [modalFecharAberto, setModalFecharAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState('');

  const carregarDados = useCallback(() => {
    const lista = JSON.parse(localStorage.getItem('techfood_pedidos') || '[]') as ItemPedido[];
    const mesa = parseFloat(sessionStorage.getItem('techfood_total_mesa') || '0');
    const hist = JSON.parse(sessionStorage.getItem('techfood_historico') || '[]') as ItemHistorico[];
    setPedidos(lista);
    setTotalMesa(mesa);
    setHistorico(hist);
  }, []);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 1000);
    return () => clearInterval(interval);
  }, [carregarDados]);

  const totalCarrinho = pedidos.reduce((acc, p) => acc + p.subtotal, 0);
  const totalGeral = totalMesa + totalCarrinho;
  const totalItens = pedidos.reduce((acc, p) => acc + p.quantidade, 0);

  const removerItem = (indice: number) => {
    const lista = [...pedidos];
    lista.splice(indice, 1);
    localStorage.setItem('techfood_pedidos', JSON.stringify(lista));
    carregarDados();
  };

  const limparPedidos = () => {
    localStorage.removeItem('techfood_pedidos');
    carregarDados();
  };

  const enviarCozinha = async () => {
    if (pedidos.length === 0) {
      alert('Adicione itens ao pedido antes de enviar!');
      return;
    }

    const cliente = sessionStorage.getItem('techfood_cliente') || 'Cliente';
    const itens = pedidos.map((p) => ({
      produto_id: p.produto_id,
      quantidade: p.quantidade,
    }));

    setEnviando(true);
    setFeedbackEnvio('');

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, itens }),
      });

      const dados = await res.json();
      if (!res.ok) throw new Error(dados.erro || 'Erro ao enviar pedido');

      const novoTotalMesa = totalMesa + totalCarrinho;
      sessionStorage.setItem('techfood_total_mesa', novoTotalMesa.toString());

      const novoHistorico = [...historico];
      pedidos.forEach((p) => {
        novoHistorico.push({
          nome: p.nome,
          quantidade: p.quantidade,
          preco: p.preco,
          subtotal: p.subtotal,
        });
      });
      sessionStorage.setItem('techfood_historico', JSON.stringify(novoHistorico));

      localStorage.removeItem('techfood_pedidos');
      carregarDados();

      setFeedbackEnvio('enviado');
      setTimeout(() => setFeedbackEnvio(''), 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setFeedbackEnvio('erro');
      alert(`Erro ao enviar: ${message}`);
      setTimeout(() => setFeedbackEnvio(''), 2500);
    } finally {
      setEnviando(false);
    }
  };

  const fecharConta = () => {
    sessionStorage.removeItem('techfood_cliente');
    sessionStorage.removeItem('techfood_total_mesa');
    sessionStorage.removeItem('techfood_historico');
    localStorage.removeItem('techfood_pedidos');
    window.location.href = '/';
  };

  return (
    <>
      <ModalBoasVindas onNomeConfirmado={carregarDados} />

      {modalFecharAberto && (
        <div id="modal-fechar-conta" style={{ display: 'flex' }}>
          <div className="modal-bv-conteudo">
            <h2>🧾 Fechar Conta da Mesa?</h2>
            <p>
              O pagamento deve ser feito no caixa.<br />
              Esta ação zera o total e libera a mesa<br />
              para o próximo cliente.
            </p>
            <div className="modal-btn-grupo">
              <button
                className="modal-btn-secundario"
                onClick={() => setModalFecharAberto(false)}
              >
                Cancelar
              </button>
              <button className="modal-btn-perigo" onClick={fecharConta}>
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />
      <main>
        <section id="secao-pedidos">
          <h2 className="titulo-secao">🛒 Meus Pedidos</h2>

          <div id="resumo-pedidos">
            <span id="contador-itens">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </span>
            <span id="valor-total-resumo">{formatarMoeda(totalCarrinho)}</span>
          </div>

          <ol id="lista-pedidos" aria-label="Lista de pedidos realizados">
            {pedidos.length === 0 ? (
              <li className="pedido-vazio">
                Nenhum item ainda. Acesse o{' '}
                <Link href="/">Cardápio</Link> para adicionar! 😊
              </li>
            ) : (
              pedidos.map((pedido, indice) => (
                <li key={`${pedido.produto_id}-${indice}`} className="item-pedido">
                  <span>
                    <strong>{pedido.nome}</strong>
                    {' — '}{pedido.quantidade}x{' '}
                    {formatarMoeda(pedido.preco)}{' '}
                    = <span className="subtotal-item">{formatarMoeda(pedido.subtotal)}</span>
                  </span>
                  <button
                    className="btn-remover-item"
                    onClick={() => removerItem(indice)}
                    aria-label="Remover item"
                  >
                    ✕
                  </button>
                </li>
              ))
            )}
          </ol>

          <div id="total-pedidos">
            <strong>
              Total Geral: <span id="valor-total">{formatarMoeda(totalGeral)}</span>
            </strong>
            <div className="btn-pedidos-grupo">
              <button className="btn-limpar-pedidos" onClick={limparPedidos}>
                🗑 Limpar Pedidos
              </button>
              <button
                className="btn-voltar-cardapio"
                onClick={() => setPainelContaAberto(!painelContaAberto)}
              >
                {painelContaAberto ? '▲ Recolher' : '📋 Ver Conta da Mesa'}
              </button>
              <button
                className="btn-enviar-cozinha"
                onClick={enviarCozinha}
                disabled={enviando || feedbackEnvio === 'enviado'}
                style={
                  feedbackEnvio === 'enviado'
                    ? { backgroundColor: '#27ae60' }
                    : feedbackEnvio === 'erro'
                    ? { backgroundColor: '#e74c3c' }
                    : {}
                }
              >
                {enviando
                  ? 'Enviando...'
                  : feedbackEnvio === 'enviado'
                  ? '✓ Pedido Enviado!'
                  : feedbackEnvio === 'erro'
                  ? 'Erro! Tente novamente'
                  : '🍳 Enviar para Cozinha'}
              </button>
            </div>
          </div>

          {painelContaAberto && (
            <div id="painel-conta">
              <h3 className="titulo-secao" style={{ marginTop: 32 }}>
                🧾 Conta da Mesa
              </h3>
              <ol id="lista-conta" aria-label="Itens enviados à cozinha">
                {historico.length === 0 ? (
                  <li className="pedido-vazio">
                    Nenhum pedido enviado à cozinha ainda.<br />
                    Adicione itens no Cardápio e clique em <strong>Enviar para Cozinha</strong>.
                  </li>
                ) : (
                  historico.map((item, i) => (
                    <li key={i} className="item-pedido">
                      <strong>{item.nome}</strong>
                      {' — '}{item.quantidade}x{' '}
                      {formatarMoeda(item.preco)}{' '}
                      = <span className="subtotal-item">{formatarMoeda(item.subtotal)}</span>
                    </li>
                  ))
                )}
              </ol>
              <div className="btn-pedidos-grupo" style={{ justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  className="btn-enviar-cozinha"
                  style={{ background: '#c0392b' }}
                  onClick={() => setModalFecharAberto(true)}
                >
                  ✓ Fechar Conta da Mesa
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
