import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/client"] }],
    sitemap: "https://vivabloomdecor.com.au/sitemap.xml",
  };
}
