import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/toaster";

// Vendored locally (not next/font/google) so the build never depends on
// reaching Google's servers — this app is meant to run on isolated LAN
// deployments that may have no internet access at all. Same Latin-subset
// variable-weight files next/font/google itself would have fetched; if the
// browser can't use the custom font for any reason, next/font's automatic
// metrics-matched system-font fallback (declared via `Inter`/`JetBrains
// Mono` below, generated into globals via the CSS variable) still applies.
const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  variable: "--font-inter-sans",
  weight: "100 900",
  fallback: ["ui-sans-serif", "system-ui", "Arial", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: "NetWatch Admin Dashboard",
  description:
    "Monitor and control Wi-Fi networks with real-time device, user, and access point insights plus customizable policies and detailed traffic reports.",
  icons: {
    icon: [
      { url: "/brand/icon-navy.png", media: "(prefers-color-scheme: light)" },
      { url: "/brand/icon-mint.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("netwatch-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
