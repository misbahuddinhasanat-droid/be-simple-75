import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, Star, Check, X, Pencil, RefreshCw } from "lucide-react";

const ADMIN_KEY = "besimple2024";

interface Product {
  id: number; name: string; description: string; price: number;
  imageUrl: string; category: string; sizes: string[]; colors: string[];
  featured: boolean; stock: number;
}

type EditField = "price" | "stock" | null;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/products", { headers: { "x-admin-key": ADMIN_KEY } })
      .then(r => r.json()).then((d: Product[]) => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const startEdit = (id: number, field: EditField, currentValue: string | number) => {
    setEditingId(id); setEditField(field); setEditValue(String(currentValue));
  };

  const cancelEdit = () => { setEditingId(null); setEditField(null); setEditValue(""); };

  const saveEdit = async (id: number) => {
    if (!editField) return;
    setSavingId(id);
    const body: Record<string, unknown> = {};
    if (editField === "price") body.price = parseFloat(editValue);
    if (editField === "stock") body.stock = parseInt(editValue);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json() as Product;
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
        cancelEdit();
      }
    } finally { setSavingId(null); }
  };

  const toggleFeatured = async (id: number, featured: boolean) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ featured: !featured }),
      });
      if (res.ok) {
        const updated = await res.json() as Product;
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
      }
    } finally { setSavingId(null); }
  };

  const featured = products.filter(p => p.featured);
  const rest = products.filter(p => !p.featured);
  const sorted = [...featured, ...rest];

  return (
    <AdminLayout>
      <div className="space-y-7 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Product Management</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Products</h1>
            <p className="text-sm font-medium mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              {products.length} products · {featured.length} featured
            </p>
          </div>
          <button onClick={fetchProducts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest self-start"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        ) : !products.length ? (
          <div className="py-24 text-center rounded-2xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.08)" }} />
            <p className="font-black text-sm uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map(product => {
              const isEditing = editingId === product.id;
              const isSaving = savingId === product.id;

              return (
                <div key={product.id} className="rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${product.featured ? "rgba(201,162,39,0.3)" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: product.featured ? "0 4px 24px rgba(201,162,39,0.1)" : "none",
                  }}>
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.imageUrl} alt={product.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x400/0d1b2a/ffffff?text=No+Image"; }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />

                    {/* Featured badge */}
                    <button onClick={() => toggleFeatured(product.id, product.featured)} disabled={isSaving}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-xl transition-all disabled:opacity-50"
                      style={{
                        background: product.featured ? "rgba(201,162,39,0.9)" : "rgba(0,0,0,0.5)",
                        border: `1px solid ${product.featured ? "rgba(201,162,39,1)" : "rgba(255,255,255,0.15)"}`,
                        backdropFilter: "blur(8px)",
                      }}
                      title={product.featured ? "Remove from featured" : "Add to featured"}>
                      <Star className={`w-3.5 h-3.5 ${product.featured ? "text-black fill-black" : "text-white"}`} />
                    </button>

                    {/* Product ID */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                      style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)" }}>
                      #{product.id}
                    </span>

                    {/* Stock badge */}
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                      style={{
                        background: product.stock > 10 ? "rgba(52,211,153,0.2)" : product.stock > 0 ? "rgba(251,191,36,0.2)" : "rgba(248,113,113,0.2)",
                        color: product.stock > 10 ? "#34d399" : product.stock > 0 ? "#fbbf24" : "#f87171",
                        border: `1px solid ${product.stock > 10 ? "rgba(52,211,153,0.3)" : product.stock > 0 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
                        backdropFilter: "blur(8px)",
                      }}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <p className="font-black text-white text-sm leading-tight line-clamp-1">{product.name}</p>
                      <p className="text-[10px] font-bold mt-0.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{product.category}</p>
                    </div>

                    {/* Price editing */}
                    {isEditing && editField === "price" ? (
                      <div className="flex items-center gap-2">
                        <span className="font-black" style={{ color: "#c9a227" }}>৳</span>
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                          className="flex-1 h-8 px-2 text-white text-sm font-black focus:outline-none rounded-lg"
                          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,162,39,0.4)" }}
                          autoFocus onKeyDown={e => { if (e.key === "Enter") saveEdit(product.id); if (e.key === "Escape") cancelEdit(); }}
                        />
                        <button onClick={() => saveEdit(product.id)} disabled={isSaving} className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}>
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(product.id, "price", product.price)}
                        className="flex items-center justify-between w-full group rounded-xl px-3 py-2 transition-all"
                        style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.15)" }}>
                        <span className="font-black text-lg" style={{ color: "#c9a227" }}>৳{product.price.toFixed(0)}</span>
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c9a227" }} />
                      </button>
                    )}

                    {/* Stock editing */}
                    {isEditing && editField === "stock" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Stock:</span>
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                          className="flex-1 h-8 px-2 text-white text-sm font-black focus:outline-none rounded-lg"
                          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,162,39,0.4)" }}
                          autoFocus onKeyDown={e => { if (e.key === "Enter") saveEdit(product.id); if (e.key === "Escape") cancelEdit(); }}
                        />
                        <button onClick={() => saveEdit(product.id)} disabled={isSaving} className="p-1.5 rounded-lg" style={{ background: "rgba(52,211,153,0.2)", color: "#34d399" }}>
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(product.id, "stock", product.stock)}
                        className="flex items-center justify-between w-full group rounded-xl px-3 py-1.5 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                          <span className="text-[11px] font-black" style={{ color: "rgba(255,255,255,0.5)" }}>Stock: {product.stock}</span>
                        </div>
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.4)" }} />
                      </button>
                    )}

                    {/* Sizes */}
                    <div className="flex gap-1 flex-wrap">
                      {product.sizes.map(sz => (
                        <span key={sz} className="px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase"
                          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          {sz}
                        </span>
                      ))}
                    </div>
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
