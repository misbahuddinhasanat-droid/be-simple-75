import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Check, Phone, Instagram, Facebook, Mail, FileText } from "lucide-react";

const ADMIN_KEY = "Besimple90@@";

interface StoreInfo {
  siWhatsappNumber: string;
  siWhatsappUrl: string;
  siInstagramHandle: string;
  siInstagramUrl: string;
  siFacebookUrl: string;
  siEmail: string;
  siPolicyDelivery: string;
  siPolicyPayment: string;
  siHeroTitle: string;
  siHeroSubtitle: string;
  bdcourierApiKey?: string;
  siAiKnowledgeBase?: string;
  siMessengerUrl?: string;
}

const EMPTY: StoreInfo = {
  siWhatsappNumber: "",
  siWhatsappUrl: "",
  siInstagramHandle: "",
  siInstagramUrl: "",
  siFacebookUrl: "",
  siEmail: "",
  siPolicyReturn: "",
  siPolicyDelivery: "",
  siPolicyPayment: "",
  siHeroTitle: "",
  siHeroSubtitle: "",
  bdcourierApiKey: "",
  siAiKnowledgeBase: "",
  siMessengerUrl: "",
};

const AI_INPUT = "w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-transparent outline-none transition-all";
const AI_STYLE: React.CSSProperties = { background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)" };
const AI_FOCUS: React.CSSProperties = { borderColor: "rgba(255,23,68,0.4)", boxShadow: "0 0 16px rgba(255,23,68,0.1)" };

