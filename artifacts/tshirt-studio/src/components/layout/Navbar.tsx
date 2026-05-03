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
    <header className="sticky top-0 z-50 w-full border-b border-[#1f1f1f] bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display font-black text-2xl uppercase tracking-tighter text-white">THREADCRAFT</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-widest">
            <Link href="/products" className="text-zinc-400 hover:text-white transition-colors">
              Shop All
            </Link>
            <Link href="/customize" className="text-zinc-400 hover:text-white transition-colors">
              Studio
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#1f1f1f] rounded-none h-12 w-12">
              <ShoppingBag className="h-6 w-6" />
              <span className="sr-only">Shopping Cart</span>
              {itemCount > 0 && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e63329] text-[10px] font-black text-white ring-2 ring-[#0a0a0a]">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#1f1f1f] rounded-none h-12 w-12" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#1f1f1f] p-6 bg-[#0a0a0a] flex flex-col gap-6">
          <Link href="/products" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase tracking-widest text-white">
            Shop All
          </Link>
          <Link href="/customize" onClick={() => setIsOpen(false)} className="text-2xl font-black uppercase tracking-widest text-white">
            Studio
          </Link>
        </div>
      )}
    </header>
  );
}
