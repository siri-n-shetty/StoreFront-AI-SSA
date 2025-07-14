
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShoppingBag, Heart, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const menuItems = [
    { icon: User, title: "Profile", description: "Manage your personal information.", href: "#" },
    { icon: ShoppingBag, title: "Orders", description: "View your order history.", href: "#" },
    { icon: Heart, title: "Wishlist", description: "See your saved items.", href: "/wishlist" },
  ];

  if (loading) {
    return <div className="container mx-auto px-4 py-12 max-w-4xl">Loading...</div>;
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold font-headline mb-2">My Account</h1>
      <p className="text-muted-foreground mb-8">Welcome back, {user.firstName}!</p>
      <div className="grid gap-6">
        {user.role === UserRole.SELLER && (
            <Link href="/sell/add-product">
                <Card className="hover:bg-secondary/80 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                    <PlusCircle className="h-8 w-8 text-primary" />
                    <div>
                    <CardTitle>Add Product</CardTitle>
                    <CardDescription>Add a new product to the store.</CardDescription>
                    </div>
                </CardHeader>
                </Card>
            </Link>
        )}
        {menuItems.map((item) => (
          <Link href={item.href} key={item.title}>
            <Card className="hover:bg-secondary/80 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <item.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <Card className="hover:bg-secondary/80 transition-colors cursor-pointer" onClick={logout}>
            <CardHeader className="flex flex-row items-center gap-4">
                <LogOut className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle>Logout</CardTitle>
                  <CardDescription>Sign out of your account.</CardDescription>
                </div>
              </CardHeader>
        </Card>
      </div>
    </div>
  );
}
