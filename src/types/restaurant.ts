export type RatingSource = 'google' | 'yelp' | 'beli';

export type SourceRating =
  | {
      status: 'ok';
      score: number;
      maxScore: number;
      reviewCount: number | null;
      recScore?: number;
    }
  | { status: 'not_found' };

export type RestaurantSummary = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type Restaurant = RestaurantSummary & {
  ratings: Record<RatingSource, SourceRating>;
};
