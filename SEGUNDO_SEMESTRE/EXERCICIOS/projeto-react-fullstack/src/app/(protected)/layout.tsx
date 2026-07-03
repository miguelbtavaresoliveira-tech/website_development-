import React from "react"
import Header from "../components/Header"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"



export default function ProtectedLayout({ children }: {
    children: React.ReactNode
}) {

    return (
        <html lang="pt-br">
            <Header />
            <NavBar />
            {children}
            <Footer/>
        </html>
    )
}