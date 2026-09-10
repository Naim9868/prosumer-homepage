export interface ProductReview {
  _id: string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  avatar?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}
