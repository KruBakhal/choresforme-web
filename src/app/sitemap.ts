import type { MetadataRoute } from "next";

import {
  CATEGORY_IDS,
  FAQ_HREF,
  HOW_IT_WORKS_HREF,
  SITE_URL,
  WORKERS_HREF,
  serviceHref,
} from "@/lib/constants";

/* Public, indexable marketing routes only. /privacy and /terms are noindex placeholders. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...CATEGORY_IDS.map(serviceHref), HOW_IT_WORKS_HREF, WORKERS_HREF, FAQ_HREF];
  return paths.map((path) => ({ url: path === "/" ? SITE_URL : `${SITE_URL}${path}` }));
}
