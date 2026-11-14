import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arcoiris } from "@/components/Arcoiris";
import "./landing.css";

/** Landing pública del instituto (zona Creación).
 *
 * Fotos: hay permiso de las familias para mostrar a los chicos (07/11/2026).
 * Igual van sin nombres (en los certificados están borroneados), y sin EXIF. El
 * video de las presentaciones arranca después de que las alumnas dicen sus
 * nombres. Los datos de contacto son los que el instituto ya publica en sus
 * piezas de Instagram. */

const WHATSAPP = "https://wa.me/5492494373251?text=" +
  encodeURIComponent("¡Hola! Quería consultar por las clases de inglés en Rainbow.");
const INSTAGRAM = "https://www.instagram.com/rainbowenglish_school/";

export const metadata: Metadata = {
  title: "Rainbow English School · Instituto de inglés en Tandil",
  description:
    "Clases de inglés en Tandil para niños, adolescentes y adultos. Grupos reducidos de hasta 8 alumnos, exámenes internacionales y apoyo para rendir en cualquier nivel escolar, de primaria y de secundaria. Presencial y online.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Rainbow English School",
    description: "Instituto de inglés en Tandil. Grupos reducidos, todas las edades, exámenes y apoyo escolar.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
};

const RAZONES = [
  { titulo: "Grupos de hasta 8", texto: "Cada alumno participa y tiene seguimiento. También hay clases individuales.", color: "naranja" },
  { titulo: "Todas las edades", texto: "Niños, adolescentes y adultos, cada uno en su nivel.", color: "verde" },
  { titulo: "Exámenes internacionales", texto: "Preparación para rendir y certificar tu nivel de inglés.", color: "violeta" },
  { titulo: "Presencial y online", texto: "En el instituto, en Tandil, o desde tu casa.", color: "naranja" },
] as const;

const ACTIVIDADES = [
  { src: "/fotos/03-cocina-manos-arriba.jpg", w: 1599, h: 899, texto: "Clase de cocina, en inglés" },
  { src: "/fotos/11-halloween.jpg", w: 1600, h: 1200, texto: "Halloween" },
  { src: "/fotos/07-manualidades.jpg", w: 1599, h: 899, texto: "Proyectos y manualidades" },
  { src: "/fotos/09-salida-al-parque.jpg", w: 768, h: 1024, texto: "Salidas en grupo" },
  { src: "/fotos/05-pizarron-sonrisas.jpg", w: 1600, h: 1200, texto: "Al pizarrón" },
  { src: "/fotos/13-grupo-reducido-mesa.jpg", w: 1600, h: 1200, texto: "Grupos reducidos" },
];

const CERTIFICADOS = [
  {
    src: "/fotos/18-entrega-de-certificados.jpg",
    w: 1040,
    h: 780,
    texto: "Entrega de certificados",
    alt: "Graciela con cinco alumnas que muestran sus certificados, frente a una pared con los colores del arcoíris",
  },
  {
    src: "/fotos/17-certificados-internacionales.jpg",
    w: 1600,
    h: 900,
    texto: "Certificados internacionales",
    alt: "Seis alumnos muestran su certificado internacional de inglés",
  },
  {
    src: "/fotos/19-cierre-de-ano.jpg",
    w: 1600,
    h: 900,
    texto: "Cierre de año",
    alt: "Graciela con todo el grupo de alumnos, varios con gorro de Papá Noel, en el cierre de año",
  },
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
            <h1>Aprendé inglés en grupos reducidos</h1>
            <p className="l-bajada">
              Clases para niños, adolescentes y adultos. Exámenes internacionales y apoyo para rendir en cualquier nivel
              escolar, de primaria y de secundaria.
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
          <h2>¿Cómo son las clases?</h2>
          <p className="l-intro">
            Se aprende hablando, jugando y practicando: cocinamos, realizamos presentaciones frente a la clase,
            festejamos y salimos en grupo. Todo en inglés.
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
        {/* Con sonido y controles: Graciela quiere que se escuche a las alumnas hablando (14/11).
            Los nombres que dicen las alumnas no se escuchan: un video arranca después y en el otro van en silencio. */}
        <section className="l-seccion">
          <h2>Hablar en inglés, de verdad</h2>
          <p className="l-intro">
            Los alumnos preparan presentaciones y las muestran frente a su grupo. Así ganan vocabulario, pierden la
            vergüenza y se animan a hablar.
          </p>
          <div className="l-videos">
            <figure className="l-video">
              <video
                src="/fotos/video-dialogo-en-ingles.mp4"
                poster="/fotos/video-dialogo-en-ingles.jpg"
                controls
                playsInline
                preload="metadata"
                aria-label="Dos nenas charlan en inglés con sus carpetas"
              />
              <figcaption>Las más chicas charlan en inglés</figcaption>
            </figure>
            <figure className="l-video">
              <video
                src="/fotos/video-presentacion-ingles.mp4"
                poster="/fotos/video-presentacion-ingles.jpg"
                controls
                playsInline
                preload="metadata"
                aria-label="Dos alumnas presentan en inglés un proyecto frente a la clase"
              />
              <figcaption>Las más grandes presentan su proyecto</figcaption>
            </figure>
          </div>
          <p className="l-nota">Dale play con sonido.</p>
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
            <h2>¿Quién enseña?</h2>
            <p>
              Soy Graciela y enseño inglés desde el año 1983. Rainbow comenzó allá por el 2009 en la localidad de
              Gardey. Desde hace 6 años, sólo en Tandil.
            </p>
            <p>Doy todas las clases yo, así que conozco a cada alumno, cómo aprende y en qué necesita una mano.</p>
          </div>
        </section>

        {/* ── Exámenes ──────────────────────────────────────────────── */}
        <section className="l-seccion l-examenes">
          <div className="l-dos">
            <div className="l-foto-vertical">
              <Image
                src="/fotos/10-examen-en-clase.jpg"
                alt="Un alumno resuelve un examen en el aula de Rainbow"
                width={899}
                height={1199}
                sizes="(min-width: 900px) 30vw, 80vw"
              />
            </div>
            <div>
              <h2>¿Tenés que rendir un examen?</h2>
              <p>Te ayudo en la preparación del examen que necesites rendir.</p>
              <p>Y también doy apoyo escolar en todos los niveles, tanto de primaria como de secundaria.</p>
              <div className="l-acciones">
                <a href={WHATSAPP} className="l-boton" target="_blank" rel="noopener noreferrer">
                  Consultá por tu examen
                </a>
              </div>
            </div>
          </div>
          <h3>Alumnos que ya rindieron</h3>
          <ul className="l-galeria l-galeria-certificados">
            {CERTIFICADOS.map((c) => (
              <li key={c.src}>
                <figure>
                  <Image src={c.src} alt={c.alt} width={c.w} height={c.h} sizes="(min-width: 640px) 33vw, 100vw" />
                  <figcaption>{c.texto}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
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
