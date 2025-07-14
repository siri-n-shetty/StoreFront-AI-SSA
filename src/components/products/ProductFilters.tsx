
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const categories = [
  { key: "All", display: "All" },
  { key: "apparel", display: "Apparel" },
  { key: "electronics", display: "Electronics" },
  { key: "home-goods", display: "Home Goods" },
  { key: "beauty", display: "Beauty" },
  { key: "shoes", display: "Shoes" }
];

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <div className="flex flex-col space-y-1">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant="ghost"
                className={cn(
                  "justify-start",
                  currentCategory === category.key && "bg-secondary"
                )}
                onClick={() => handleCategoryChange(category.key)}
              >
                {category.display}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
