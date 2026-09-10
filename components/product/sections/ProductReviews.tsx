"use client";

// components/product/sections/ProductReviews.tsx

import { useState, useRef } from "react";
import { RatingStars } from "@/components/product/ui/RatingStars";
import type { ProductReview } from "@/types/review";

/* ------------------------------------------------------------------ */
/* Star display helpers                                                */
/* ------------------------------------------------------------------ */

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

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const starVal = i + 1;
        const active = starVal <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={starVal === value}
            aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
            onMouseEnter={() => setHover(starVal)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(starVal)}
          >
            <svg width="22" height="22" viewBox="0 0 20 20">
              <path
                d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z"
                fill={active ? "var(--brass-500)" : "var(--titanium-700)"}
                fillOpacity={active ? 1 : 0.4}
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Step = "list" | "verify" | "form";

interface VerificationResult {
  orderId: string;
  customerName: string;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function ProductReviews({
  reviews,
  ratingAverage,
  ratingCount,
  productId,
  productName,
}: {
  reviews: ProductReview[];
  ratingAverage?: number;
  ratingCount?: number;
  productId: string;
  productName: string;
}) {
  const [step, setStep] = useState<Step>("list");
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(reviews);
  const [verified, setVerified] = useState<VerificationResult | null>(null);

  const allReviews = localReviews;

  return (
    <section id="reviews" aria-labelledby="section-reviews" className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h2 id="section-reviews" className="text-xl font-medium text-[color:var(--titanium-100)]">
          Reviews
        </h2>
        <RatingStars average={ratingAverage} count={ratingCount} />
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-4">
        {allReviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {/* Write review flow */}
      {step === "list" && (
        <button
          type="button"
          onClick={() => setStep("verify")}
          className="self-start rounded-xl border border-[color:var(--brass-500)] bg-[color:var(--brass-500)]/10 px-5 py-2.5 text-sm font-medium text-[color:var(--brass-500)] transition hover:bg-[color:var(--brass-500)]/20"
        >
          Write a Review
        </button>
      )}

      {step === "verify" && (
        <VerificationForm
          productId={productId}
          onVerified={(result) => {
            setVerified(result);
            setStep("form");
          }}
          onBack={() => setStep("list")}
        />
      )}

      {step === "form" && (
        <ReviewForm
          productId={productId}
          productName={productName}
          verified={verified}
          onSubmit={(review) => {
            setLocalReviews((prev) => [review, ...prev]);
            setStep("list");
            setVerified(null);
          }}
          onBack={() => {
            setStep("list");
            setVerified(null);
          }}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Review card                                                         */
/* ------------------------------------------------------------------ */

function ReviewCard({ review }: { review: ProductReview }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-xl border border-[color:var(--titanium-800)] bg-[color:var(--surface-800)] p-4">
        <div className="flex items-center gap-3">
          {review.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.avatar}
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

        {review.title && (
          <p className="mt-2 text-sm font-medium text-[color:var(--titanium-200)]">{review.title}</p>
        )}

        {review.comment && (
          <p className="mt-1 text-sm leading-relaxed text-[color:var(--titanium-300)]">
            {review.comment}
          </p>
        )}

        {review.images && review.images.length > 0 && (
          <div className="mt-3 flex gap-2">
            {review.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setExpandedImage(img)}
                className="overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Review image ${i + 1}`}
                  className="h-16 w-16 object-cover transition-transform hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-[color:var(--titanium-500)]">
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Image lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            type="button"
            onClick={() => setExpandedImage(null)}
            className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expandedImage}
            alt="Review image"
            className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Verification form                                                   */
/* ------------------------------------------------------------------ */

function VerificationForm({
  productId,
  onVerified,
  onBack,
}: {
  productId: string;
  onVerified: (result: VerificationResult) => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState<"orderId" | "phone">("orderId");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!value.trim()) {
      setError(method === "orderId" ? "Enter your order ID" : "Enter your phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = { productId };
      if (method === "orderId") body.orderId = value.trim();
      else body.phone = value.trim();

      const res = await fetch("/api/reviews/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Verification failed");
        return;
      }

      onVerified({ orderId: data.order.orderId, customerName: data.order.customerName });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--titanium-800)] bg-[color:var(--surface-800)] p-5">
      <h3 className="mb-1 text-base font-medium text-[color:var(--titanium-100)]">
        Verify Your Order
      </h3>
      <p className="mb-4 text-sm text-[color:var(--titanium-400)]">
        Enter your order ID or phone number to verify your purchase.
      </p>

      {/* Method toggle */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => { setMethod("orderId"); setValue(""); setError(""); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            method === "orderId"
              ? "bg-[color:var(--brass-500)]/15 text-[color:var(--brass-500)]"
              : "bg-[color:var(--surface-700)] text-[color:var(--titanium-300)] hover:bg-[color:var(--surface-600)]"
          }`}
        >
          Order ID
        </button>
        <button
          type="button"
          onClick={() => { setMethod("phone"); setValue(""); setError(""); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            method === "phone"
              ? "bg-[color:var(--brass-500)]/15 text-[color:var(--brass-500)]"
              : "bg-[color:var(--surface-700)] text-[color:var(--titanium-300)] hover:bg-[color:var(--surface-600)]"
          }`}
        >
          Phone Number
        </button>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(""); }}
        placeholder={method === "orderId" ? "e.g. ORD-20260910-XXXX" : "e.g. 01XXXXXXXXX"}
        className="mb-3 w-full rounded-lg border border-[color:var(--titanium-700)] bg-[color:var(--surface-900)] px-4 py-2.5 text-sm text-[color:var(--titanium-100)] placeholder:text-[color:var(--titanium-500)] focus:border-[color:var(--brass-500)] focus:outline-none"
      />

      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-[color:var(--titanium-400)] transition hover:text-[color:var(--titanium-200)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className="rounded-lg bg-[color:var(--brass-500)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[color:var(--brass-600)] disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Order"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review form                                                         */
/* ------------------------------------------------------------------ */

function ReviewForm({
  productId,
  productName,
  verified,
  onSubmit,
  onBack,
}: {
  productId: string;
  productName: string;
  verified: VerificationResult | null;
  onSubmit: (review: ProductReview) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(verified?.customerName || "");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - images.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "reviews");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) uploaded.push(data.url);
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 3));
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write your review"); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId: verified?.orderId,
          name: name.trim(),
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          images,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to submit review");
        return;
      }

      onSubmit(data.review);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--titanium-800)] bg-[color:var(--surface-800)] p-5">
      <h3 className="mb-1 text-base font-medium text-[color:var(--titanium-100)]">
        Write a Review
      </h3>
      <p className="mb-4 text-sm text-[color:var(--titanium-400)]">
        for {productName}
        {verified && (
          <span className="ml-2 text-[color:var(--brass-500)]">(Verified Purchase)</span>
        )}
      </p>

      {/* Rating */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-[color:var(--titanium-300)]">Your Rating *</label>
        <InteractiveStars value={rating} onChange={setRating} />
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="mb-1 block text-sm text-[color:var(--titanium-300)]">Your Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-[color:var(--titanium-700)] bg-[color:var(--surface-900)] px-4 py-2.5 text-sm text-[color:var(--titanium-100)] placeholder:text-[color:var(--titanium-500)] focus:border-[color:var(--brass-500)] focus:outline-none"
        />
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="mb-1 block text-sm text-[color:var(--titanium-300)]">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full rounded-lg border border-[color:var(--titanium-700)] bg-[color:var(--surface-900)] px-4 py-2.5 text-sm text-[color:var(--titanium-100)] placeholder:text-[color:var(--titanium-500)] focus:border-[color:var(--brass-500)] focus:outline-none"
        />
      </div>

      {/* Comment */}
      <div className="mb-3">
        <label className="mb-1 block text-sm text-[color:var(--titanium-300)]">Your Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          className="w-full rounded-lg border border-[color:var(--titanium-700)] bg-[color:var(--surface-900)] px-4 py-2.5 text-sm text-[color:var(--titanium-100)] placeholder:text-[color:var(--titanium-500)] focus:border-[color:var(--brass-500)] focus:outline-none resize-none"
        />
      </div>

      {/* Images */}
      <div className="mb-4">
        <label className="mb-1 block text-sm text-[color:var(--titanium-300)]">
          Photos (max 3)
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[color:var(--titanium-700)] text-[color:var(--titanium-500)] transition hover:border-[color:var(--brass-500)] hover:text-[color:var(--brass-500)]">
              <span className="text-2xl">+</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        {uploading && (
          <p className="mt-1 text-xs text-[color:var(--titanium-400)]">Uploading image...</p>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm text-[color:var(--titanium-400)] transition hover:text-[color:var(--titanium-200)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="rounded-lg bg-[color:var(--brass-500)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[color:var(--brass-600)] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
