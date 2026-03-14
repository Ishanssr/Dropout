// Mock data for DropSpace MVP
export const categories = [
  { id: 'all', name: 'All Drops', icon: '🔥', color: '#f97316' },
  { id: 'sneakers', name: 'Sneakers', icon: '👟', color: '#3b82f6' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#8b5cf6' },
  { id: 'streetwear', name: 'Streetwear', icon: '👕', color: '#06b6d4' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#10b981' },
  { id: 'ai-tools', name: 'AI Tools', icon: '🤖', color: '#6366f1' },
  { id: 'creator-merch', name: 'Creator Merch', icon: '🎨', color: '#ec4899' },
  { id: 'limited', name: 'Limited Edition', icon: '💎', color: '#f59e0b' },
];

// Helper to create drop dates relative to now
const now = new Date();
const hours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const days = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

export const drops = [
  {
    id: '1',
    title: 'Air Max 2030 "Midnight Blue"',
    brand: { name: 'Nike', logo: '🟢' },
    category: 'sneakers',
    description: 'The future of Air Max is here. Featuring revolutionary ReactX foam and a holographic Swoosh, the Air Max 2030 pushes boundaries in comfort and style.',
    imageUrl: '/drops/nike-airmax.jpg',
    dropTime: hours(48),
    price: '$220',
    hypeScore: 94,
    engagement: { likes: 12400, comments: 3200, saves: 8900, views: 145000 },
    featured: true,
    website: 'https://nike.com',
  },
  {
    id: '2',
    title: 'Vision Pro 2',
    brand: { name: 'Apple', logo: '🍎' },
    category: 'tech',
    description: 'The next generation of spatial computing. Lighter, faster, and with an all-new M4 chip. Experience the future of work and entertainment.',
    imageUrl: '/drops/apple-vision.jpg',
    dropTime: hours(6),
    price: '$2,999',
    hypeScore: 97,
    engagement: { likes: 34000, comments: 12000, saves: 28000, views: 520000 },
    featured: true,
    website: 'https://apple.com',
  },
  {
    id: '3',
    title: 'Limited Edition Hoodie',
    brand: { name: 'MrBeast', logo: '🟡' },
    category: 'creator-merch',
    description: 'Only 5,000 ever made. Each hoodie comes with a unique code that could unlock a $10,000 prize. Premium heavyweight cotton, embroidered logo.',
    imageUrl: '/drops/mrbeast-hoodie.jpg',
    dropTime: days(1),
    price: '$85',
    hypeScore: 89,
    engagement: { likes: 8700, comments: 4100, saves: 6200, views: 98000 },
    featured: false,
    website: 'https://shopmrbeast.com',
  },
  {
    id: '4',
    title: 'WH-2000XM6 Headphones',
    brand: { name: 'Sony', logo: '🔵' },
    category: 'tech',
    description: 'Industry-leading noise cancellation meets spatial audio. 40-hour battery, USB-C fast charging, and new AI-powered adaptive sound control.',
    imageUrl: '/drops/sony-headphones.jpg',
    dropTime: hours(3),
    price: '$349',
    hypeScore: 86,
    engagement: { likes: 6800, comments: 1900, saves: 4500, views: 78000 },
    featured: false,
    website: 'https://sony.com',
  },
  {
    id: '5',
    title: 'Retro Jordan x Travis Scott',
    brand: { name: 'Jordan', logo: '🏀' },
    category: 'sneakers',
    description: 'The most anticipated collab of the year. Reverse mocha colorway with cactus jack branding. Ultra-limited release via SNKRS.',
    imageUrl: '/drops/travis-jordan.jpg',
    dropTime: days(3),
    price: '$185',
    hypeScore: 98,
    engagement: { likes: 45000, comments: 18000, saves: 38000, views: 680000 },
    featured: true,
    website: 'https://nike.com/jordan',
  },
  {
    id: '6',
    title: 'Summer 2026 Collection',
    brand: { name: 'Supreme', logo: '🔴' },
    category: 'streetwear',
    description: 'Supreme drops its Summer 2026 collection featuring bold graphics, collaborative pieces, and the iconic box logo tees in new colorways.',
    imageUrl: '/drops/supreme-summer.jpg',
    dropTime: days(5),
    price: '$48 - $298',
    hypeScore: 91,
    engagement: { likes: 15000, comments: 6700, saves: 12000, views: 210000 },
    featured: false,
    website: 'https://supremenewyork.com',
  },
  {
    id: '7',
    title: 'RTX 6090 GPU',
    brand: { name: 'NVIDIA', logo: '🟢' },
    category: 'tech',
    description: 'The most powerful consumer GPU ever built. 48GB GDDR7, Blackwell architecture, native 8K gaming, and AI-powered DLSS 5.0.',
    imageUrl: '/drops/nvidia-rtx.jpg',
    dropTime: days(7),
    price: '$1,999',
    hypeScore: 96,
    engagement: { likes: 28000, comments: 9500, saves: 22000, views: 430000 },
    featured: true,
    website: 'https://nvidia.com',
  },
  {
    id: '8',
    title: 'Fortnite x Dragon Ball Z Skins',
    brand: { name: 'Epic Games', logo: '🎮' },
    category: 'gaming',
    description: 'Goku, Vegeta, and more arrive in Fortnite with custom emotes, pickaxes, and a limited-time Kamehameha mythic item.',
    imageUrl: '/drops/fortnite-dbz.jpg',
    dropTime: hours(12),
    price: '$19.99',
    hypeScore: 82,
    engagement: { likes: 9200, comments: 3800, saves: 5600, views: 120000 },
    featured: false,
    website: 'https://fortnite.com',
  },
  {
    id: '9',
    title: 'GPT-5 Pro',
    brand: { name: 'OpenAI', logo: '🤖' },
    category: 'ai-tools',
    description: 'The most advanced AI model yet. Native multimodal reasoning, real-time video understanding, and code generation that writes production-ready apps.',
    imageUrl: '/drops/openai-gpt5.jpg',
    dropTime: days(2),
    price: '$200/mo',
    hypeScore: 93,
    engagement: { likes: 18000, comments: 7200, saves: 14000, views: 310000 },
    featured: true,
    website: 'https://openai.com',
  },
  {
    id: '10',
    title: 'Model S Plaid+',
    brand: { name: 'Tesla', logo: '🚗' },
    category: 'tech',
    description: 'The fastest production car ever. 0-60 in 1.9 seconds, 520 mile range, and a new yoke-free steering with haptic feedback.',
    imageUrl: '/drops/tesla-plaid.jpg',
    dropTime: days(14),
    price: '$129,990',
    hypeScore: 88,
    engagement: { likes: 11000, comments: 4300, saves: 7800, views: 165000 },
    featured: false,
    website: 'https://tesla.com',
  },
  {
    id: '11',
    title: 'Yeezy Foam RNNR "Ocean"',
    brand: { name: 'Yeezy', logo: '🌊' },
    category: 'sneakers',
    description: 'A new colorway of the iconic Foam Runner. Deep ocean blue with glow-in-the-dark sole. Made from algae-based EVA foam.',
    imageUrl: '/drops/yeezy-foam.jpg',
    dropTime: hours(18),
    price: '$90',
    hypeScore: 79,
    engagement: { likes: 5400, comments: 2100, saves: 3900, views: 67000 },
    featured: false,
    website: 'https://yeezy.com',
  },
  {
    id: '12',
    title: 'Figma AI Design Suite',
    brand: { name: 'Figma', logo: '🎨' },
    category: 'ai-tools',
    description: 'Design with AI. Auto-layout, smart color suggestions, and one-click prototyping powered by a fine-tuned design model.',
    imageUrl: '/drops/figma-ai.jpg',
    dropTime: days(4),
    price: '$22/mo',
    hypeScore: 76,
    engagement: { likes: 4200, comments: 1600, saves: 3100, views: 52000 },
    featured: false,
    website: 'https://figma.com',
  },
  {
    id: '13',
    title: 'Xbox Series X Pro',
    brand: { name: 'Xbox', logo: '🟩' },
    category: 'gaming',
    description: 'Native 8K gaming at 120fps. 2TB SSD, ray tracing 2.0, and backward compatibility with every Xbox game ever made.',
    imageUrl: '/drops/xbox-pro.jpg',
    dropTime: days(10),
    price: '$599',
    hypeScore: 85,
    engagement: { likes: 7600, comments: 2800, saves: 5200, views: 95000 },
    featured: false,
    website: 'https://xbox.com',
  },
  {
    id: '14',
    title: 'Palace x Gucci Collab',
    brand: { name: 'Palace', logo: '🔺' },
    category: 'limited',
    description: 'When London streetwear meets Italian luxury. Limited-edition skatedecks, leather jackets, and monogrammed beanies.',
    imageUrl: '/drops/palace-gucci.jpg',
    dropTime: days(6),
    price: '$120 - $3,500',
    hypeScore: 90,
    engagement: { likes: 13000, comments: 5400, saves: 10000, views: 188000 },
    featured: true,
    website: 'https://palaceskateboards.com',
  },
  {
    id: '15',
    title: 'Pixel 11 Ultra',
    brand: { name: 'Google', logo: '🔷' },
    category: 'tech',
    description: 'AI-first smartphone. Gemini built-in, 200MP camera with Night Sight 3.0, and 7 years of OS updates.',
    imageUrl: '/drops/google-pixel.jpg',
    dropTime: days(8),
    price: '$1,099',
    hypeScore: 83,
    engagement: { likes: 6100, comments: 2300, saves: 4000, views: 72000 },
    featured: false,
    website: 'https://store.google.com',
  },
  {
    id: '16',
    title: 'KSI x Prime Energy Drink',
    brand: { name: 'PRIME', logo: '🥤' },
    category: 'creator-merch',
    description: 'New flavor reveal! Limited edition KSI signature flavor with a golden can. Each case includes a chance to win meet-and-greet tickets.',
    imageUrl: '/drops/prime-ksi.jpg',
    dropTime: hours(36),
    price: '$29.99',
    hypeScore: 77,
    engagement: { likes: 4800, comments: 1800, saves: 3500, views: 58000 },
    featured: false,
    website: 'https://drinkprime.com',
  },
];

// Utility functions
export function getDropsByCategory(category) {
  if (category === 'all') return drops;
  return drops.filter(d => d.category === category);
}

export function getTrendingDrops() {
  return [...drops].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 10);
}

export function getDropById(id) {
  return drops.find(d => d.id === id);
}

export function getFeaturedDrops() {
  return drops.filter(d => d.featured);
}

export function getDropsByDate(targetDate) {
  return drops.filter(d => {
    const dropDate = new Date(d.dropTime);
    return dropDate.toDateString() === targetDate.toDateString();
  });
}

export function getUpcomingDates() {
  const dates = {};
  drops.forEach(d => {
    const date = new Date(d.dropTime).toDateString();
    if (!dates[date]) dates[date] = [];
    dates[date].push(d);
  });
  return Object.entries(dates)
    .map(([date, items]) => ({ date: new Date(date), drops: items }))
    .sort((a, b) => a.date - b.date);
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function getTimeLeft(dropTime) {
  const diff = new Date(dropTime) - new Date();
  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { expired: false, days, hours, minutes, seconds };
}
