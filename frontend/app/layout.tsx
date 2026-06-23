import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/store/providers/ReduxProvider";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AlertProvider } from "@/components/providers/AlertProvider";
import Script from "next/script";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://amolifashion.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Amoli Fashion Jewellery | Premium Demi-Fine Jewellery Online – Jaipur, Rajasthan",
    template: "%s | Amoli Fashion Jewellery",
  },
  description:
    "Shop premium demi-fine fashion jewellery online at Amoli. Handcrafted brass & stainless steel jewellery — necklaces, earrings, bracelets, rings & bangles. Nickel-free, skin-friendly, anti-tarnish. Free shipping across India. Based in Jaipur, Rajasthan.",
  keywords: [
    // Brand
    "Amoli Fashion Jewellery", "Amoli jewellery", "Amoli jewellery online", "Amoli jewellery India",
    "Amoli jewellery Jaipur", "Amoli jewellery collection", "Amoli official website",
    // Core product types
    "fashion jewellery online India", "demi-fine jewellery India", "artificial jewellery online",
    "imitation jewellery online", "brass jewellery online", "stainless steel jewellery online",
    "copper jewellery online", "plated jewellery online India", "costume jewellery India",
    "designer jewellery online India", "handmade jewellery online",
    // Quality & Material
    "nickel-free jewellery", "skin-friendly jewellery", "anti-tarnish jewellery",
    "hypoallergenic jewellery India", "tarnish-free jewellery", "waterproof jewellery India",
    "lead-free jewellery", "premium plating jewellery", "18k gold plated jewellery",
    "rose gold plated jewellery", "silver plated jewellery", "rhodium plated jewellery",
    // Categories — Necklaces
    "necklace set online", "necklace for women", "choker necklace online",
    "layered necklace India", "statement necklace", "chain necklace women",
    "pendant necklace online", "mangalsutra online", "long necklace set",
    // Categories — Earrings
    "earrings online India", "jhumka earrings online", "stud earrings women",
    "hoop earrings online", "drop earrings India", "chandbali earrings",
    "ear cuff online", "huggie earrings India", "oxidised earrings",
    // Categories — Bracelets & Bangles
    "bracelets for women", "charm bracelet online", "cuff bracelet women",
    "bangles online shopping", "kada bangle online", "tennis bracelet India",
    "bangle set online", "adjustable bracelet women",
    // Categories — Rings
    "rings online India", "finger ring women", "adjustable ring online",
    "statement ring India", "stackable rings women", "cocktail ring online",
    // Categories — Other
    "pendant set online", "anklet online India", "payal online shopping",
    "nose pin online", "maang tikka online", "hair accessories jewellery",
    "waist chain online", "toe ring online India", "brooch online India",
    // Occasion
    "wedding jewellery online", "bridal jewellery set", "party wear jewellery",
    "daily wear jewellery", "office wear jewellery", "ethnic jewellery online",
    "western jewellery online", "festival jewellery", "casual jewellery women",
    "sangeet jewellery", "mehendi jewellery", "haldi jewellery",
    "engagement jewellery", "anniversary jewellery gift", "college wear jewellery",
    // Gifting
    "jewellery gift for wife", "jewellery gift for girlfriend", "jewellery gift for mother",
    "birthday gift jewellery", "valentines day jewellery gift", "rakhi gift jewellery",
    "karwa chauth jewellery", "diwali jewellery gift",
    // Location — Rajasthan (correct spelling)
    "buy jewellery online Jaipur", "jewellery online Jaipur", "fashion jewellery online Jaipur Rajasthan",
    "jewellery delivery Ajmer", "jewellery online Beawar", "jewellery delivery Rajasthan",
    "Rajasthani jewellery online delivery", "handcrafted jewellery online Jaipur", "online jewellery shopping Ajmer",
    "jewellery delivery Beawar Rajasthan", "artificial jewellery online Jaipur",
    "jewellery delivery Jodhpur", "jewellery online Udaipur", "jewellery delivery Kota Rajasthan",
    "buy jewellery online Bikaner", "jewellery delivery Alwar Rajasthan",
    // Location — Major Indian cities
    "jewellery online Delhi", "fashion jewellery online Mumbai", "jewellery online Bangalore",
    "jewellery online Hyderabad", "jewellery online Pune", "jewellery online Ahmedabad",
    "jewellery online Chennai", "jewellery online Kolkata", "jewellery online Lucknow",
    "jewellery online Chandigarh", "jewellery online Surat", "jewellery online Indore",
    "jewellery delivery all over India", "fast jewellery delivery India",
    // Price & value
    "buy jewellery online India", "best fashion jewellery India", "affordable jewellery online",
    "jewellery under 500", "jewellery under 1000", "jewellery under 2000",
    "cheap jewellery online India", "budget jewellery India", "value for money jewellery",
    // Search intent & trending
    "women jewellery online shopping", "latest jewellery designs 2025",
    "trendy jewellery online", "new arrival jewellery", "bestseller jewellery India",
    "top rated jewellery online", "most popular jewellery India",
    "Korean jewellery India", "minimalist jewellery online", "boho jewellery India",
    "traditional jewellery online", "Kundan jewellery online", "Meenakari jewellery online",
    "Polki jewellery online", "temple jewellery online India",
    "free shipping jewellery India", "COD jewellery India", "cash on delivery jewellery",
  ],
  authors: [{ name: "Amoli Fashion Jewellery", url: baseUrl }],
  creator: "Amoli Fashion Jewellery",
  publisher: "Amoli Fashion Jewellery",
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: "Amoli Fashion Jewellery",
    title: "Amoli Fashion Jewellery | Premium Handcrafted Demi-Fine Jewellery",
    description:
      "Discover handcrafted, skin-friendly fashion jewellery at Amoli. Necklaces, earrings, bracelets & more. Anti-tarnish, nickel-free. Free shipping all over India.",
    images: [
      {
        url: `${baseUrl}/image/Amoli_1.png`,
        width: 1200,
        height: 630,
        alt: "Amoli Fashion Jewellery – Premium Demi-Fine Jewellery Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amoli Fashion Jewellery | Premium Demi-Fine Jewellery",
    description:
      "Handcrafted, skin-friendly fashion jewellery. Necklaces, earrings, bracelets & more. Based in Jaipur, Rajasthan.",
    images: [`${baseUrl}/image/Amoli_1.png`],
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "Fashion Jewellery",
  other: {
    "geo.region": "IN-RJ",
    "geo.placename": "Jaipur, Rajasthan",
    "geo.position": "26.9124;75.7873",
    "ICBM": "26.9124, 75.7873",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Organization + Local Business structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Amoli Fashion Jewellery",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/image/Amoli_1.png`,
      },
      description:
        "Premium demi-fine fashion jewellery brand from Jaipur, Rajasthan. Handcrafted brass & stainless steel jewellery — nickel-free, skin-friendly, anti-tarnish.",
      foundingLocation: {
        "@type": "Place",
        name: "Jaipur, Rajasthan, India",
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "Amoli Fashion Jewellery",
      publisher: { "@id": `${baseUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      name: "Amoli Fashion Jewellery",
      url: baseUrl,
      image: `${baseUrl}/image/Amoli_1.png`,
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 26.9124,
        longitude: 75.7873,
      },
      openingHours: "Mo-Sa 09:00-18:00",
      areaServed: [
        { "@type": "City", name: "Jaipur" },
        { "@type": "City", name: "Ajmer" },
        { "@type": "City", name: "Beawar" },
        { "@type": "State", name: "Rajasthan" },
        { "@type": "Country", name: "India" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics — replace G-XXXXXXXXXX with your real ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${lato.variable} font-sans overflow-x-hidden`} suppressHydrationWarning>
        <ReduxProvider>
          <AlertProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AlertProvider>
        </ReduxProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}