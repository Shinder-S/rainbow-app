import { ZonaEnConstruccion } from "@/components/ZonaEnConstruccion";

export default function Correcciones() {
  return (
    <ZonaEnConstruccion
      ruta="/so/correcciones"
      proximo={[
        "Cargar un writing: foto desde el celular o texto",
        "Borrador de devolución hecho por la IA para ese alumno",
        "Editar y guardar la devolución final en la ficha del alumno",
      ]}
    />
  );
}
