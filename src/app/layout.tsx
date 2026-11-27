import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/toaster";

// Fonts are vendored locally, not fetched from Google, since this app can run on offline LAN deployments.
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
