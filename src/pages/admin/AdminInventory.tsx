import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, RefreshCw, Search, Save, AlertCircle } from "lucide-react";

const ADMIN_KEY = "Besimple90@@";

interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

const AI_INPUT_STYLE = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" };

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

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

  const updateStock = async (id: number, newStock: number) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      }
    } catch (err) {
      console.error(err);
    }
    setSavingId(null);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Inventory</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">Manage Stock & SKUs</p>
          </div>
          <button onClick={fetchProducts} disabled={loading} className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by SKU or Product Name..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white outline-none"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <table className="w-full text-left">
            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Stock Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(p => (
                <tr key={p.id} className="group hover:bg-white/[0.01]">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white uppercase truncate max-w-[200px]">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">৳{p.price}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 px-2 py-1 rounded">
                      {p.sku || "NO-SKU"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.stock <= 0 ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500">
                        <AlertCircle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : p.stock < 10 ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500">
                        <AlertCircle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <input 
                        type="number" 
                        defaultValue={p.stock}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (val !== p.stock) updateStock(p.id, val);
                        }}
                        className="w-20 px-3 py-1.5 rounded-lg text-sm font-black text-right outline-none focus:border-rose-500/50"
                        style={AI_INPUT_STYLE}
                      />
                      {savingId === p.id && <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
