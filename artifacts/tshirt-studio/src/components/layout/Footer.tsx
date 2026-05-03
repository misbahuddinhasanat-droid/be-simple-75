import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t-2 border-[#1f1f1f] bg-[#0a0a0a] text-zinc-400">
      <div className="container px-4 py-16 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-6 text-white">ThreadCraft</h3>
            <p className="font-bold uppercase tracking-wider text-sm max-w-md leading-relaxed">
              Where self-expression meets concrete. A playground for people who want their clothes to say exactly what they mean. Built for the bold.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase text-sm tracking-widest text-white">Shop Drops</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wider">
              <li><Link href="/products" className="hover:text-[#e63329] transition-colors">All Products</Link></li>
              <li><Link href="/customize" className="hover:text-[#e63329] transition-colors">The Studio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 uppercase text-sm tracking-widest text-white">Support</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-wider">
              <li><a href="#" className="hover:text-[#e63329] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#e63329] transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#e63329] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t-2 border-[#1f1f1f] text-xs font-black uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600">
          <p>&copy; {new Date().getFullYear()} ThreadCraft. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Insta</a>
            <a href="#" className="hover:text-white transition-colors">Tiktok</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
