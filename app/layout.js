import "./globals.css";
import ClientShell from "../components/ClientShell";

export const metadata = {
  title: "Dropamyn — Discover What's Dropping Next",
  description: "The ultimate destination for product launches. Discover upcoming sneaker drops, tech launches, creator merch, and limited edition releases.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <ClientShell
          fallback={
            <main style={{ minHeight: '100vh', paddingBottom: '60px' }} />
          }
        >
          {/* Main content — offset by sidebar on desktop, full-width on mobile */}
          <main style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {children}
          </main>
        </ClientShell>
      </body>
    </html>
  );
}
