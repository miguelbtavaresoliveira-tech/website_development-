'use client';

import { useState, useEffect, useRef } from 'react';

interface ModalBoasVindasProps {
  onNomeConfirmado: (nome: string) => void;
}

export default function ModalBoasVindas({ onNomeConfirmado }: ModalBoasVindasProps) {
  const [visivel, setVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem('techfood_cliente')) {
      setVisivel(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const confirmar = () => {
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      inputRef.current?.focus();
      return;
    }
    sessionStorage.setItem('techfood_cliente', nomeTrimmed);
    setVisivel(false);
    onNomeConfirmado(nomeTrimmed);
  };

  if (!visivel) return null;

  return (
    <div id="modal-boas-vindas" style={{ display: 'flex' }}>
      <div className="modal-bv-conteudo">
        <h2>👋 Bem-vindo ao TechFood!</h2>
        <p>Como podemos te chamar?</p>
        <input
          ref={inputRef}
          type="text"
          placeholder="Digite seu nome..."
          maxLength={30}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && confirmar()}
        />
        <button onClick={confirmar}>Confirmar</button>
      </div>
    </div>
  );
}
