import "./globals.css";
import dynamic from "next/dynamic";
import ClientShell from "../components/ClientShell";

const Sidebar = dynamic(() => import("../components/Navbar"), { ssr: false });

export const metadata = {
  title: "Dropout — Discover What's Dropping Next",
  description: "The Instagram for product launches. Discover upcoming sneaker drops, tech launches, creator merch, and limited edition releases.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <ClientShell
          fallback={
            <main style={{ minHeight: '100vh', paddingBottom: '60px' }} />
          }
        >
          <Sidebar />
          {/* Main content — offset by sidebar on desktop, full-width on mobile */}
          <main style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {children}
          </main>
        </ClientShell>
      </body>
    </html>
  );
}
