import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tighter mb-4">ThreadCraft Studio</h3>
            <p className="text-muted-foreground max-w-sm">
              Where self-expression meets streetwear. A playground for people who want their clothes to say exactly what they mean. Built for the bold.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/customize" className="hover:text-primary transition-colors">Custom Studio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ThreadCraft Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
