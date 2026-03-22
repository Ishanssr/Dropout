import DropDetailClient from './DropDetailClient';
import DropDetailFallbackClient from './DropDetailFallbackClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dropout-htf0.onrender.com';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  try {
    const res = await fetch(`${API_URL}/api/drops/${resolvedParams.id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { title: 'Drop Not Found — Dropamyn' };
    const drop = await res.json();

    return {
      title: `${drop.title} by ${drop.brand?.name} — Dropamyn`,
      description: drop.description?.slice(0, 160) || `Discover ${drop.title} on Dropamyn`,
      openGraph: {
        title: `${drop.title} — Dropamyn`,
        description: drop.description?.slice(0, 160),
        images: drop.imageUrl ? [{ url: drop.imageUrl, width: 1080, height: 1080 }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${drop.title} — Dropamyn`,
        description: drop.description?.slice(0, 160),
        images: drop.imageUrl ? [drop.imageUrl] : [],
      },
    };
  } catch {
    return { title: 'Dropamyn — Discover What\'s Dropping Next' };
  }
}

export default async function DropDetailPage({ params }) {
  const resolvedParams = await params;
  let drop = null;

  try {
    const res = await fetch(`${API_URL}/api/drops/${resolvedParams.id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      drop = await res.json();
    }
  } catch {
    drop = null;
  }

  if (!drop) {
    return <DropDetailFallbackClient id={resolvedParams.id} />;
  }

  return <DropDetailClient drop={drop} />;
}
