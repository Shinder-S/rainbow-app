import type { MetadataRoute } from "next";

/** Sólo la landing se indexa. El SO y el ingreso quedan afuera (además llevan
 * noindex desde el proxy). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/so", "/ingresar"] },
  };
}
