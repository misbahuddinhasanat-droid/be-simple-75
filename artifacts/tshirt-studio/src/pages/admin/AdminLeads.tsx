import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Phone, RefreshCw, ChevronDown, MessageSquare, Check, X } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUSES = ["all", "new", "called", "converted", "not_interested"];

const STATUS_META: Record<string, { label: string; color: string }> = {
  new:            { label: "New Lead",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  called:         { label: "Called",     color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  converted:      { label: "Converted",  color: "bg-green-500/20 text-green-300 border-green-500/30" },
  not_interested: { label: "No Interest",color: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30" },
};

interface CartItem {
  productId: number;
  productName?: string;
  size?: string;
  quantity: number;
  price?: number;
}

interface Lead {
  id: number;
  phone: string;
  name: string;
  email: string;
  cartItems: CartItem[];
  cartTotal: number;
  status: string;
  notes: string;
  createdAt: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/leads?status=${activeStatus}`, { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then((d: Lead[]) => { setLeads(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeStatus]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLead = async (id: number, data: { status?: string; notes?: string }) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json() as Lead;
        setLeads(prev => prev.map(l => l.id === id ? updated : l));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNotes = async (id: number) => {
    setSavingNotes(id);
    await updateLead(id, { notes: editNotes[id] ?? "" });
    setSavingNotes(null);
    setEditNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? leads.length : leads.filter(l => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-black uppercase tracking-tight text-white text-3xl">Incomplete Orders</h1>
            <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-1">
              Customers who started checkout but didn't complete — call to convert
            </p>
          </div>
          <button onClick={fetchLeads} className="flex items-center gap-2 px-4 py-2 border border-[#1a2840] text-[#7a8a99] hover:text-white hover:border-zinc-500 transition-all text-xs font-black uppercase tracking-widest self-start">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-sm transition-all ${
                activeStatus === s
                  ? "bg-[#b8973a] border-[#b8973a] text-[#0a1628]"
                  : "border-[#1a2840] text-[#7a8a99] hover:border-zinc-500 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : STATUS_META[s]?.label ?? s}
              {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
            </button>
          ))}
        </div>

        <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#111f33] animate-pulse rounded-sm" />)}
            </div>
          ) : !leads.length ? (
            <div className="py-20 text-center">
              <Phone className="w-10 h-10 text-[#1a2840] mx-auto mb-3" />
              <p className="text-[#7a8a99] text-xs font-black uppercase tracking-widest">No leads yet</p>
              <p className="text-[#4a5568] text-[10px] mt-2">Leads appear when customers enter their phone on checkout</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2840]">
                    {["Phone", "Customer", "Cart", "Total", "Status", "Time", "Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-[#4a5568]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2840]">
                  {leads.map((lead) => (
                    <Fragment key={lead.id}>
                      <tr
                        className={`hover:bg-[#111f33] transition-colors cursor-pointer ${expandedId === lead.id ? "bg-[#111f33]" : ""}`}
                        onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                      >
                        <td className="px-4 py-3.5">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 font-black text-[#b8973a] text-sm hover:text-[#d4af6a] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            {lead.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-white text-sm">{lead.name || <span className="text-[#4a5568] italic">Unknown</span>}</p>
                          <p className="text-[#7a8a99] text-[10px]">{lead.email || "—"}</p>
                        </td>
                        <td className="px-4 py-3.5 text-[#7a8a99] text-sm font-bold">
                          {lead.cartItems.length} item{lead.cartItems.length !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3.5 font-black text-[#b8973a] text-sm whitespace-nowrap">
                          ৳{lead.cartTotal.toFixed(0)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-sm whitespace-nowrap ${STATUS_META[lead.status]?.color ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                            {STATUS_META[lead.status]?.label ?? lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[#4a5568] text-xs font-bold whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })}
                          <br />
                          {new Date(lead.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <select
                              value={lead.status}
                              onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                              disabled={updatingId === lead.id}
                              className="appearance-none bg-[#111f33] border border-[#1a2840] text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 pr-7 focus:outline-none focus:border-[#b8973a] transition-colors disabled:opacity-50 cursor-pointer hover:border-zinc-500"
                            >
                              <option value="new">New Lead</option>
                              <option value="called">Called</option>
                              <option value="converted">Converted</option>
                              <option value="not_interested">No Interest</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7a8a99] pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                      {expandedId === lead.id && (
                        <tr className="bg-[#060e1a]">
                          <td colSpan={7} className="px-6 py-4 border-b border-[#1a2840]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8973a] mb-3">Cart Items</p>
                                {lead.cartItems.length === 0 ? (
                                  <p className="text-[#4a5568] text-sm">No items captured</p>
                                ) : (
                                  <div className="space-y-2">
                                    {lead.cartItems.map((item, i) => (
                                      <div key={i} className="flex justify-between text-sm">
                                        <span className="text-[#7a8a99] font-bold">
                                          {item.productName ?? `Product #${item.productId}`}
                                          {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                                        </span>
                                        <span className="text-[#b8973a] font-black">
                                          ৳{((item.price ?? 0) * item.quantity).toFixed(0)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-sm pt-2 border-t border-[#1a2840]">
                                      <span className="font-black text-white uppercase tracking-wider">Total</span>
                                      <span className="font-black text-[#b8973a]">৳{lead.cartTotal.toFixed(0)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#b8973a] mb-3 flex items-center gap-2">
                                  <MessageSquare className="w-3 h-3" /> Call Notes
                                </p>
                                <textarea
                                  value={editNotes[lead.id] ?? lead.notes}
                                  onChange={(e) => setEditNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                  placeholder="Add notes about this lead (e.g., 'Interested, call back Friday')"
                                  rows={3}
                                  className="w-full bg-[#111f33] border border-[#1a2840] text-white text-sm font-medium p-3 focus:outline-none focus:border-[#b8973a] transition-colors resize-none placeholder:text-[#4a5568]"
                                />
                                {editNotes[lead.id] !== undefined && (
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => saveNotes(lead.id)}
                                      disabled={savingNotes === lead.id}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#b8973a] text-[#0a1628] font-black text-[10px] uppercase tracking-widest hover:bg-[#d4af6a] transition-colors disabled:opacity-50"
                                    >
                                      <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button
                                      onClick={() => setEditNotes(prev => { const n = { ...prev }; delete n[lead.id]; return n; })}
                                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1a2840] text-[#7a8a99] font-black text-[10px] uppercase tracking-widest hover:border-zinc-500 hover:text-white transition-colors"
                                    >
                                      <X className="w-3 h-3" /> Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
