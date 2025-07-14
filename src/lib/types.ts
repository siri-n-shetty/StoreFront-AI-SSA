
export interface Product {
  id: string; // Firestore document ID is always a string
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  features: string[];
  rating: number;
  reviews: number;
  isTryOnAvailable: boolean;
  sellerId?: string; // Optional: Link product to a seller
}

export interface User {
  id: string; // Firebase UID
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'seller';
}
