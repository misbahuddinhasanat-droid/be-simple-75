import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, Star, Check, X, Pencil } from "lucide-react";

const ADMIN_KEY = "besimple2024";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  featured: boolean;
  stock: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Anime:  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Music:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Gaming: "bg-green-500/20 text-green-300 border-green-500/30",
  Street: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/products", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then((d: Product[]) => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleFeatured = async (id: number, current: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ featured: !current }),
    });
    if (res.ok) {
      const updated = await res.json() as Product;
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(String(p.price));
    setEditStock(String(p.stock));
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
      body: JSON.stringify({ price: parseFloat(editPrice), stock: parseInt(editStock) }),
    });
    if (res.ok) {
      const updated = await res.json() as Product;
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
    setSaving(false);
    setEditingId(null);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const displayed = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-black uppercase tracking-tight text-white text-3xl">Products</h1>
            <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-1">{displayed.length} products</p>
          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                  activeCategory === cat
                    ? "bg-[#b8973a] border-[#b8973a] text-[#0a1628]"
                    : "border-[#1a2840] text-[#7a8a99] hover:border-zinc-500 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-[#111f33] animate-pulse rounded-sm" />)}
            </div>
          ) : !displayed.length ? (
            <div className="py-20 text-center">
              <Package className="w-10 h-10 text-[#1a2840] mx-auto mb-3" />
              <p className="text-[#7a8a99] text-xs font-black uppercase tracking-widest">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2840]">
                    {["Product", "Category", "Price", "Stock", "Featured", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#4a5568]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2840]">
                  {displayed.map((product) => {
                    const isEditing = editingId === product.id;
                    return (
                      <tr key={product.id} className="hover:bg-[#111f33] transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#111f33] border border-[#1a2840] overflow-hidden flex-shrink-0">
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-[#4a5568] text-[10px] font-bold">ID #{product.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-sm ${CATEGORY_COLORS[product.category] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 h-8 bg-[#060e1a] border border-[#b8973a] text-white text-sm font-black px-2 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <div>
                              <p className="font-black text-[#b8973a] text-sm">৳{product.price.toFixed(0)}</p>
                              <p className="text-[#4a5568] text-[10px] line-through">৳999</p>
                            </div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-20 h-8 bg-[#060e1a] border border-[#b8973a] text-white text-sm font-black px-2 focus:outline-none"
                              type="number"
                            />
                          ) : (
                            <span className={`font-black text-sm ${product.stock > 10 ? "text-green-400" : product.stock > 0 ? "text-yellow-400" : "text-red-400"}`}>
                              {product.stock}
                            </span>
                          )}
                        </td>

                        {/* Featured */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleFeatured(product.id, product.featured)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                              product.featured
                                ? "bg-[#b8973a]/20 border-[#b8973a]/40 text-[#b8973a] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300"
                                : "border-[#1a2840] text-[#4a5568] hover:border-[#b8973a]/40 hover:text-[#b8973a]"
                            }`}
                          >
                            <Star className="w-3 h-3" fill={product.featured ? "currentColor" : "none"} />
                            {product.featured ? "Featured" : "Set Featured"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEdit(product.id)}
                                disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#b8973a] text-[#0a1628] font-black text-[10px] uppercase tracking-widest hover:bg-[#d4af6a] transition-colors disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-3 py-1.5 border border-[#1a2840] text-[#7a8a99] font-black text-[10px] uppercase tracking-widest hover:border-zinc-500 hover:text-white transition-colors"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1a2840] text-[#7a8a99] font-black text-[10px] uppercase tracking-widest hover:border-zinc-500 hover:text-white transition-all"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
