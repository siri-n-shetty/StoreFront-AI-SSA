// Utility function to create sample orders for testing
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Order } from './types';

export const createSampleOrders = async (userId: string) => {
  const sampleOrders: Omit<Order, 'id'>[] = [
    {
      userId,
      items: [
        {
          id: '1',
          productId: 'sample-1',
          productName: 'Classic Grey Hooded Sweatshirt',
          productImage: 'https://i.imgur.com/R2PN9Wq.jpeg',
          price: 90,
          quantity: 1,
          total: 90
        },
        {
          id: '2',
          productId: 'sample-2',
          productName: 'Classic Black T-Shirt',
          productImage: 'https://i.imgur.com/9DqEOV5.jpeg',
          price: 35,
          quantity: 2,
          total: 70
        }
      ],
      totalAmount: 160,
      status: 'delivered',
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      deliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      shippingAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      }
    },
    {
      userId,
      items: [
        {
          id: '3',
          productId: 'sample-3',
          productName: 'Sleek Wireless Headphone & Inked Earbud Set',
          productImage: 'https://i.imgur.com/yVeIeDa.jpeg',
          price: 44,
          quantity: 1,
          total: 44
        }
      ],
      totalAmount: 44,
      status: 'shipped',
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      shippingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      }
    },
    {
      userId,
      items: [
        {
          id: '4',
          productId: 'sample-4',
          productName: 'Vibrant Pink Classic Sneakers',
          productImage: 'https://i.imgur.com/mcW42Gi.jpeg',
          price: 84,
          quantity: 1,
          total: 84
        }
      ],
      totalAmount: 84,
      status: 'pending',
      orderDate: new Date().toISOString(), // today
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      shippingAddress: {
        street: '789 Pine St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      }
    }
  ];

  try {
    for (const order of sampleOrders) {
      await addDoc(collection(db, 'orders'), order);
    }
    console.log('Sample orders created successfully!');
  } catch (error) {
    console.error('Error creating sample orders:', error);
  }
};
