'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [saudacao, setSaudacao] = useState('Carregando...');
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [badge, setBadge] = useState(0);

  useEffect(() => {
    const nome = sessionStorage.getItem('techfood_cliente');
    const agora = new Date();
    const hora = agora.getHours() + agora.getMinutes() / 60;
    const textoSaudacao = hora < 12 ? '☀️ Bom dia' : hora < 18 ? '🌤️ Boa tarde' : '🌙 Boa noite';

    if (nome) {
      setSaudacao(`${textoSaudacao}, ${nome}! O que vai pedir hoje?`);
    } else {
      setSaudacao(`${textoSaudacao}! Qual o seu pedido?`);
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((dados) => {
        if (dados?.sucesso) setUsuario(dados.usuario);
      })
      .catch(() => {});
  }, [pathname]);

  const badgeCount = () => {
    if (typeof window === 'undefined') return 0;
    const lista = JSON.parse(localStorage.getItem('techfood_pedidos') || '[]');
    return lista.reduce((acc: number, p: { quantidade: number }) => acc + p.quantidade, 0);
  };

  useEffect(() => {
    setBadge(badgeCount());

    const handleStorage = () => setBadge(badgeCount());
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(() => setBadge(badgeCount()), 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUsuario(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header id="topo-loja">
      <h1 id="titulo-site">TechFood - Sabor &amp; Saber</h1>
      <p id="boas-vindas">{saudacao}</p>

      <input
        type="checkbox"
        id="bt_menu"
        checked={menuAberto}
        onChange={(e) => setMenuAberto(e.target.checked)}
      />
      <label htmlFor="bt_menu" id="label-menu" aria-label="Abrir menu">
        &#9776;
      </label>

      <nav id="menu">
        <ul>
          <li>
            <Link href="/" className={pathname === '/' ? 'ativo' : ''} onClick={() => setMenuAberto(false)}>
              Cardápio
            </Link>
          </li>
          <li>
            <Link href="/pedidos" className={pathname === '/pedidos' ? 'ativo' : ''} onClick={() => setMenuAberto(false)}>
              Meus Pedidos
              {badge > 0 && <span className="badge-menu">{badge}</span>}
            </Link>
          </li>
          <li>
            <Link href="/cadastro" className={pathname === '/cadastro' ? 'ativo' : ''} onClick={() => setMenuAberto(false)}>
              Cadastrar Prato
            </Link>
          </li>
          <li>
            {usuario ? (
              <button
                type="button"
                className="btn-header-auth"
                onClick={() => { setMenuAberto(false); handleLogout(); }}
                title={`Logado como ${usuario.nome}`}
              >
                Sair ({usuario.nome.split(' ')[0]})
              </button>
            ) : (
              <Link
                href="/login"
                className={pathname === '/login' ? 'ativo' : ''}
                onClick={() => setMenuAberto(false)}
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
