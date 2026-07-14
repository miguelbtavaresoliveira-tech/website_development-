'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [dataHora, setDataHora] = useState('');

  useEffect(() => {
    const agora = new Date();
    setDataHora(
      agora.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <footer id="rodape">
      <div className="info-footer">
        <p><strong>TechFood 2026</strong></p>
        <p>Escola SENAI Ítalo Bologna - Itu/SP</p>
        <p>Av. das Nações, 1500</p>
      </div>
      <p id="data-hora-footer">{dataHora}</p>
    </footer>
  );
}
