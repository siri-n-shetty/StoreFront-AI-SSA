
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Camera, Heart, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Search,
    name: "Personalized Discovery",
    description: "Our AI learns your preferences to recommend products tailored just for you."
  },
  {
    icon: Bot,
    name: "AI Shopping Assistant",
    description: "Ask questions, get recommendations, and make purchases with our AI assistant."
  },
  {
    icon: Heart,
    name: "Smart Wishlists",
    description: "Track items of interest and get notified about price drops or restocks."
  },
  {
    icon: Camera,
    name: "Virtual Try-On",
    description: "Use your camera to see how products look on you or in your space."
  }
];

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            You're ready to explore. Dive into our full catalog or try our latest AI-powered features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">
                Browse All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
             <Button asChild size="lg" variant="outline">
              <Link href="/try-on">
                Try Virtual Try-On <Camera className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col">
      <section className="relative bg-secondary/60 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary-foreground/90">
            Shopping, Reimagined by AI
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-3xl mx-auto mb-8">
            Discover a smarter way to shop with personalized recommendations, instant assistance, and virtual try-ons.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
             <Button asChild size="lg" variant="secondary">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-headline text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="p-4 bg-primary/20 rounded-full">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-secondary/60 py-16 md:py-24">
        <div className="container mx-auto px-4">
           <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold font-headline mb-4">Can't Find It? Just Ask.</h2>
              <p className="text-muted-foreground mb-6">Our AI Shopping Assistant is here to help you find products, compare options, and get inspired. Try it out now by clicking the chat bubble!</p>
            </div>
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
               <Image 
                src="/features.png" 
                alt="AI Assistant Features"
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
