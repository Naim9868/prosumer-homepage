// components/product/sections/ProductReviews.tsx
import { RatingStars } from "@/components/product/ui/RatingStars";
import type { ProductReview } from "@/lib/queries/reviews";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20">
          <path
            d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z"
            fill={i < rating ? "var(--brass-500)" : "var(--titanium-700)"}
            fillOpacity={i < rating ? 1 : 0.4}
          />
        </svg>
      ))}
    </div>
  );
}

export function ProductReviews({
  reviews,
  ratingAverage,
  ratingCount,
}: {
  reviews: ProductReview[];
  ratingAverage?: number;
  ratingCount?: number;
}) {
  if (!reviews.length) return null;

  return (
    <section id="reviews" aria-labelledby="section-reviews" className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 id="section-reviews" className="text-xl font-medium text-[color:var(--titanium-100)]">
          Reviews
        </h2>
        <RatingStars average={ratingAverage} count={ratingCount} />
      </div>

      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="rounded-xl border border-[color:var(--titanium-800)] bg-[color:var(--surface-800)] p-4"
          >
            <div className="flex items-center gap-3">
              {review.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={review.image}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--titanium-700)] text-sm font-bold text-[color:var(--titanium-300)]">
                  {review.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-[color:var(--titanium-100)]">
                  {review.name}
                  {review.isVerifiedPurchase && (
                    <span className="ml-2 text-xs text-[color:var(--brass-500)]">Verified Purchase</span>
                  )}
                </span>
                <ReviewStars rating={review.rating} />
              </div>
            </div>
            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--titanium-300)]">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
