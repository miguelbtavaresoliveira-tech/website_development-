import Link from "next/link";

export default function Header(){
  return (
    <header style={{ padding: '20px', background: '#111', color: '#fff' }}>
      <nav style={{ display: 'flex', gap: '20px' }}>
        <Link href="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
        <Link href="/pedidos" style={{ color: '#fff', textDecoration: 'none' }}>Pedidos</Link>
      </nav>
    </header>
  )
}