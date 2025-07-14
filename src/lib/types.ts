
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

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string; // ISO date string
  deliveryDate?: string; // ISO date string
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
