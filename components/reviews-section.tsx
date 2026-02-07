import type { Review } from "@/lib/models/models"

interface ReviewsSectionProps {
  reviews: Review[]
  rating: number
}

export function ReviewsSection({ reviews, rating }: ReviewsSectionProps) {
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    return { stars, count, percentage: reviews.length ? (count / reviews.length) * 100 : 0 }
  })

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-bold">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Be the first to review this product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{rating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(rating) ? "text-accent text-lg" : "text-muted text-lg"}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {ratingBreakdown.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-8">{stars}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="font-semibold text-sm">{review.userName[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "text-accent text-xs" : "text-muted text-xs"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
