import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, Star, Check, X, Pencil, RefreshCw, Zap, Search, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const ADMIN_KEY = "besimple2024";

interface Product {
  id: number; name: string; description: string; price: number;
  imageUrl: string; category: string; sizes: string[]; colors: string[];
  featured: boolean; stock: number;
}

const AI_INPUT_STYLE = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" };

function ProductEditor({ 
  product, 
  onSave, 
  onCancel, 
  saving 
}: { 
  product: Partial<Product> | null, 
  onSave: (p: Partial<Product>) => void, 
  onCancel: () => void,
  saving: boolean 
}) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: "", description: "", price: 0, imageUrl: "", category: "T-Shirt",
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["White", "Black"],
    featured: false, stock: 100
  });

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: "#0f172a", border: "1px solid rgba(255,23,68,0.2)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur">
          <h2 className="text-xl font-black uppercase tracking-widest text-white">
            {product.id ? "Edit Product" : "New Drop"}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Media & Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Product Image URL</label>
              <div className="flex gap-2">
                <input value={formData.imageUrl || ""} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..." className="flex-1 px-3 py-2.5 rounded-xl text-sm font-medium outline-none transition-all focus:border-rose-500/50"
                  style={AI_INPUT_STYLE} />
              </div>
              {formData.imageUrl ? (
                <div className="mt-4 aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                </div>
              ) : (
                <div className="mt-4 aspect-[4/5] rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Image</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Product Name</label>
              <input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. BERSERK OVERSIZED TEE" className="w-full px-3 py-2.5 rounded-xl text-lg font-black uppercase tracking-wide outline-none focus:border-rose-500/50"
                style={AI_INPUT_STYLE} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Price (৳)</label>
                <input type="number" value={formData.price || ""} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl text-lg font-black text-rose-500 outline-none focus:border-rose-500/50"
                  style={AI_INPUT_STYLE} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Stock</label>
                <input type="number" value={formData.stock ?? 100} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl text-lg font-black outline-none focus:border-rose-500/50"
                  style={AI_INPUT_STYLE} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
              <input value={formData.category || ""} onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="E.g. Anime, Street" className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-rose-500/50"
                style={AI_INPUT_STYLE} />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={4} placeholder="Premium oversized fit..." className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-rose-500/50 resize-none"
                style={AI_INPUT_STYLE} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Sizes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.sizes?.map(size => (
                    <span key={size} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded bg-white/10 text-xs font-bold">
                      {size}
                      <button onClick={() => setFormData({ ...formData, sizes: formData.sizes?.filter(s => s !== size) })} className="p-0.5 hover:bg-white/20 rounded"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && sizeInput) { e.preventDefault(); setFormData({ ...formData, sizes: [...(formData.sizes||[]), sizeInput.toUpperCase()] }); setSizeInput(""); } }}
                    placeholder="Add size..." className="flex-1 px-2 py-1.5 rounded-lg text-xs font-bold uppercase outline-none" style={AI_INPUT_STYLE} />
                  <button onClick={() => { if (sizeInput) { setFormData({ ...formData, sizes: [...(formData.sizes||[]), sizeInput.toUpperCase()] }); setSizeInput(""); } }} className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.colors?.map(color => (
                    <span key={color} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded bg-white/10 text-xs font-bold">
                      {color}
                      <button onClick={() => setFormData({ ...formData, colors: formData.colors?.filter(c => c !== color) })} className="p-0.5 hover:bg-white/20 rounded"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && colorInput) { e.preventDefault(); setFormData({ ...formData, colors: [...(formData.colors||[]), colorInput] }); setColorInput(""); } }}
                    placeholder="Add color..." className="flex-1 px-2 py-1.5 rounded-lg text-xs font-bold outline-none" style={AI_INPUT_STYLE} />
                  <button onClick={() => { if (colorInput) { setFormData({ ...formData, colors: [...(formData.colors||[]), colorInput] }); setColorInput(""); } }} className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.featured ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                <Star className="w-4 h-4" fill={formData.featured ? "currentColor" : "none"} />
                {formData.featured ? "Featured Product" : "Not Featured"}
              </button>
            </div>

          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t border-white/5 bg-[#0f172a]/90 backdrop-blur flex gap-4 justify-end">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", boxShadow: "0 10px 25px -5px rgba(255,23,68,0.4)" }}>
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {product.id ? "Save Changes" : "Publish Drop"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  
  // Editor State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async (data: Partial<Product>) => {
    setSaving(true);
    try {
      if (data.id) {
        // Update
        const res = await fetch(`/api/admin/products/${data.id}`, { 
          method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, 
          body: JSON.stringify(data) 
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === data.id ? updated : p));
          setEditingProduct(null);
        }
      } else {
        // Create
        const res = await fetch(`/api/admin/products`, { 
          method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, 
          body: JSON.stringify(data) 
        });
        if (res.ok) {
          const created = await res.json();
          setProducts(prev => [created, ...prev]);
          setEditingProduct(null);
        }
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers: { "X-Admin-Key": ADMIN_KEY } });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch { /* silent */ }
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
          <div className="flex items-center gap-3">
            <button onClick={fetchProducts} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-slate-400 hover:text-white bg-white/5 hover:bg-white/10">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setEditingProduct({})} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", boxShadow: "0 10px 25px -5px rgba(255,23,68,0.4)" }}>
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or category…"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white outline-none transition-all focus:border-rose-500/30"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl text-slate-600" style={{ border: "1px dashed rgba(255,23,68,0.12)", background: "rgba(255,23,68,0.02)" }}>
            <Package className="w-12 h-12 mb-4 opacity-30 text-rose-500" />
            <p className="text-xs font-black uppercase tracking-widest text-rose-500/50 mb-4">No products found</p>
            <button onClick={() => setEditingProduct({})} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-rose-500 transition-all bg-rose-500/10 hover:bg-rose-500/20">
              <Plus className="w-4 h-4" /> Create First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                
                {/* Header Image & Actions */}
                <div className="relative h-48 w-full overflow-hidden bg-black/50">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}>
                      {product.category}
                    </span>
                    {product.featured && (
                      <span className="backdrop-blur-md flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ background: "rgba(251,191,36,0.2)", borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                        <Star className="w-2.5 h-2.5" fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Quick Actions (Hover) */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => toggleFeatured(product)} className="p-2 rounded-full backdrop-blur-md bg-black/50 border border-white/10 text-white hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/50 transition-all">
                      <Star className="w-3.5 h-3.5" fill={product.featured ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-full backdrop-blur-md bg-black/50 border border-white/10 text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-sm font-black uppercase tracking-wide text-white leading-tight">{product.name}</h3>
                    <p className="font-black text-sm text-rose-500">৳{product.price}</p>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                    <div className="flex items-center gap-1.5" style={{ color: product.stock > 0 ? "#34d399" : "#f87171" }}>
                      <Zap className="w-3.5 h-3.5" fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}</span>
                    </div>
                    <button onClick={() => setEditingProduct(product)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        <AnimatePresence>
          {editingProduct && (
            <ProductEditor 
              product={editingProduct} 
              saving={saving}
              onSave={handleSave} 
              onCancel={() => setEditingProduct(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
