interface Product {
    id: string,
    name: string,
    price: string,
    description: string,
}

export const products: Product[] = [
{ 
    id: '01',
    name: 'produto 1',
    price: '30',
    description: 'delicioso',
},
{ 
    id: '02',
    name: 'produto 2',
    price: '32',
    description: 'delicioso',
},
]

export const getProducts = async () =>{
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return products
}