import React from "react"

interface ButtonProps {
    children: React.ReactNode
    onClick: () => void //Função que irá rodar quando o botão for clicado
}



export default function Button({children, onClick}: ButtonProps){
    return(
        <button onClick={onClick}
        style={{padding: '10px 20px', 
        background: '#e67e22', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'}}
        > 
            {children}  
        </button>
    )
}