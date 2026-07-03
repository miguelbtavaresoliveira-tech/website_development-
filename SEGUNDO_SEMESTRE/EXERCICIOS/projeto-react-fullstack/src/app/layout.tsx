import Header from "@/app/components/Header"
import { Children } from "react"
import Footer from "./components/Footer"
import NavBar from "./components/NavBar"


export default function ProtectedLayout ({
    children,
}: {
    children: React.ReactNode
}) {

    return(
        <html 
        lang="pt-br"
        >
            
            <body>
                <Header>
                </Header>
                {children}
                <Footer/>
            </body>
        </html>
    )
}