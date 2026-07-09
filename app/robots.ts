import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: "https://sellganise.com/sitemap.xml",
  };
}
