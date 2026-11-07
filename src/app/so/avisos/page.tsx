import { ZonaEnConstruccion } from "@/components/ZonaEnConstruccion";

export default function Avisos() {
  return (
    <ZonaEnConstruccion
      ruta="/so/avisos"
      proximo={[
        "Escribir el aviso una vez (fechas, cuotas, feriados)",
        "Elegir a quién: todas las familias, un grupo o un alumno",
        "Copiarlo listo para pegar en WhatsApp y marcarlo como enviado",
      ]}
    />
  );
}
