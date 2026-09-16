"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { FeaturedReview } from "@/lib/types";
import { TestimonialCardSkeleton } from "@/components/skeleton";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { SectionHeading } from "@/components/ui/section-heading";

const TRUST_BADGES = ["Fast Delivery", "Hygienically Prepared", "Fresh Ingredients"];

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<FeaturedReview[] | null>(null);

  useEffect(() => {
    apiFetch<{ reviews: FeaturedReview[] }>("/api/reviews/featured").then((d) => setReviews(d.reviews));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="What Our Customers Say" align="center" />

      {reviews === null ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <TestimonialCardSkeleton key={i} />)}
        </div>
      ) : reviews.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <Card key={review.id} className="flex flex-col">
              <StarRating rating={review.rating} readOnly size="sm" />
              <p className="mt-2 flex-1 text-sm text-ink/70">&ldquo;{review.comment}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold text-ink/50">{review.customerName.split(" ")[0]} · {timeAgo(review.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {TRUST_BADGES.map((badge) => (
          <span key={badge} className="rounded-full border border-yellow-300 bg-yellow-50 px-4 py-1.5 text-xs font-bold text-ink/80">
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
