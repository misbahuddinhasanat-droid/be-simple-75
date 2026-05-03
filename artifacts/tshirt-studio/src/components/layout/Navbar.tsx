import { ReactNode } from "react";
import { Link } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const { data: cart } = useGetCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display font-bold text-xl uppercase tracking-tighter">ThreadCraft</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-primary">
              Shop All
            </Link>
            <Link href="/customize" className="transition-colors hover:text-primary">
              Studio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background flex flex-col gap-4">
          <Link href="/products" onClick={() => setIsOpen(false)} className="text-lg font-medium">
            Shop All
          </Link>
          <Link href="/customize" onClick={() => setIsOpen(false)} className="text-lg font-medium">
            Studio
          </Link>
        </div>
      )}
    </header>
  );
}
