import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary/60 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Your smart shopping companion.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=Apparel" className="text-muted-foreground hover:text-foreground">Apparel</Link></li>
              <li><Link href="/products?category=Electronics" className="text-muted-foreground hover:text-foreground">Electronics</Link></li>
              <li><Link href="/products?category=Home+Goods" className="text-muted-foreground hover:text-foreground">Home Goods</Link></li>
              <li><Link href="/products?category=Beauty" className="text-muted-foreground hover:text-foreground">Beauty</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StoreFront AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
