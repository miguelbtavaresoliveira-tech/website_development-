'use client'

import Link from "next/link";
import { renderToString } from "react-dom/server";
import NavItem, { NavItemInterface } from "../NavItem";
import './index.css'
import { usePathname } from "next/navigation";



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

const pathName = usePathname();

    return (

        <header>
            <nav className="navbar">
                <Link href={`/`}>
                    <image className="logo" href="logo.svg" width={20} height={20} />
                </Link>

                <ul className="nav-items">
                    {items.map((item, index) => (
                        <NavItem key={index} url={item.url} label={item.label} isActive={pathName === item.url}/>
                    ))}
                </ul>

                <button className="btn-default">Contatar</button>
            </nav>
        </header>
    )
}