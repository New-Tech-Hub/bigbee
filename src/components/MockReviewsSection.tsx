import { useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string;
}

interface MockReviewsSectionProps {
  productId: string;
}

const MockReviewsSection = ({ productId }: MockReviewsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ""
  });

  // Mock reviews data - in production this would come from the database
  const mockReviews: Review[] = [
    {
      id: "1",
      rating: 5,
      comment: "Excellent quality! The fabric is amazing and the fit is perfect. Will definitely order again.",
      created_at: "2024-01-15T10:00:00Z",
      user_name: "Sarah Johnson"
    },
    {
      id: "2", 
      rating: 4,
      comment: "Beautiful design and fast delivery. The colors are exactly as shown in the pictures.",
      created_at: "2024-01-10T14:30:00Z",
      user_name: "Michael Chen"
    },
    {
      id: "3",
      rating: 5,
      comment: "Outstanding customer service and product quality. Highly recommended!",
      created_at: "2024-01-05T09:15:00Z",
      user_name: "Emma Williams"
    }
  ];

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a review.",
        variant: "destructive"
      });
      return;
    }

    if (!newReview.comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment for your review.",
        variant: "destructive"
      });
      return;
    }

    // Mock submission - in production this would save to database
    toast({
      title: "Review submitted",
      description: "Thank you for your review! (This is a demo - reviews will be saved when database is connected)"
    });

    setNewReview({ rating: 5, comment: "" });
    setShowReviewForm(false);
  };

  const getAverageRating = () => {
    if (mockReviews.length === 0) return 0;
    const sum = mockReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / mockReviews.length;
  };

  const renderStars = (rating: number, interactive = false, size = "h-4 w-4") => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:fill-yellow-300" : ""}`}
            onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: star })) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(getAverageRating())}
              <span className="text-sm font-medium">
                {getAverageRating().toFixed(1)} ({mockReviews.length} review{mockReviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        </div>
        
        {user && (
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {showReviewForm && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Write Your Review</h4>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="mt-2">
                {renderStars(newReview.rating, true, "h-6 w-6")}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this product..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={submitReview}>
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-muted rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.user_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MockReviewsSection;