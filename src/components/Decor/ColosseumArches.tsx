interface Props {
  className?: string;
  archCount?: number;
}

/**
 * Fila de arcos inspirada en la fachada del Coliseo romano (superposición de
 * arcadas). Se usa como textura de fondo sutil en banners y en el podio.
 * Usa currentColor, así que el color se controla desde el className del padre
 * (p.ej. "text-white/10").
 */
export function ColosseumArches({ className = '', archCount = 12 }: Props) {
  const arches = Array.from({ length: archCount });
  return (
    <svg
      className={className}
      viewBox={`0 0 ${archCount * 40} 60`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {arches.map((_, i) => (
        <path
          key={i}
          d={`M ${i * 40} 60 V 26 A 20 20 0 0 1 ${i * 40 + 40} 26 V 60`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      ))}
      <line x1="0" y1="8" x2={archCount * 40} y2="8" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
