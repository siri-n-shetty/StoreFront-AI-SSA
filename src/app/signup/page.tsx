
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: UserRole.USER,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/account');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value as UserRole });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.role
      );
      toast({
        title: "Account Created!",
        description: "You have been successfully signed up. Please log in.",
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || user) {
      return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
       <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" placeholder="Max" required onChange={handleChange} disabled={isSubmitting}/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" placeholder="Robinson" required onChange={handleChange} disabled={isSubmitting}/>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required onChange={handleChange} disabled={isSubmitting}/>
            </div>
            <div className="grid gap-2">
              <Label>Account Type</Label>
               <RadioGroup defaultValue={UserRole.USER} onValueChange={handleRoleChange} className="flex gap-4" disabled={isSubmitting}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.USER} id="role-user" />
                  <Label htmlFor="role-user">User (Buyer)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.SELLER} id="role-seller" />
                  <Label htmlFor="role-seller">Seller</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
            </Button>
          </CardContent>
        </form>
         <div className="p-6 pt-0 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
