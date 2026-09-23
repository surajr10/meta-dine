export type RatingSource = 'google' | 'yelp' | 'beli';

export type SourceRating =
  | { status: 'ok'; score: number; maxScore: number; reviewCount: number | null }
  | { status: 'not_found' };

export type Restaurant = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  ratings: Record<RatingSource, SourceRating>;
};
