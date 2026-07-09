import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

const APP_URL = "https://sellganise.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Sellganise — Stock Management for Resellers",
    template: "%s | Sellganise",
  },
  description: "The inventory tool built for UK resellers. Track stock across Vinted, eBay, Depop and Facebook. Know exactly what you own, where it is, and what you're making.",
  keywords: [
    "reseller stock management",
    "reseller inventory tracker",
    "vinted stock management",
    "depop inventory tracker",
    "ebay seller tools UK",
    "reselling software UK",
    "reseller profit tracker",
    "reseller CRM",
    "stock management for resellers",
    "secondhand seller tools",
  ],
  authors: [{ name: "Sellganise", url: APP_URL }],
  creator: "Sellganise",
  publisher: "Sellganise",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: APP_URL,
    siteName: "Sellganise",
    title: "Sellganise — Stock Management for Resellers",
    description: "Track your reselling stock across Vinted, eBay, Depop and Facebook. Know exactly what you own, where it is, and what you're making.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Sellganise — Stock Management for Resellers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sellganise — Stock Management for Resellers",
    description: "Track your reselling stock across Vinted, eBay, Depop and Facebook. Know exactly what you own, where it is, and what you're making.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Sellganise",
              url: "https://sellganise.com",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: "Stock management and profit tracking tool for UK resellers. Track inventory across Vinted, eBay, Depop and Facebook Marketplace.",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "GBP",
                  name: "Free plan — 50 items included",
                },
                {
                  "@type": "Offer",
                  price: "19.99",
                  priceCurrency: "GBP",
                  name: "Pro plan — unlimited items",
                  billingIncrement: "P1M",
                },
              ],
              publisher: {
                "@type": "Organization",
                name: "Sellganise",
                url: "https://sellganise.com",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
