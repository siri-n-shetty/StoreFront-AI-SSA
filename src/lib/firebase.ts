
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import type { Product } from "./types";
import { products as localProducts } from './data';

// Check if all required Firebase environment variables are available
const isFirebaseConfigured = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase configuration is incomplete. Some features may not work.");
}

// Maps the local data from data.ts to our Product type
function getProductsFromLocalData(): Omit<Product, 'id'>[] {
    return localProducts.map((product) => ({
        ...product,
        // Remove the id field since we want Firestore to auto-generate it
        id: undefined
    })).map(({id, ...product}) => product);
}


// Seed the database with products from data.ts if it's empty
const seedProducts = async () => {
    if (!db || !isFirebaseConfigured) {
        console.log("Firebase not configured, skipping product seeding.");
        return;
    }

    try {
        const productsCollectionRef = collection(db, "products");
        const snapshot = await getDocs(productsCollectionRef);
        const existingProductNames = new Set(snapshot.docs.map(doc => doc.data().name));
        
        // Get products only from local data.ts
        const localProductData = getProductsFromLocalData();
        
        // Use a Map to ensure products are unique by name
        const uniqueProductsMap = new Map<string, Omit<Product, 'id'>>();
        localProductData.forEach(product => {
            uniqueProductsMap.set(product.name, product);
        });

        const productsToSeed = Array.from(uniqueProductsMap.values()).filter(
            product => !existingProductNames.has(product.name)
        );
        
        if (productsToSeed.length === 0) {
            console.log("Database is already up-to-date. No new products to add.");
            return;
        }

        const batch = writeBatch(db);
        productsToSeed.forEach((product) => {
            const docRef = doc(collection(db, "products")); // Auto-generate ID
            batch.set(docRef, product);
        });
        await batch.commit();
        console.log(`Database updated with ${productsToSeed.length} new products from data.ts!`);

    } catch (error) {
        console.error("Error seeding products:", error);
    }
};

// Call the seeding function only if Firebase is configured and we're on the server
if (typeof window === 'undefined' && isFirebaseConfigured && db) {
    seedProducts().catch(error => {
        console.warn("Failed to seed products during build:", error);
    });
}


export { app, auth, db };
