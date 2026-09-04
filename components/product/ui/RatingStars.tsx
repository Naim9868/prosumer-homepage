// components/product/ui/RatingStars.tsx
export function RatingStars({
  average,
  count,
}: {
  average?: number;
  count?: number;
}) {
  if (!count || count <= 0) return null;

  const rounded = Math.round((average ?? 0) * 2) / 2;

  return (
    <div className="flex items-center gap-2" aria-label={`Rated ${average} out of 5, ${count} reviews`}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <svg key={i} width="15" height="15" viewBox="0 0 20 20" className="mr-0.5">
              <defs>
                <linearGradient id={`star-half-${i}`}>
                  <stop offset="50%" stopColor="var(--brass-500)" />
                  <stop offset="50%" stopColor="var(--titanium-700)" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z"
                fill={filled ? "var(--brass-500)" : half ? `url(#star-half-${i})` : "var(--titanium-700)"}
                fillOpacity={filled || half ? 1 : 0.4}
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-medium text-[color:var(--titanium-200)]">{average?.toFixed(1)}</span>
      <span className="text-sm text-[color:var(--titanium-500)]">({count.toLocaleString()})</span>
    </div>
  );
}
