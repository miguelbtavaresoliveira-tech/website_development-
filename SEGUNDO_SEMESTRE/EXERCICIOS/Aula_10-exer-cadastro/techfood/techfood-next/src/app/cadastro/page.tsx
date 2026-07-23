'use client';

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModalBoasVindas from '@/components/ModalBoasVindas';

interface ProdutoCadastrado {
  id: number;
  nome: string;
  preco: number | string;
  categoria: string | null;
}

interface Setup2FA {
  secret: string;
  qr_code: string;
}

export default function CadastroPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState<ProdutoCadastrado | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Estado 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [setup2FA, setSetup2FA] = useState<Setup2FA | null>(null);
  const [codigo2FAAtivacao, setCodigo2FAAtivacao] = useState('');
  const [senha2FADesativacao, setSenha2FADesativacao] = useState('');
  const [codigo2FADesativacao, setCodigo2FADesativacao] = useState('');
  const [msg2FA, setMsg2FA] = useState('');
  const [erro2FA, setErro2FA] = useState('');
  const [carregando2FA, setCarregando2FA] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.sucesso) {
          // Busca detalhes do usuário com status 2FA
          fetch(`/api/auth/me/2fa-status`)
            .then(r => r.ok ? r.json() : null)
            .then(d2 => {
              if (d2) setTwoFactorEnabled(d2.two_factor_enabled ?? false);
            }).catch(() => setTwoFactorEnabled(false));
        }
      }).catch(() => {});
  }, []);

  const limparPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    limparPreview();
    if (arquivo) {
      setPreviewUrl(URL.createObjectURL(arquivo));
    }
  };

  const mostrarErro = (campo: string, mensagem: string) => {
    setErros((prev) => ({ ...prev, [campo]: mensagem }));
  };

  const limparErros = () => setErros({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    limparErros();

    const form = e.currentTarget;
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        formData.set(key, value.trim());
      }
    }

    let temErro = false;

    if (!formData.get('imagem')) {
      mostrarErro('imagem', 'Por favor, selecione uma foto.');
      temErro = true;
    }

    if (!formData.get('nome')) {
      mostrarErro('nome', 'O nome do produto é obrigatório.');
      temErro = true;
    }

    const precoBruto = formData.get('preco') as string;
    const precoNormalizado = precoBruto ? precoBruto.replace(',', '.') : '';
    formData.set('preco', precoNormalizado);

    const precoNumerico = Number(precoNormalizado);
    if (!precoNumerico || precoNumerico <= 0) {
      mostrarErro('preco', 'Digite um preço válido maior que zero.');
      temErro = true;
    }

    if (!formData.get('descricao')) {
      mostrarErro('descricao', 'A descrição é obrigatória.');
      temErro = true;
    }

    if (!formData.get('categoria')) {
      mostrarErro('categoria', 'Por favor, selecione uma categoria.');
      temErro = true;
    }

    if (temErro) return;

    setCarregando(true);

    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        body: formData,
      });

      const dados = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?redirect=/cadastro';
          return;
        }
        throw new Error(dados.mensagem || 'Erro ao cadastrar produto');
      }

      setMensagemSucesso(dados.mensagem || 'Produto salvo com sucesso!');
      setSucesso(dados.resultado);
      form.reset();
      limparPreview();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(`Falha no servidor: ${message}`);
    } finally {
      setCarregando(false);
    }
  };

  // ── Funções 2FA ──────────────────────────────────────────────────────────

  const iniciarSetup2FA = async () => {
    setErro2FA('');
    setMsg2FA('');
    setCarregando2FA(true);
    try {
      const res = await fetch('/api/auth/2fa/setup');
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem);
      setSetup2FA({ secret: dados.secret, qr_code: dados.qr_code });
    } catch (err: unknown) {
      setErro2FA(err instanceof Error ? err.message : 'Erro ao iniciar configuração');
    } finally {
      setCarregando2FA(false);
    }
  };

  const confirmarAtivacao2FA = async (e: FormEvent) => {
    e.preventDefault();
    if (!setup2FA) return;
    setErro2FA('');
    setMsg2FA('');
    setCarregando2FA(true);
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: setup2FA.secret, codigo: codigo2FAAtivacao.trim() }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem);
      setMsg2FA(dados.mensagem);
      setTwoFactorEnabled(true);
      setSetup2FA(null);
      setCodigo2FAAtivacao('');
    } catch (err: unknown) {
      setErro2FA(err instanceof Error ? err.message : 'Erro ao ativar 2FA');
    } finally {
      setCarregando2FA(false);
    }
  };

  const desativar2FA = async (e: FormEvent) => {
    e.preventDefault();
    setErro2FA('');
    setMsg2FA('');
    setCarregando2FA(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senha2FADesativacao, codigo: codigo2FADesativacao.trim() }),
      });
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem);
      setMsg2FA(dados.mensagem);
      setTwoFactorEnabled(false);
      setSenha2FADesativacao('');
      setCodigo2FADesativacao('');
    } catch (err: unknown) {
      setErro2FA(err instanceof Error ? err.message : 'Erro ao desativar 2FA');
    } finally {
      setCarregando2FA(false);
    }
  };

  return (
    <>
      <ModalBoasVindas onNomeConfirmado={() => {}} />
      <Header />
      <main className="cadastro-main">
        <header>
          <h1>Cadastrar Produto TechFood</h1>
          <p>Cadastre seus produtos agora!</p>
        </header>

        <form ref={formRef} className="form-produto" onSubmit={handleSubmit}>
          <div id="label-agrupar">
            <label htmlFor="produto-nome">Nome do Produto</label>
            <input
              type="text"
              id="produto-nome"
              name="nome"
              placeholder="Lasanha a Bolonhesa"
              className={erros.nome ? 'input-erro' : ''}
            />
            {erros.nome && <span className="mensagem-erro" style={{ display: 'block' }}>{erros.nome}</span>}
          </div>

          <div className="form-linha">
            <div id="label-agrupar">
              <label htmlFor="produto-preco">Preço (R$)</label>
              <input
                type="number"
                id="produto-preco"
                name="preco"
                placeholder="0,00"
                step="0.01"
                min="0.01"
                className={erros.preco ? 'input-erro' : ''}
              />
              {erros.preco && <span className="mensagem-erro" style={{ display: 'block' }}>{erros.preco}</span>}
            </div>
          </div>

          <div className="form-linha">
            <div id="label-agrupar">
              <label htmlFor="categoria">Categoria:</label>
              <select
                id="categoria"
                name="categoria"
                required
                className={erros.categoria ? 'input-erro' : ''}
                defaultValue=""
              >
                <option value="" disabled>Selecione uma categoria...</option>
                <option value="Massas">Massas</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Entradas">Entradas</option>
              </select>
              {erros.categoria && <span className="mensagem-erro" style={{ display: 'block' }}>{erros.categoria}</span>}
            </div>
          </div>

          <div id="label-agrupar">
            <label htmlFor="produto-descricao">Descrição</label>
            <input
              type="text"
              id="produto-descricao"
              name="descricao"
              placeholder="Uma lasanha deliciosa, feita com passata de tomate..."
              className={erros.descricao ? 'input-erro' : ''}
            />
            {erros.descricao && <span className="mensagem-erro" style={{ display: 'block' }}>{erros.descricao}</span>}
          </div>

          <div id="label-agrupar">
            <label htmlFor="produto-image">Inserir imagem</label>
            <input
              type="file"
              id="produto-image"
              name="imagem"
              accept="image/*"
              onChange={handleImagemChange}
              className={erros.imagem ? 'input-erro' : ''}
            />
            {erros.imagem && <span className="mensagem-erro" style={{ display: 'block' }}>{erros.imagem}</span>}

            <div id="imagemPreviewBox" className={previewUrl ? '' : 'oculta'}>
              {previewUrl && (
                <img id="imagePreview" src={previewUrl} alt="Prévia da imagem do produto" />
              )}
            </div>
          </div>

          <button type="submit" id="btn-submit" disabled={carregando}>
            {carregando ? 'Cadastrando... ⏳' : 'Cadastrar Produtos'}
          </button>
        </form>

        {sucesso && (
          <section id="feedbackSection">
            <h2>Produto Cadastrado</h2>
            <div className="card-sucesso">
              <p className="texto-sucesso"><strong>✔️ {mensagemSucesso}</strong></p>
              <p><strong>Item: </strong>{sucesso.nome}</p>
              <p><strong>Categoria: </strong>{sucesso.categoria}</p>
              <p>
                <strong>Valor cadastrado: </strong>
                R$ {Number(sucesso.preco).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </section>
        )}

        {/* ── Seção de Segurança — 2FA ──────────────────────────────────── */}
        <section className="secao-seguranca">
          <h2>🔒 Segurança da Conta</h2>
          <p className="seguranca-desc">
            A autenticação de dois fatores (2FA) adiciona uma camada extra de proteção.
            Ao fazer login, além da senha, você também precisará de um código gerado pelo app autenticador.
          </p>

          {msg2FA && <div className="seguranca-sucesso" role="status">{msg2FA}</div>}
          {erro2FA && <div className="seguranca-erro" role="alert">{erro2FA}</div>}

          {twoFactorEnabled === null && (
            <p className="seguranca-loading">Carregando status do 2FA...</p>
          )}

          {twoFactorEnabled === false && !setup2FA && (
            <div className="seguranca-status seguranca-status--inativo">
              <span>🔴 2FA desativado</span>
              <button
                className="btn-2fa-ativar"
                onClick={iniciarSetup2FA}
                disabled={carregando2FA}
              >
                {carregando2FA ? 'Gerando...' : '⚙️ Ativar 2FA'}
              </button>
            </div>
          )}

          {twoFactorEnabled === false && setup2FA && (
            <div className="setup-2fa">
              <h3>Configure seu Aplicativo Autenticador</h3>
              <p>Escaneie o QR Code abaixo com o Google Authenticator, Authy ou similar:</p>
              <div className="qr-wrapper">
                <img src={setup2FA.qr_code} alt="QR Code 2FA" width={200} height={200} />
              </div>
              <p className="setup-2fa-secret">
                Ou insira manualmente: <code>{setup2FA.secret}</code>
              </p>
              <form onSubmit={confirmarAtivacao2FA} className="form-2fa-codigo">
                <label htmlFor="codigo-ativacao">Digite o código gerado pelo app para confirmar:</label>
                <input
                  id="codigo-ativacao"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="000000"
                  value={codigo2FAAtivacao}
                  onChange={e => setCodigo2FAAtivacao(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={carregando2FA}
                />
                <div className="form-2fa-btns">
                  <button type="submit" className="btn-2fa-confirmar" disabled={carregando2FA || codigo2FAAtivacao.length !== 6}>
                    {carregando2FA ? 'Ativando...' : '✅ Confirmar e Ativar'}
                  </button>
                  <button type="button" className="btn-2fa-cancelar" onClick={() => { setSetup2FA(null); setCodigo2FAAtivacao(''); setErro2FA(''); }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {twoFactorEnabled === true && (
            <div>
              <div className="seguranca-status seguranca-status--ativo">
                <span>🟢 2FA ativado</span>
              </div>
              <details className="detalhes-desativar-2fa">
                <summary>Desativar 2FA</summary>
                <form onSubmit={desativar2FA} className="form-2fa-codigo">
                  <label htmlFor="senha-desativar">Senha atual:</label>
                  <input
                    id="senha-desativar"
                    type="password"
                    placeholder="••••••••"
                    value={senha2FADesativacao}
                    onChange={e => setSenha2FADesativacao(e.target.value)}
                    required
                    disabled={carregando2FA}
                  />
                  <label htmlFor="codigo-desativar">Código 2FA atual:</label>
                  <input
                    id="codigo-desativar"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="000000"
                    value={codigo2FADesativacao}
                    onChange={e => setCodigo2FADesativacao(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={carregando2FA}
                  />
                  <button
                    type="submit"
                    className="btn-2fa-desativar"
                    disabled={carregando2FA || codigo2FADesativacao.length !== 6}
                  >
                    {carregando2FA ? 'Desativando...' : '🔴 Desativar 2FA'}
                  </button>
                </form>
              </details>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
