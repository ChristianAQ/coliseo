interface Props {
  className?: string;
}

/** Corona de laurel clásica, usada para coronar al campeón en el podio. */
export function LaurelWreath({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 200 90" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="currentColor">
        {Array.from({ length: 7 }).map((_, i) => {
          const t = i / 6;
          const x = 8 + t * 78;
          const y = 78 - Math.sin(t * Math.PI) * 55;
          const rotate = -70 + t * 60;
          const scale = 0.7 + t * 0.5;
          return (
            <ellipse
              key={`l-${i}`}
              cx={x}
              cy={y}
              rx={9 * scale}
              ry={4 * scale}
              transform={`rotate(${rotate} ${x} ${y})`}
              opacity={0.55 + t * 0.45}
            />
          );
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const t = i / 6;
          const x = 192 - t * 78;
          const y = 78 - Math.sin(t * Math.PI) * 55;
          const rotate = 70 - t * 60;
          const scale = 0.7 + t * 0.5;
          return (
            <ellipse
              key={`r-${i}`}
              cx={x}
              cy={y}
              rx={9 * scale}
              ry={4 * scale}
              transform={`rotate(${rotate} ${x} ${y})`}
              opacity={0.55 + t * 0.45}
            />
          );
        })}
      </g>
    </svg>
  );
}
