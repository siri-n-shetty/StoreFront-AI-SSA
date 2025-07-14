# StoreFront AI: The Smart Shopping Assistant

A modern, AI-powered e-commerce platform built with Next.js 15 for ***Walmart Sparkathon 2025*** as a solution to the theme: *Reimagining Customer Experience*. This intelligent shopping assistant provides personalized recommendations, virtual try-on capabilities, and smart cart suggestions to enhance the online shopping experience.

## Features

### **AI-Powered Shopping Experience**

- **AI Shopping Assistant** - Intelligent chatbot that helps users find products, answers questions, and provides personalized recommendations
- **Smart Cart Suggestions** - AI-driven recommendations for complementary products based on cart contents
- **Personalized Recommendations** - Machine learning algorithms suggest products based on user preferences and browsing history
- **Virtual Try-On** - AR-powered virtual try-on for apparel items using advanced computer vision

### **E-Commerce Core Features**

- Product Catalog
- Category Filtering
- Product Details
- Shopping Cart
- Wishlist
- User Accounts

### **Technical Features**

- Next.js 15
- TypeScript
- *Firebase Integration* - Authentication, Firestore database, and cloud functions
- *Google AI Integration* - Powered by Google's Gemini AI for intelligent features
- *Real-time Updates* - Live data synchronization and real-time user interactions
- *Product Data Sources* - Initial product data sourced from [FakeStore API](https://fakestoreapi.com/) and [Platzi Fake Store API](https://fakeapi.platzi.com/en).

## Project Structure

```
src/
├── ai/                 # AI flows and configurations
│   ├── flows/         # AI-powered features (chat, recommendations, try-on)
│   ├── genkit.ts      # Google AI Genkit configuration
│   └── dev.ts         # Development AI setup
├── app/               # Next.js App Router pages
│   ├── products/      # Product catalog and details
│   ├── search/        # Search functionality
│   ├── cart/          # Shopping cart
│   ├── wishlist/      # User wishlist
│   ├── account/       # User account management
│   └── ...           # Other pages
├── components/        # Reusable React components
│   ├── ai/           # AI-related components
│   ├── products/     # Product display components
│   ├── layout/       # Layout components
│   ├── shared/       # Shared utilities
│   └── ui/           # UI component library
├── contexts/         # React context providers
├── hooks/           # Custom React hooks
└── lib/             # Utilities and configurations
    ├── data.ts      # Local product data (primary source)
    ├── firebase.ts  # Firebase configuration
    ├── types.ts     # TypeScript type definitions
    └── utils.ts     # Utility functions
```

## Contributors

- Siri N Shetty
- Surya P S
- Suprith S
- Sri Vidya M

We are grateful to Walmart for this opportunity to reimagine customer experience!