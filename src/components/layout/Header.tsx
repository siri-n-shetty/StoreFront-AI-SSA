
"use client";

import Link from 'next/link';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LogIn,
  Camera,
  ShoppingBag,
  PlusCircle
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  const { cartItems, wishlistItems } = useAppContext();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loggedInUserLinks = [
    { href: '/products', label: 'All Products', icon: ShoppingBag },
    { href: '/try-on', label: 'Virtual Try-On', icon: Camera },
  ];

  const sellerLinks = [
    { href: '/sell/add-product', label: 'Add Product', icon: PlusCircle },
  ];

  const allLinks = user ? (user.role === UserRole.SELLER ? [...loggedInUserLinks, ...sellerLinks] : loggedInUserLinks) : [];


  const renderUserActions = () => {
    if (user) {
      return (
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
               <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hi, {user.firstName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="mr-2 h-4 w-4" /> My Account
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button asChild>
        <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
        </Link>
      </Button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 p-4">
                  <Logo />
                  <nav className="flex flex-col gap-2">
                    {allLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                         <Button variant="ghost" asChild className="justify-start">
                           <Link href={link.href}>
                             <link.icon className="mr-2 h-4 w-4" />
                             {link.label}
                           </Link>
                         </Button>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {allLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1.5"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[200px] md:w-[300px]"
              />
            </form>
          </div>
           { user && <>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist" aria-label={`Wishlist (${wishlistItems.length} items)`}>
                  <div className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {wishlistItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart" aria-label={`Cart (${cartItems.length} items)`}>
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                     {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
            </>}
          <div className="flex items-center gap-2">
            {renderUserActions()}
          </div>
        </div>
      </div>
    </header>
  );
}
