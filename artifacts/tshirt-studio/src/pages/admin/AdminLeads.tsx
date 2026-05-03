import { useEffect, useState, useCallback, Fragment } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Phone, RefreshCw, ChevronDown, Search, Check, X,
  Shield, ShieldCheck, ShieldX, Loader2, AlertTriangle, Zap,
} from "lucide-react";

const ADMIN_KEY = "besimple2024";
const STATUSES = ["all", "new", "called", "converted", "not_interested"];

const STATUS_META: Record<string, { label: string; dot: string; bg: string }> = {
  new:           { label: "New Lead",      dot: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  called:        { label: "Called",        dot: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  converted:     { label: "Converted",     dot: "#34d399", bg: "rgba(52,211,153,0.1)" },
  not_interested:{ label: "Not Interested",dot: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const GRADE_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; desc: string }> = {
  "A+": { label: "A+", color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: ShieldCheck,   desc: "Premium — High value, verified customer" },
  "A":  { label: "A",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: ShieldCheck,   desc: "Excellent — Reliable repeat buyer" },
  "B":  { label: "B",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)", icon: Shield,        desc: "Good — Normal order pattern" },
  "C":  { label: "C",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: Shield,        desc: "Average — Proceed with caution" },
  "D":  { label: "D",  color: "#fb923c", bg: "rgba(251,146,60,0.12)",  icon: AlertTriangle, desc: "Below Average — Verify before ship" },
  "F":  { label: "F",  color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: ShieldX,       desc: "Fraud Risk — Block or verify identity" },
};

interface Lead {
  id: number; name: string; phone: string; address: string;
  productInterest: string; message: string | null;
  status: string; createdAt: string;
}
interface FraudResult { grade: string; score: number; reason: string; }

const AI_INPUT_STYLE = { background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)", color: "#e2e8f0" };

export default function AdminLeads() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [filtered, setFiltered]   = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState("all");
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [updating, setUpdating]   = useState<number | null>(null);
  const [fraudMap, setFraudMap]   = useState<Record<number, FraudResult | null>>({});
  const [fraudLoading, setFraudLoading] = useState<Record<number, boolean>>({});

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { setLeads([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    let list = [...leads].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== "all") list = list.filter(l => l.status === statusFilter);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q)); }
    setFiltered(list);
  }, [leads, statusFilter, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, body: JSON.stringify({ status }) });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch { /* silent */ }
    setUpdating(null);
  };

  const checkFraud = async (lead: Lead) => {
    setFraudLoading(prev => ({ ...prev, [lead.id]: true }));
    try {
      const res = await fetch("/api/admin/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify({ name: lead.name, phone: lead.phone, address: lead.address }),
      });
      const data = await res.json();
      setFraudMap(prev => ({ ...prev, [lead.id]: data }));
    } catch {
      setFraudMap(prev => ({ ...prev, [lead.id]: { grade: "C", score: 50, reason: "Could not reach fraud API. Manual review needed." } }));
    }
    setFraudLoading(prev => ({ ...prev, [lead.id]: false }));
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tight text-white">Leads & COD</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">{filtered.length} of {leads.length} total</p>
          </div>
          <button onClick={fetchLeads} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "#ff1744" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…"
              className="w-full px-3 py-2.5 pl-10 rounded-lg text-sm font-medium text-white outline-none transition-all"
              style={AI_INPUT_STYLE} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {STATUSES.map(s => {
              const cfg = STATUS_META[s];
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                  style={statusFilter === s
                    ? { background: cfg ? cfg.bg : "rgba(255,23,68,0.12)", color: cfg ? cfg.dot : "#ff1744", border: `1px solid ${cfg ? cfg.dot + "50" : "rgba(255,23,68,0.3)"}` }
                    : { background: "rgba(255,255,255,0.03)", color: "#475569", border: "1px solid rgba(255,23,68,0.1)" }}>
                  {s === "all" ? "All" : STATUS_META[s]?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fraud Grade Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(GRADE_META).map(([grade, { color, bg, label }]) => (
            <div key={grade} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: bg, border: `1px solid ${color}30` }}>
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>Grade {label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,23,68,0.06)", border: "1px solid rgba(255,23,68,0.15)" }}>
            <Shield className="w-3 h-3" style={{ color: "#ff1744" }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#ff1744" }}>BD Fraud Check</span>
          </div>
        </div>

        {/* Leads List */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,23,68,0.1)" }}>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <Phone className="w-10 h-10 mb-4 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-widest">No leads found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,23,68,0.05)" }}>
              {filtered.map(lead => {
                const cfg = STATUS_META[lead.status] || { label: lead.status, dot: "#64748b", bg: "rgba(100,116,139,0.1)" };
                const isExp = expanded === lead.id;
                const fraud = fraudMap[lead.id];
                const fraudGradeMeta = fraud ? GRADE_META[fraud.grade] : null;
                const FraudIcon = fraudGradeMeta?.icon || Shield;
                return (
                  <Fragment key={lead.id}>
                    <div className="flex items-center px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors gap-4"
                      onClick={() => setExpanded(isExp ? null : lead.id)}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.15)" }}>
                        <Phone className="w-4 h-4" style={{ color: "#ff1744" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-wide text-white truncate">{lead.name}</p>
                          {fraud && fraudGradeMeta && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                              style={{ background: fraudGradeMeta.bg, color: fraudGradeMeta.color, border: `1px solid ${fraudGradeMeta.color}40` }}>
                              <FraudIcon className="w-2.5 h-2.5" />Grade {fraud.grade}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-600">{lead.phone} · {lead.productInterest}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.dot, border: `1px solid ${cfg.dot}30` }}>
                        {cfg.label}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform duration-200 ${isExp ? "rotate-180" : ""}`} />
                    </div>

                    {isExp && (
                      <div className="px-5 py-5 space-y-4" style={{ background: "rgba(255,23,68,0.03)", borderTop: "1px solid rgba(255,23,68,0.06)" }}>
                        {/* Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl space-y-2 text-xs" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.08)" }}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Lead Details</p>
                            <p className="font-bold text-white">{lead.name}</p>
                            <p className="font-bold text-slate-400">{lead.phone}</p>
                            <p className="font-bold text-slate-500 leading-relaxed">{lead.address}</p>
                            <p className="font-bold" style={{ color: "#ff1744" }}>{lead.productInterest}</p>
                            {lead.message && <p className="text-slate-600 italic">"{lead.message}"</p>}
                            <p className="text-slate-700 text-[9px] uppercase tracking-widest">{new Date(lead.createdAt).toLocaleString("en-BD")}</p>
                          </div>

                          {/* Fraud Check Panel */}
                          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,23,68,0.08)" }}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">Fraud Intelligence</p>
                            {!fraud && !fraudLoading[lead.id] && (
                              <button onClick={() => checkFraud(lead)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                style={{ background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", boxShadow: "0 0 20px rgba(255,23,68,0.3)" }}>
                                <Shield className="w-4 h-4" />Run Fraud Check
                              </button>
                            )}
                            {fraudLoading[lead.id] && (
                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#ff1744" }} />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analyzing…</p>
                              </div>
                            )}
                            {fraud && fraudGradeMeta && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: fraudGradeMeta.bg, border: `1px solid ${fraudGradeMeta.color}30` }}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${fraudGradeMeta.color}20` }}>
                                    <FraudIcon className="w-5 h-5" style={{ color: fraudGradeMeta.color }} />
                                  </div>
                                  <div>
                                    <p className="font-black text-2xl leading-none" style={{ color: fraudGradeMeta.color }}>Grade {fraud.grade}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Score: {fraud.score}/100</p>
                                  </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{fraudGradeMeta.desc}</p>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{fraud.reason}</p>
                                <button onClick={() => checkFraud(lead)} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors" style={{ color: "rgba(255,23,68,0.6)" }}>
                                  <RefreshCw className="w-3 h-3" />Re-check
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Update */}
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mr-2">Update Status:</p>
                          {Object.entries(STATUS_META).map(([key, { label, dot, bg }]) => (
                            <button key={key} onClick={() => updateStatus(lead.id, key)} disabled={updating === lead.id || lead.status === key}
                              className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                              style={lead.status === key ? { background: bg, color: dot, border: `1px solid ${dot}50` } : { background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,23,68,0.1)" }}>
                              {lead.status === key && <Check className="w-3 h-3" />}
                              {updating === lead.id && lead.status !== key ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
