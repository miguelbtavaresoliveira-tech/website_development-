import { getProducts } from '../../data';
import Link from 'next/link';



// SERVER COMPONENT - PODE TER ACESSO AO SERVIDOR POREM NÃO PODE TER INTERATIVIDADE (hooks)

//Client Components - podem ter interatividades(porem sem acesso a recurso do servidor)

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="home-page">
      <div className="home-shell">
        <section className="home-hero">
          <p className="home-tag">Catálogo</p>
          <h1 className="home-title">Descubra nossos produtos</h1>
          <p className="home-description">
            Uma seleção especial com sabores irresistíveis e preços que cabem no seu bolso.
          </p>
        </section>

        <section className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-meta">
                <span className="product-id">#{product.id}</span>
                <span className="product-price">R$ {product.price}</span>
              </div>
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <Link href={`/products/${product.id}`} className="product-button">Ver detalhes</Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