function Field({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={AI_INPUT}
        style={{ ...AI_STYLE, ...(focused ? AI_FOCUS : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <p className="text-[9px] text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

interface SectionCardProps {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

function SectionCard({ title, color, icon, children, onSave, saving, saved }: SectionCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${color}12` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          {icon}
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-white flex-1">{title}</p>
      </div>
      <div className="p-5 space-y-3">
        {children}
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60 mt-4"
          style={saved
            ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
            : { background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white", boxShadow: `0 0 20px ${color}40` }}>
          {saved
            ? <><Check className="w-3.5 h-3.5" />Saved!</>
            : saving
            ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>Saving…</>
            : <><Save className="w-3.5 h-3.5" />Save</>}
        </button>
      </div>
    </div>
  );
}

export default function AdminStoreInfo() {
  const [info, setInfo] = useState<StoreInfo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { "X-Admin-Key": ADMIN_KEY } })
      .then(r => r.json())
      .then((data: Partial<StoreInfo>) => setInfo(prev => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof StoreInfo) => (v: string) => setInfo(prev => ({ ...prev, [key]: v }));

  const save = async (id: string, keys: (keyof StoreInfo)[]) => {
    setSavingId(id);
    try {
      const body: Partial<StoreInfo> = {};
      keys.forEach(k => { body[k] = info[k]; });
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify(body),
      });
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    } catch { /* silent */ }
    setSavingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="font-black text-3xl uppercase tracking-tight text-white">Store Info</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">
            Contact links &amp; policies shown on the mobile app
          </p>
        </div>

        {/* Live preview hint */}
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(255,23,68,0.06)", border: "1px solid rgba(255,23,68,0.15)" }}>
          <span className="text-red-400 mt-0.5 flex-shrink-0">ℹ</span>
          <p className="text-xs text-slate-400">
            Changes here update the <strong className="text-white">About tab</strong> of the mobile app instantly — WhatsApp button, social links, and store policies are all pulled live from the database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Homepage Message */}
          <div className="md:col-span-2">
            <SectionCard id="homepage" title="Homepage Message" color="#a855f7" icon={<FileText className="w-4 h-4" style={{ color: "#a855f7" }} />}
              onSave={() => save("homepage", ["siHeroTitle", "siHeroSubtitle"])}
              saving={savingId === "homepage"} saved={savedId === "homepage"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Hero Title (Use \n for new lines)</label>
                  <textarea rows={4} value={info.siHeroTitle} onChange={e => set("siHeroTitle")(e.target.value)} placeholder="Wear\nLouder.\nLive\nBolder."
                    className={`${AI_INPUT} resize-none`} style={{ background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)" }} />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Hero Subtitle</label>
                  <textarea rows={4} value={info.siHeroSubtitle} onChange={e => set("siHeroSubtitle")(e.target.value)} placeholder="Premium streetwear that hits different..."
                    className={`${AI_INPUT} resize-none`} style={{ background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)" }} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Integrations */}
          <div className="md:col-span-2">
            <SectionCard id="integrations" title="API & AI Integrations" color="#3b82f6" icon={<FileText className="w-4 h-4" style={{ color: "#3b82f6" }} />}
              onSave={() => save("integrations", ["bdcourierApiKey", "siAiKnowledgeBase", "siMessengerUrl"])}
              saving={savingId === "integrations"} saved={savedId === "integrations"}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="BD Courier API Key" value={info.bdcourierApiKey || ""} onChange={set("bdcourierApiKey")} placeholder="e.g. GHOJIzF5vh3RY..." />
                  <Field label="FB Messenger URL" value={info.siMessengerUrl || ""} onChange={set("siMessengerUrl")} placeholder="e.g. m.me/besimple75" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">AI Agent Training Data (Knowledge Base)</h3>
                  <textarea value={info.siAiKnowledgeBase || ""} onChange={e => set("siAiKnowledgeBase")(e.target.value)}
                    className="w-full h-48 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-transparent outline-none transition-all"
                    style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}
                    placeholder="Paste your store policies, shipping info, FAQs, and product details here for the AI to learn..." />
                  <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">This data is used by the AI Agent to answer customer queries.</p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* WhatsApp */}
          <SectionCard id="whatsapp" title="WhatsApp" color="#25d366" icon={<Phone className="w-4 h-4" style={{ color: "#25d366" }} />}
            onSave={() => save("whatsapp", ["siWhatsappNumber", "siWhatsappUrl"])}
            saving={savingId === "whatsapp"} saved={savedId === "whatsapp"}>
            <Field label="Display Number" value={info.siWhatsappNumber} onChange={set("siWhatsappNumber")} placeholder="+880 1XXXXXXXXX" />
            <Field label="WhatsApp Link (wa.me URL)" value={info.siWhatsappUrl} onChange={set("siWhatsappUrl")}
              placeholder="https://wa.me/8801XXXXXXXXX" hint="Format: https://wa.me/<number without +>" />
          </SectionCard>

          {/* Instagram */}
          <SectionCard id="instagram" title="Instagram" color="#e1306c" icon={<Instagram className="w-4 h-4" style={{ color: "#e1306c" }} />}
            onSave={() => save("instagram", ["siInstagramHandle", "siInstagramUrl"])}
            saving={savingId === "instagram"} saved={savedId === "instagram"}>
            <Field label="Handle (shown in app)" value={info.siInstagramHandle} onChange={set("siInstagramHandle")} placeholder="@besimple75bd" />
            <Field label="Profile URL" value={info.siInstagramUrl} onChange={set("siInstagramUrl")} placeholder="https://instagram.com/besimple75bd" />
          </SectionCard>

          {/* Facebook */}
          <SectionCard id="facebook" title="Facebook" color="#1877f2" icon={<Facebook className="w-4 h-4" style={{ color: "#1877f2" }} />}
            onSave={() => save("facebook", ["siFacebookUrl"])}
            saving={savingId === "facebook"} saved={savedId === "facebook"}>
            <Field label="Page URL" value={info.siFacebookUrl} onChange={set("siFacebookUrl")} placeholder="https://facebook.com/besimple75" />
          </SectionCard>

          {/* Email */}
          <SectionCard id="email" title="Email / Contact" color="#ff1744" icon={<Mail className="w-4 h-4" style={{ color: "#ff1744" }} />}
            onSave={() => save("email", ["siEmail"])}
            saving={savingId === "email"} saved={savedId === "email"}>
            <Field label="Support Email" value={info.siEmail} onChange={set("siEmail")} placeholder="support@besimple75.com" />
          </SectionCard>

          {/* Policies */}
          <div className="md:col-span-2">
            <SectionCard id="policies" title="Store Policies" color="#f59e0b" icon={<FileText className="w-4 h-4" style={{ color: "#f59e0b" }} />}
              onSave={() => save("policies", ["siPolicyReturn", "siPolicyDelivery", "siPolicyPayment"])}
              saving={savingId === "policies"} saved={savedId === "policies"}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Return Policy" value={info.siPolicyReturn} onChange={set("siPolicyReturn")} placeholder="7-day return on unworn items" />
                <Field label="Delivery Info" value={info.siPolicyDelivery} onChange={set("siPolicyDelivery")} placeholder="Dhaka: 1-2 days · Outside: 3-5 days" />
                <Field label="Payment Method" value={info.siPolicyPayment} onChange={set("siPolicyPayment")} placeholder="Cash on Delivery (COD)" />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
