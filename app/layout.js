import "./globals.css";
import Navbar from "../components/Navbar";


export const metadata = {
  title: "DropSpace — Discover What's Dropping Next",
  description: "The Instagram for product launches. Discover upcoming sneaker drops, tech launches, creator merch, and limited edition releases.",
  keywords: "drops, launches, sneakers, tech, streetwear, gaming, creator merch",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`antialiased`} style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main className="pt-16 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
