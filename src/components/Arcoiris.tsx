/** La marca en la app: un arco con los tres colores elegidos (naranja, verde
 * y un toque de violeta), en los tonos del Instagram. */
export function Arcoiris({ tamano = 40 }: { tamano?: number }) {
  const franjas = ["var(--c-naranja-marca)", "var(--c-verde-marca)", "var(--c-violeta)"];
  return (
    <svg width={tamano} height={tamano / 2} viewBox="0 0 100 50" aria-hidden="true">
      {franjas.map((color, i) => {
        const r = 44 - i * 12;
        return (
          <path
            key={color}
            d={`M ${50 - r} 50 A ${r} ${r} 0 0 1 ${50 + r} 50`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
