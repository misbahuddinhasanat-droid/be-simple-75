import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tag, Plus, Trash2, RefreshCw, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_KEY = "Besimple90@@";

interface Category {
  id: number;
  name: string;
  slug: string;
}

const AI_INPUT_STYLE = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]   = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", { 
        method: "POST", 
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, 
        body: JSON.stringify({ name, slug }) 
      });
      if (res.ok) {
        const created = await res.json();
        setCategories(prev => [...prev, created]);
        setName("");
        setSlug("");
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? Products in this category will not be deleted, but they will lose their category assignment.")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE", headers: { "X-Admin-Key": ADMIN_KEY } });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch { /* silent */ }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Categories</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">Manage Product Collections</p>
          </div>
          <button onClick={fetchCategories} disabled={loading} className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Category */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCreate} className="p-6 rounded-2xl space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h2 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Add New Category
              </h2>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Category Name</label>
                <input value={name} onChange={e => { setName(e.target.value); if(!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} 
                  placeholder="E.g. Oversized T-Shirts" className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-rose-500/50" style={AI_INPUT_STYLE} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Slug (URL friendly)</label>
                <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} 
                  placeholder="oversized-t-shirts" className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-rose-500/50" style={AI_INPUT_STYLE} />
              </div>
              <button type="submit" disabled={saving || !name || !slug} className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]" 
                style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", boxShadow: "0 10px 20px -5px rgba(255,23,68,0.3)" }}>
                {saving ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>

          {/* List Categories */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <table className="w-full text-left">
                <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Slug</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {categories.map(cat => (
                      <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                              <Tag className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-white uppercase">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">{cat.slug}</code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {categories.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">No categories yet. Add one to get started!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
