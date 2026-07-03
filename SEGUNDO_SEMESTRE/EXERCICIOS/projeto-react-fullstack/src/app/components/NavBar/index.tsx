import Link from "next/link";
import { renderToString } from "react-dom/server";
import NavItem, { NavItemInterface } from "../NavItem";



export default function NavBar() {

    const items: NavItemInterface[] = [
    {
        url: '/',
        label:'Inicio'
    }, 
    {
        url: '/about',
        label:'Sobre'
    },
    {
        url: '/prodects',
        label:'Produtos'
    },
    {
        url: '/services',
        label:'Serviços'
    },
    {
        url: '/contacts',
        label:'Contatos'
    }
]

    return (

        <header>
            <nav className="navbar">
                <Link href={`/`}>
                    <image href="logo.svg" width={20} height={20} />
                </Link>

                <ul className="nav-items">
                    {items.map((item, index) => (
                        <NavItem key={index} url={item.url} label={item.label}/>
                    ))}
                </ul>

                <button className="btn-default">Contatar</button>
            </nav>
        </header>
    )
}