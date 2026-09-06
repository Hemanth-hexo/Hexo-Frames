import photosData from "./photos.json";

export interface PhotoItem {
  id: string;
  src: string;
  title: string;
  location: string;
  camera: string;
  settings: string;
  description: string;
}

export interface WorldCategory {
  id: string;
  name: string;
  positionX: number;
  iconType: 'about' | 'nature' | 'cars' | 'wildlife' | 'concert' | 'street' | 'contact';
  title: string;
  subtitle: string;
  photos: PhotoItem[];
}

// All actual content lives in photos.json, not here — that's what makes it
// safe for the admin upload feature to read and rewrite programmatically
// (a hand-formatted .ts file with comments is fragile to edit by code; a
// plain JSON file isn't). This file just supplies the TypeScript shape.
export const worldCategories: WorldCategory[] = photosData as WorldCategory[];
