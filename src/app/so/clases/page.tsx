import { ZonaEnConstruccion } from "@/components/ZonaEnConstruccion";

export default function Clases() {
  return (
    <ZonaEnConstruccion
      ruta="/so/clases"
      proximo={[
        "Elegir grupo o nivel, tema y lo que trae el libro",
        "Borrador de clase, actividades o fotocopia hecho por la IA",
        "Guardar la clase final para reusarla",
      ]}
    />
  );
}
