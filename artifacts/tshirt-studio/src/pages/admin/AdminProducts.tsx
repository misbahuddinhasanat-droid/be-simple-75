import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, Star, Check, X, Pencil, RefreshCw, Zap, Search } from "lucide-react";

const ADMIN_KEY = "besimple2024";

interface Product {
  id: number; name: string; description: string; price: number;
  imageUrl: string; category: string; sizes: string[]; colors: string[];
  featured: boolean; stock: number;
}

const AI_INPUT_STYLE = { background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)", color: "#e2e8f0" };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editId, setEditId]     = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    let list = [...products];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
    setFiltered(list);
  }, [products, search]);

  const startEdit = (product: Product) => { setEditId(product.id); setEditData({ name: product.name, price: product.price, description: product.description, stock: product.stock, featured: product.featured }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async (id: number) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, body: JSON.stringify(editData) });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...editData } as Product : p));
      setSaved(id); setEditId(null); setEditData({});
      setTimeout(() => setSaved(null), 2500);
    } catch { /* silent */ }
    setSaving(false);
  };

  const toggleFeatured = async (product: Product) => {
    const newFeatured = !product.featured;
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, body: JSON.stringify({ featured: newFeatured }) });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: newFeatured } : p));
    } catch { /* silent */ }
  };

  const CATEGORIES = [...new Set(products.map(p => p.category))];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Products</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{filtered.length} of {products.length} listings</p>
          </div>
          <button onClick={fetchProducts} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Products", value: products.length, color: "#ff1744" },
            { label: "Featured",       value: products.filter(p => p.featured).length, color: "#f59e0b" },
            { label: "Categories",     value: CATEGORIES.length, color: "#8b5cf6" },
            { label: "In Stock",       value: products.filter(p => p.stock > 0).length, color: "#34d399" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${color}20` }}>
              <p className="font-black text-2xl" style={{ color }}>{value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or category…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-white outline-none transition-all"
            style={AI_INPUT_STYLE} />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-slate-600" style={{ border: "1px dashed rgba(255,23,68,0.12)" }}>
            <Package className="w-10 h-10 mb-4 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(product => {
              const isEditing = editId === product.id;
              const wasSaved  = saved === product.id;
              return (
                <div key={product.id} className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.025)", border: isEditing ? "1px solid rgba(255,23,68,0.3)" : "1px solid rgba(255,23,68,0.1)" }}>
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,23,68,0.12)" }}>
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input value={editData.name ?? ""} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                          className="w-full px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wide text-white outline-none mb-1.5"
                          style={AI_INPUT_STYLE} />
                      ) : (
                        <p className="text-xs font-black uppercase tracking-wide text-white truncate">{product.name}</p>
                      )}

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(255,23,68,0.1)", color: "#ff4500" }}>{product.category}</span>
                        {product.featured && (
                          <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                            <Star className="w-2.5 h-2.5" fill="currentColor" />Featured
                          </span>
                        )}
                        {wasSaved && (
                          <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                            <Check className="w-2.5 h-2.5" />Saved
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        {isEditing ? (
                          <input type="number" value={editData.price ?? ""} onChange={e => setEditData(d => ({ ...d, price: Number(e.target.value) }))}
                            className="w-24 px-2 py-1 rounded-lg text-xs font-black text-white outline-none"
                            style={AI_INPUT_STYLE} />
                        ) : (
                          <p className="font-black text-sm gradient-text-red-orange">৳{product.price}</p>
                        )}
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Stock: {isEditing ? (
                          <input type="number" value={editData.stock ?? ""} onChange={e => setEditData(d => ({ ...d, stock: Number(e.target.value) }))}
                            className="inline w-14 px-1.5 py-0.5 rounded text-[9px] font-bold text-white outline-none ml-1"
                            style={AI_INPUT_STYLE} />
                        ) : product.stock}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(255,23,68,0.06)" }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(product.id)} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white" }}>
                          {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                          style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,23,68,0.1)" }}>
                          <X className="w-3 h-3" />Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                          style={{ background: "rgba(255,23,68,0.08)", color: "#ff1744", border: "1px solid rgba(255,23,68,0.2)" }}>
                          <Pencil className="w-3 h-3" />Edit
                        </button>
                        <button onClick={() => toggleFeatured(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                          style={product.featured
                            ? { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }
                            : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,23,68,0.1)" }}>
                          <Star className="w-3 h-3" fill={product.featured ? "currentColor" : "none"} />
                          {product.featured ? "Unfeature" : "Feature"}
                        </button>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1" style={{ color: product.stock > 0 ? "#34d399" : "#f87171" }}>
                          <Zap className="w-3 h-3" fill="currentColor" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{product.stock > 0 ? "In Stock" : "Out"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
