import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arcoiris } from "@/components/Arcoiris";
import "./landing.css";

/** Landing pública del instituto (zona Creación).
 *
 * Fotos: hay permiso de las familias para mostrar a los chicos (07/11/2026).
 * Igual van sin nombres, y sin EXIF porque WhatsApp los borra. Los datos de
 * contacto son los que el instituto ya publica en sus piezas de Instagram. */

const WHATSAPP = "https://wa.me/5492494373251?text=" +
  encodeURIComponent("¡Hola! Quería consultar por las clases de inglés en Rainbow.");
const INSTAGRAM = "https://www.instagram.com/rainbowenglish_school/";

export const metadata: Metadata = {
  title: "Rainbow English School · Instituto de inglés en Tandil",
  description:
    "Clases de inglés en Tandil para chicos, adolescentes y adultos. Grupos de hasta 8 alumnos, preparación para exámenes internacionales y apoyo escolar. Presencial y online.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Rainbow English School",
    description: "Instituto de inglés en Tandil. Grupos chicos, todas las edades y exámenes internacionales.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
};

const RAZONES = [
  { titulo: "Grupos de hasta 8", texto: "Cada alumno participa y tiene seguimiento. También hay clases individuales.", color: "naranja" },
  { titulo: "Todas las edades", texto: "Chicos, adolescentes y adultos, cada uno en su nivel.", color: "verde" },
  { titulo: "Exámenes internacionales", texto: "Preparación para rendir y certificar tu nivel de inglés.", color: "violeta" },
  { titulo: "Presencial y online", texto: "En el instituto, en Tandil, o desde tu casa.", color: "naranja" },
] as const;

const ACTIVIDADES = [
  { src: "/fotos/03-cocina-manos-arriba.jpg", w: 1599, h: 899, texto: "Clase de cocina, en inglés" },
  { src: "/fotos/11-halloween.jpg", w: 1600, h: 1200, texto: "Halloween" },
  { src: "/fotos/07-manualidades.jpg", w: 1599, h: 899, texto: "Proyectos y manualidades" },
  { src: "/fotos/09-salida-al-parque.jpg", w: 768, h: 1024, texto: "Salidas en grupo" },
  { src: "/fotos/05-pizarron-sonrisas.jpg", w: 1600, h: 1200, texto: "Al pizarrón" },
  { src: "/fotos/13-grupo-reducido-mesa.jpg", w: 1600, h: 1200, texto: "Grupos chicos" },
];

