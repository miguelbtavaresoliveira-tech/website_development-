'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/cadastro';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estado do fluxo 2FA
  const [etapa, setEtapa] = useState<'login' | '2fa'>('login');
  const [tempToken, setTempToken] = useState('');
  const [codigo2FA, setCodigo2FA] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.mensagem || 'Falha no login');
      }

      if (dados.requer_2fa) {
        setTempToken(dados.temp_token);
        setEtapa('2fa');
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  const handle2FA = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempToken, codigo: codigo2FA.trim() }),
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.mensagem || 'Código inválido');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro na verificação');
      setCodigo2FA('');
    } finally {
      setCarregando(false);
    }
  };

  if (etapa === '2fa') {
    return (
      <main className="login-main">
        <div className="login-card">
          <header className="login-header">
            <div className="login-2fa-icon">🔐</div>
            <h1>Verificação em Duas Etapas</h1>
            <p>
              Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador
              (Google Authenticator, Authy, etc.)
            </p>
          </header>

          <form className="login-form" onSubmit={handle2FA}>
            {erro && (
              <div className="login-erro" role="alert">
                {erro}
              </div>
            )}

            <div className="login-campo">
              <label htmlFor="codigo-2fa">Código 2FA</label>
              <input
                id="codigo-2fa"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={codigo2FA}
                onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, ''))}
                required
                disabled={carregando}
                autoFocus
                className="login-input-2fa"
              />
            </div>

            <button type="submit" className="login-btn" disabled={carregando || codigo2FA.length !== 6}>
              {carregando ? 'Verificando...' : 'Verificar Código'}
            </button>

            <button
              type="button"
              className="login-btn-voltar"
              onClick={() => { setEtapa('login'); setErro(''); setCodigo2FA(''); }}
              disabled={carregando}
            >
              ← Voltar ao Login
            </button>
          </form>

          <p className="login-aviso">
            O código expira em 30 segundos. Abra o seu app autenticador para obter um novo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-main">
      <div className="login-card">
        <header className="login-header">
          <h1>🔐 Área Restrita</h1>
          <p>Acesso exclusivo para a equipe TechFood</p>
        </header>

        <form className="login-form" onSubmit={handleLogin}>
          {erro && (
            <div className="login-erro" role="alert">
              {erro}
            </div>
          )}

          <div className="login-campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <div className="login-campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={8}
              disabled={carregando}
            />
          </div>

          <button type="submit" className="login-btn" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login-aviso">
          O token de sessão é armazenado em cookie seguro (httpOnly) e expira em 8 horas.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<main className="login-main"><p className="loading-erro">Carregando...</p></main>}>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
