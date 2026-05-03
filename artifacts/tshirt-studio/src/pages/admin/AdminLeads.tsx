import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Phone, RefreshCw, ChevronDown, MessageSquare, Check, X, Shield, AlertTriangle, ShieldCheck, ShieldX, Loader2 } from "lucide-react";

const ADMIN_KEY = "besimple2024";

const STATUSES = ["all", "new", "called", "converted", "not_interested"];

const STATUS_META: Record<string, { label: string; dot: string; bg: string }> = {
  new:            { label: "New Lead",    dot: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  called:         { label: "Called",      dot: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  converted:      { label: "Converted",   dot: "#34d399", bg: "rgba(52,211,153,0.12)" },
  not_interested: { label: "No Interest", dot: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

const GRADE_CFG: Record<string, { label: string; color: string; bg: string; icon: typeof ShieldCheck; desc: string }> = {
  "A+": { label: "A+", color: "#34d399", bg: "rgba(52,211,153,0.15)", icon: ShieldCheck, desc: "Excellent — 0% cancellation" },
  "A":  { label: "A",  color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: ShieldCheck, desc: "Great — <10% cancellation" },
  "B":  { label: "B",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: Shield,      desc: "Good — <25% cancellation" },
  "C":  { label: "C",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: Shield,      desc: "Moderate — <50% cancellation" },
  "D":  { label: "D",  color: "#fb923c", bg: "rgba(251,146,60,0.12)", icon: AlertTriangle, desc: "Poor — <75% cancellation" },
  "F":  { label: "F",  color: "#f87171", bg: "rgba(248,113,113,0.15)", icon: ShieldX,    desc: "Fraud risk — high cancellation" },
};

interface FraudResult {
  phone: string;
  totalOrder: number;
  cancelOrder: number;
  cancelRate: number;
  grade: string;
}

interface CartItem {
  productId: number; productName?: string; size?: string; quantity: number; price?: number;
}

interface Lead {
  id: number; phone: string; name: string; email: string;
  cartItems: CartItem[]; cartTotal: number; status: string; notes: string; createdAt: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);
  const [fraudResults, setFraudResults] = useState<Record<number, FraudResult | "loading" | "error" | string>>({});

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/leads?status=${activeStatus}`, { headers: { "x-admin-key": ADMIN_KEY } })
      .then(r => r.json()).then((d: Lead[]) => { setLeads(d); setLoading(false); })
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
    } finally { setUpdatingId(null); }
  };

  const saveNotes = async (id: number) => {
    setSavingNotes(id);
    await updateLead(id, { notes: editNotes[id] ?? "" });
    setSavingNotes(null);
    setEditNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const checkFraud = async (leadId: number, phone: string) => {
    setFraudResults(prev => ({ ...prev, [leadId]: "loading" }));
    try {
      const res = await fetch(`/api/admin/fraud-check?phone=${encodeURIComponent(phone)}`, {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      const data = await res.json() as FraudResult & { error?: string };
      if (!res.ok || data.error) {
        setFraudResults(prev => ({ ...prev, [leadId]: data.error ?? "error" }));
      } else {
        setFraudResults(prev => ({ ...prev, [leadId]: data }));
      }
    } catch {
      setFraudResults(prev => ({ ...prev, [leadId]: "error" }));
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? leads.length : leads.filter(l => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-7 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Lead Management</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Incomplete Orders</h1>
            <p className="text-sm font-medium mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              Customers who entered their phone — call to convert them
            </p>
          </div>
          <button onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all self-start"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => {
            const sm = STATUS_META[s];
            const isActive = activeStatus === s;
            return (
              <button key={s} onClick={() => setActiveStatus(s)}
                className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                style={{
                  background: isActive ? (s === "all" ? "rgba(201,162,39,0.15)" : sm.bg) : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? (s === "all" ? "rgba(201,162,39,0.4)" : sm.dot + "55") : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? (s === "all" ? "#c9a227" : sm.dot) : "rgba(255,255,255,0.35)",
                }}
              >
                {s === "all" ? "All" : sm.label}
                {counts[s] > 0 && <span className="ml-1.5 opacity-60">({counts[s]})</span>}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
            </div>
          ) : !leads.length ? (
            <div className="py-24 text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.08)" }} />
              <p className="font-black text-sm uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>No leads yet</p>
              <p className="text-[11px] mt-2 font-medium" style={{ color: "rgba(255,255,255,0.15)" }}>Leads appear when customers enter phone on checkout</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Phone / Fraud", "Customer", "Cart", "Total", "Status", "Time", "Action"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, idx) => {
                    const fraud = fraudResults[lead.id];
                    const fraudData = typeof fraud === "object" && fraud !== null ? fraud as FraudResult : null;
                    const gc = fraudData ? (GRADE_CFG[fraudData.grade] ?? GRADE_CFG["F"]) : null;
                    const GradeIcon = gc?.icon ?? Shield;
                    const isLast = idx === leads.length - 1;
                    return (
                      <Fragment key={lead.id}>
                        <tr className="transition-colors cursor-pointer"
                          style={{ borderBottom: !isLast || expandedId === lead.id ? "1px solid rgba(255,255,255,0.04)" : "none",
                            background: expandedId === lead.id ? "rgba(255,255,255,0.025)" : "transparent" }}
                          onMouseEnter={e => { if (expandedId !== lead.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                          onMouseLeave={e => { if (expandedId !== lead.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                        >
                          {/* Phone + Fraud */}
                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <a href={`tel:${lead.phone}`}
                              className="flex items-center gap-2 font-black text-sm transition-colors mb-1.5 w-fit"
                              style={{ color: "#c9a227" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e8c84a"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#c9a227"; }}
                            >
                              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                              {lead.phone}
                            </a>
                            {/* Fraud check UI */}
                            {fraud === "loading" ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
                                <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                              </div>
                            ) : fraudData && gc ? (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg w-fit"
                                style={{ background: gc.bg, border: `1px solid ${gc.color}33` }}>
                                <GradeIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: gc.color }} />
                                <span className="font-black text-[11px]" style={{ color: gc.color }}>Grade {gc.label}</span>
                                <span className="text-[10px] font-bold opacity-70" style={{ color: gc.color }}>
                                  {fraudData.cancelOrder}/{fraudData.totalOrder} cancelled ({fraudData.cancelRate}%)
                                </span>
                              </div>
                            ) : typeof fraud === "string" && fraud !== "loading" ? (
                              <div className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                                {fraud === "error" ? "API error — check BD Courier key in Settings" : fraud}
                              </div>
                            ) : (
                              <button
                                onClick={() => checkFraud(lead.id, lead.phone)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                                onMouseEnter={e => {
                                  const b = e.currentTarget as HTMLButtonElement;
                                  b.style.background = "rgba(248,113,113,0.12)";
                                  b.style.borderColor = "rgba(248,113,113,0.3)";
                                  b.style.color = "#f87171";
                                }}
                                onMouseLeave={e => {
                                  const b = e.currentTarget as HTMLButtonElement;
                                  b.style.background = "rgba(255,255,255,0.05)";
                                  b.style.borderColor = "rgba(255,255,255,0.1)";
                                  b.style.color = "rgba(255,255,255,0.4)";
                                }}
                              >
                                <Shield className="w-3 h-3" /> Check Fraud
                              </button>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-white text-sm">{lead.name || <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Unknown</span>}</p>
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{lead.email || "—"}</p>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {lead.cartItems.length} item{lead.cartItems.length !== 1 ? "s" : ""}
                          </td>
                          <td className="px-5 py-4 font-black text-sm whitespace-nowrap" style={{ color: "#c9a227" }}>
                            ৳{lead.cartTotal.toFixed(0)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                              style={{
                                background: STATUS_META[lead.status]?.bg ?? "rgba(255,255,255,0.06)",
                                color: STATUS_META[lead.status]?.dot ?? "rgba(255,255,255,0.4)",
                              }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[lead.status]?.dot ?? "rgba(255,255,255,0.4)" }} />
                              {STATUS_META[lead.status]?.label ?? lead.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[11px] font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {new Date(lead.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })}
                            <br />
                            {new Date(lead.createdAt).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <div className="relative">
                              <select
                                value={lead.status}
                                onChange={e => updateLead(lead.id, { status: e.target.value })}
                                disabled={updatingId === lead.id}
                                className="appearance-none text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 pr-7 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer rounded-lg"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                              >
                                <option value="new">New Lead</option>
                                <option value="called">Called</option>
                                <option value="converted">Converted</option>
                                <option value="not_interested">No Interest</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedId === lead.id && (
                          <tr style={{ borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                            <td colSpan={7} className="px-6 py-5" style={{ background: "rgba(0,0,0,0.2)" }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cart */}
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#c9a227" }}>Cart Items</p>
                                  {lead.cartItems.length === 0 ? (
                                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>No items captured</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {lead.cartItems.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm py-1.5 px-3 rounded-xl"
                                          style={{ background: "rgba(255,255,255,0.04)" }}>
                                          <span className="font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                                            {item.productName ?? `Product #${item.productId}`}
                                            {item.size ? ` · ${item.size}` : ""} × {item.quantity}
                                          </span>
                                          <span className="font-black" style={{ color: "#c9a227" }}>৳{((item.price ?? 0) * item.quantity).toFixed(0)}</span>
                                        </div>
                                      ))}
                                      <div className="flex justify-between text-sm pt-2 px-3">
                                        <span className="font-black text-white uppercase tracking-wider">Total</span>
                                        <span className="font-black text-lg" style={{ color: "#c9a227" }}>৳{lead.cartTotal.toFixed(0)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Notes */}
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#c9a227" }}>
                                    <MessageSquare className="w-3 h-3" /> Call Notes
                                  </p>
                                  <textarea
                                    value={editNotes[lead.id] ?? lead.notes}
                                    onChange={e => setEditNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                    placeholder="Add notes (e.g., 'Interested, call back Friday 3pm')"
                                    rows={3}
                                    className="w-full text-white text-sm font-medium p-3 focus:outline-none transition-colors resize-none rounded-xl"
                                    style={{
                                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                      color: "rgba(255,255,255,0.8)",
                                    }}
                                    onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(201,162,39,0.4)"; }}
                                    onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                                  />
                                  {editNotes[lead.id] !== undefined && (
                                    <div className="flex gap-2 mt-2">
                                      <button onClick={() => saveNotes(lead.id)} disabled={savingNotes === lead.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                        style={{ background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.4)", color: "#c9a227" }}>
                                        <Check className="w-3 h-3" /> Save
                                      </button>
                                      <button onClick={() => setEditNotes(prev => { const n = { ...prev }; delete n[lead.id]; return n; })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
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
