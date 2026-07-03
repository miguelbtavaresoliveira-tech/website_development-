interface ProductPageProps {
    params: Promise<{ productId: string }>
}


export default async function ProductPage ( props: ProductPageProps) {

    const params = await props.params
    return (

        <div>ProdutosPage: {params.productId}</div>

    )
}