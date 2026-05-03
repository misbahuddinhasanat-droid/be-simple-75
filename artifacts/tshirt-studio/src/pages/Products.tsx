import { useListProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Products() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: products, isLoading } = useListProducts(category ? { category } : undefined);

  return (
    <div className="container px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter">Collection</h1>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <Button 
            variant={!category ? "default" : "outline"} 
            onClick={() => setCategory(undefined)}
            className="rounded-full uppercase font-bold text-xs"
          >
            All
          </Button>
          {['T-Shirts', 'Hoodies', 'Accessories'].map(cat => (
            <Button 
              key={cat}
              variant={category === cat ? "default" : "outline"} 
              onClick={() => setCategory(cat)}
              className="rounded-full uppercase font-bold text-xs whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-muted animate-pulse rounded-md" />
              <div className="h-6 bg-muted animate-pulse w-3/4 rounded" />
              <div className="h-6 bg-muted animate-pulse w-1/4 rounded" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group block">
              <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted mb-4 relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                    Hot
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button className="w-11/12 font-bold uppercase tracking-wider shadow-lg">View Product</Button>
                </div>
              </div>
              <h3 className="font-bold uppercase tracking-wide truncate">{product.name}</h3>
              <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-muted rounded-lg">
          <h3 className="font-display text-2xl font-bold uppercase mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">Try selecting a different category.</p>
          <Button onClick={() => setCategory(undefined)}>Clear Filters</Button>
        </div>
      )}
    </div>
  );
}
