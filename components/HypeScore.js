'use client';

export default function HypeScore({ score }) {
  const getFlames = (s) => {
    if (s >= 95) return 5;
    if (s >= 85) return 4;
    if (s >= 70) return 3;
    if (s >= 50) return 2;
    return 1;
  };

  const flames = getFlames(score);
  const isHot = score >= 85;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm transition-all duration-300 ${
              i < flames ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
            }`}
            style={{
              filter: i < flames && isHot ? 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))' : 'none',
            }}
          >
            🔥
          </span>
        ))}
      </div>
      <span
        className={`text-sm font-bold ${
          isHot ? 'gradient-text-hype' : 'text-[#9ca3af]'
        }`}
      >
        {score}
      </span>
    </div>
  );
}
