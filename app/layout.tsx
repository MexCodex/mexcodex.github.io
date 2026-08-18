import type { Metadata } from "next";
import { DM_Sans, Syne, Antic_Slab, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/app/i18n/LanguageProvider";
import esTranslations from "@/public/locales/es.json";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const anticSlab = Antic_Slab({
  variable: "--font-antic-slab",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: esTranslations["metadata.title"],
  description: esTranslations["metadata.description"],
  icons: {
    icon: "/icon1.png",
    shortcut: "/icon1.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${anticSlab.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mexcodex-theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark';document.documentElement.style.colorScheme='dark'}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
