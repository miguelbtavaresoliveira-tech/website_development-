// =============================================================================
// COMPONENT — Button (UI Primitivo)
// Componente de botão reutilizável com variantes e estados
// =============================================================================

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Variante visual do botão */
  variant?: "primary" | "secondary" | "danger" | "ghost";
  /** Tamanho do botão */
  size?: "sm" | "md" | "lg";
  /** Exibe indicador de carregamento */
  isLoading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:   { background: "#e67e22", color: "#fff", border: "none" },
  secondary: { background: "transparent", color: "#e67e22", border: "2px solid #e67e22" },
  danger:    { background: "#e74c3c", color: "#fff", border: "none" },
  ghost:     { background: "transparent", color: "#555", border: "1px solid #ddd" },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: "14px" },
  md: { padding: "10px 20px", fontSize: "16px" },
  lg: { padding: "14px 28px", fontSize: "18px" },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: "6px",
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        fontWeight: "bold",
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: "opacity 0.2s, transform 0.1s",
        ...style,
      }}
      {...rest}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