export default function Landing() {
  return (
    <div className="l">
      <header className="l-barra">
        <a href="#inicio" className="l-marca">
          <Arcoiris tamano={40} />
          <span>Rainbow</span>
        </a>
        <a href={WHATSAPP} className="l-boton l-boton-chico" target="_blank" rel="noopener noreferrer">
          Consultar
        </a>
      </header>

      <main>
        {/* ── Portada ───────────────────────────────────────────────── */}
        <section id="inicio" className="l-portada">
          <div className="l-portada-texto">
            <p className="l-sobretitulo">Rainbow English School · Tandil</p>
            <h1>Aprendé inglés en grupos chicos, con una profe que te conoce</h1>
            <p className="l-bajada">
              Clases para chicos, adolescentes y adultos. Exámenes internacionales y apoyo para rendir en la escuela.
            </p>
            <div className="l-acciones">
              <a href={WHATSAPP} className="l-boton" target="_blank" rel="noopener noreferrer">
                Escribinos por WhatsApp
              </a>
              <a href="#clases" className="l-boton l-boton-claro">
                Cómo son las clases
              </a>
            </div>
            <p className="l-aviso-inscripcion">Ya podés reservar tu lugar para 2027.</p>
          </div>
          <div className="l-portada-foto">
            <Image
              src="/fotos/01-grupo-con-graciela.jpg"
              alt="Un grupo de alumnos de Rainbow con Graciela, festejando en el aula"
              width={1024}
              height={768}
              priority
              sizes="(min-width: 900px) 50vw, 100vw"
            />
          </div>
        </section>

        {/* ── Por qué Rainbow ───────────────────────────────────────── */}
        <section className="l-seccion">
          <h2>Por qué Rainbow</h2>
          <ul className="l-razones">
            {RAZONES.map((r) => (
              <li key={r.titulo} className={`l-razon l-${r.color}`}>
                <h3>{r.titulo}</h3>
                <p>{r.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Las clases ────────────────────────────────────────────── */}
        <section id="clases" className="l-seccion">
          <h2>Cómo son las clases</h2>
          <p className="l-intro">
            Se aprende hablando, jugando y haciendo: cocinamos, presentamos frente a la clase, festejamos y salimos en
            grupo. Todo en inglés.
          </p>
          <ul className="l-galeria">
            {ACTIVIDADES.map((a) => (
              <li key={a.src}>
                <figure>
                  <Image src={a.src} alt={a.texto} width={a.w} height={a.h} sizes="(min-width: 900px) 33vw, 50vw" />
                  <figcaption>{a.texto}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Presentaciones ────────────────────────────────────────── */}
        <section className="l-seccion l-dos">
          <div className="l-video">
            <video
              src="/fotos/video-presentacion-pizarron.mp4"
              poster="/fotos/video-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Una alumna presenta en inglés frente al pizarrón"
            />
          </div>
          <div>
            <h2>Hablar en inglés, de verdad</h2>
            <p>
              Los alumnos preparan presentaciones y las cuentan frente al grupo. Así ganan vocabulario, pierden la
              vergüenza y se animan a hablar.
            </p>
          </div>
        </section>

        {/* ── Quién enseña ──────────────────────────────────────────── */}
        <section className="l-seccion l-dos l-dos-invertido">
          <div className="l-foto-redonda">
            <Image
              src="/fotos/02-cocina-selfie-graciela.jpg"
              alt="Graciela con sus alumnos durante una clase de cocina"
              width={1599}
              height={1200}
              sizes="(min-width: 900px) 40vw, 100vw"
            />
          </div>
          <div>
            <h2>Quién enseña</h2>
            <p>
              Soy Graciela y enseño inglés desde 2009: primero en Gardey y hoy en Tandil. Doy todas las clases yo, así
              que conozco a cada alumno, cómo aprende y en qué necesita una mano.
            </p>
          </div>
        </section>

        {/* ── Exámenes ──────────────────────────────────────────────── */}
        <section className="l-seccion l-dos">
          <div className="l-foto-vertical">
            <Image
              src="/fotos/10-certificado.jpg"
              alt="Una alumna muestra su certificado frente al logo de Rainbow"
              width={1200}
              height={1600}
              sizes="(min-width: 900px) 30vw, 70vw"
            />
          </div>
          <div>
            <h2>¿Tenés que rendir inglés?</h2>
            <p>
              Preparamos exámenes internacionales para certificar el nivel, y también damos apoyo a quien tiene que
              rendir inglés en la escuela.
            </p>
            <a href={WHATSAPP} className="l-boton" target="_blank" rel="noopener noreferrer">
              Consultá por tu examen
            </a>
          </div>
        </section>

        {/* ── Contacto ──────────────────────────────────────────────── */}
        <section id="contacto" className="l-contacto">
          <h2>Reservá tu lugar</h2>
          <p>Escribinos y te contamos horarios, niveles y cuotas.</p>
          <div className="l-acciones l-acciones-centro">
            <a href={WHATSAPP} className="l-boton" target="_blank" rel="noopener noreferrer">
              WhatsApp (249) 437-3251
            </a>
            <a href={INSTAGRAM} className="l-boton l-boton-claro" target="_blank" rel="noopener noreferrer">
              @rainbowenglish_school
            </a>
          </div>
          <address>Costa Rica 550, depto. 6 · Tandil, Buenos Aires</address>
        </section>
      </main>

      <footer className="l-pie">
        <span>Rainbow English School · Tandil</span>
        <Link href="/ingresar">Acceso</Link>
      </footer>
    </div>
  );
}
