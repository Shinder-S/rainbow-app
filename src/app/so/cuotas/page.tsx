import { ZonaEnConstruccion } from "@/components/ZonaEnConstruccion";

export default function Cuotas() {
  return (
    <ZonaEnConstruccion
      ruta="/so/cuotas"
      proximo={[
        "Las cuotas del mes, alumno por alumno",
        "Marcar pagada con un toque (efectivo o transferencia)",
        "Ver de un vistazo quién debe",
      ]}
    />
  );
}
