import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants";

/* Dev showcases stay out of search (T4 decision 8). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dev/", "/styleguide"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
