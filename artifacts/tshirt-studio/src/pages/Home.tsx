import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { ArrowRight, Paintbrush, Zap, Layers } from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        <div className="container relative z-10 px-4 md:px-8 flex flex-col items-center text-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter max-w-4xl mb-6 leading-[0.9]">
            Wear Your <span className="text-primary">Loudest</span> Thoughts
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10">
            Self-expression meets streetwear. Don't settle for off-the-rack when you can create a masterpiece. Welcome to the studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/customize" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto font-bold uppercase tracking-wider text-md h-14 px-8">
                Enter The Studio
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold uppercase tracking-wider text-md h-14 px-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
                Shop Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4 md:px-8">
        <div className="flex justify-between items-end mb-10 border-b-2 border-primary pb-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tighter">Latest Drops</h2>
          <Link href="/products" className="group flex items-center gap-2 font-bold uppercase text-sm hover:text-primary transition-colors">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-muted animate-pulse rounded-md" />
                <div className="h-6 bg-muted animate-pulse w-3/4 rounded" />
                <div className="h-6 bg-muted animate-pulse w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-md bg-muted mb-4 relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <h3 className="font-bold uppercase tracking-wide truncate">{product.name}</h3>
                <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Value Props */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-20">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center rounded-full mb-2">
                <Paintbrush className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider">Total Control</h3>
              <p className="text-muted-foreground">Upload any design. We print it with studio-grade quality on premium heavyweight cotton.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-full mb-2">
                <Layers className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider">Perfect Fit</h3>
              <p className="text-muted-foreground">Oversized, medium, or slim. Choose the silhouette that matches your vibe.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center rounded-full mb-2">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wider">Fast Drops</h3>
              <p className="text-muted-foreground">From concept to your door in days, not weeks. No more waiting for standard merch.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
