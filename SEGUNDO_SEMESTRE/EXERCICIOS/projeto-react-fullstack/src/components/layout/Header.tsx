export default function Header(){
  return (
    <header style={{ padding: '20px', background: '#111', color: '#fff' }}>
      <nav style={{ display: 'flex', gap: '20px' }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
        <a href="/pedidos" style={{ color: '#fff', textDecoration: 'none' }}>Pedidos</a>
      </nav>
    </header>
  )
}