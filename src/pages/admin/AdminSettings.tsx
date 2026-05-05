import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Check, Eye, EyeOff, Zap, Tag, Truck, CreditCard, Bell, BarChart3, ExternalLink } from "lucide-react";

const ADMIN_KEY = "Besimple90@@";

interface Settings {
  gtmId: string; pixelId: string; tiktokPixelId: string; ga4MeasurementId: string;
  bdcourierApiKey: string; pathaoClientId: string; pathaoClientSecret: string;
  steadfastApiKey: string; steadfastSecretKey: string; oneclickApiKey: string;
  uddoktapayApiKey: string; uddoktapayApiSecret: string; sslcommerzStoreId: string; sslcommerzPassword: string; bkashApiKey: string;
  whatsappNumber: string; smsApiKey: string;
  instagramUrl: string; facebookUrl: string; twitterUrl: string; tiktokUrl: string;
}

const EMPTY: Settings = {
  gtmId: "", pixelId: "", tiktokPixelId: "", ga4MeasurementId: "",
  bdcourierApiKey: "", pathaoClientId: "", pathaoClientSecret: "",
  steadfastApiKey: "", steadfastSecretKey: "", oneclickApiKey: "",
  uddoktapayApiKey: "", uddoktapayApiSecret: "", sslcommerzStoreId: "", sslcommerzPassword: "", bkashApiKey: "",
  whatsappNumber: "", smsApiKey: "",
  instagramUrl: "", facebookUrl: "", twitterUrl: "", tiktokUrl: "",
};

const AI_INPUT = "w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-transparent outline-none transition-all";
const AI_INPUT_STYLE = { background: "rgba(255,23,68,0.04)", border: "1px solid rgba(255,23,68,0.15)" };
const AI_INPUT_FOCUS: React.CSSProperties = { borderColor: "rgba(255,23,68,0.4)", boxShadow: "0 0 16px rgba(255,23,68,0.1)" };

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Enter API key…"}
        className={`${AI_INPUT} pr-10`}
        style={{ ...AI_INPUT_STYLE, ...(focused ? AI_INPUT_FOCUS : {}) }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function PlainInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Enter value…"}
      className={AI_INPUT}
      style={{ ...AI_INPUT_STYLE, ...(focused ? AI_INPUT_FOCUS : {}) }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

interface IntegrationCardProps {
  name: string; description: string; docsUrl?: string; color: string;
  fields: { label: string; key: keyof Settings; secret?: boolean; placeholder?: string }[];
  settings: Settings; onChange: (key: keyof Settings, value: string) => void; onSave: () => void; saving: boolean; saved: boolean;
}

function IntegrationCard({ name, description, docsUrl, color, fields, settings, onChange, onSave, saving, saved }: IntegrationCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-200" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${color}12` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Zap className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-white">{name}</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{description}</p>
        </div>
        {docsUrl && (
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <div className="p-5 space-y-3">
        {fields.map(({ label, key, secret, placeholder }) => (
          <div key={key}>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">{label}</label>
            {secret
              ? <SecretInput value={settings[key]} onChange={v => onChange(key, v)} placeholder={placeholder} />
              : <PlainInput value={settings[key]} onChange={v => onChange(key, v)} placeholder={placeholder} />}
          </div>
        ))}
        <button onClick={onSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60 mt-4"
          style={saved
            ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
            : { background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "white", boxShadow: `0 0 20px ${color}40` }}>
          {saved ? <><Check className="w-3.5 h-3.5" />Saved!</> : saving ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>Saving…</> : <><Save className="w-3.5 h-3.5" />Save {name}</>}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [savedGroup, setSavedGroup]   = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/admin/settings", { headers: { "X-Admin-Key": ADMIN_KEY } });
        const data = await res.json();
        // Map all keys correctly
        const mapped: Partial<Settings> = {
          gtmId: data.gtmId,
          pixelId: data.pixelId,
          tiktokPixelId: data.tiktokPixelId,
          ga4MeasurementId: data.ga4MeasurementId,
          bdcourierApiKey: data.bdcourierApiKey,
          pathaoClientId: data.pathaoClientId,
          pathaoClientSecret: data.pathaoClientSecret,
          steadfastApiKey: data.steadfastApiKey,
          steadfastSecretKey: data.steadfastSecretKey,
          oneclickApiKey: data.oneclickApiKey,
          uddoktapayApiKey: data.uddoktapayApiKey,
          uddoktapayApiSecret: data.uddoktapayApiSecret,
          sslcommerzStoreId: data.sslcommerzStoreId,
          sslcommerzPassword: data.sslcommerzPassword,
          bkashApiKey: data.bkashApiKey,
          whatsappNumber: data.whatsappNumber || data.siWhatsappNumber,
          smsApiKey: data.smsApiKey,
          instagramUrl: data.instagramUrl || data.siInstagramUrl,
          facebookUrl: data.facebookUrl || data.siFacebookUrl,
          twitterUrl: data.twitterUrl,
          tiktokUrl: data.tiktokUrl,
        };
        setSettings(prev => ({ ...prev, ...mapped }));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch_();
  }, []);

  const handleChange = (key: keyof Settings, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const saveGroup = async (groupId: string, keys: (keyof Settings)[]) => {
    setSavingGroup(groupId);
    try {
      const body: Partial<Settings> = {};
      keys.forEach(k => { body[k] = settings[k]; });
      await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY }, body: JSON.stringify(body) });
      setSavedGroup(groupId);
      setTimeout(() => setSavedGroup(null), 2500);
    } catch { /* silent */ }
    setSavingGroup(null);
  };

  const INTEGRATIONS = [
    {
      section: "Analytics & Tracking",
      sectionIcon: BarChart3,
      sectionColor: "#60a5fa",
      cards: [
        { id: "gtm", name: "Google Tag Manager", description: "GTM Container ID", docsUrl: "https://tagmanager.google.com", color: "#4285f4", fields: [{ label: "Container ID", key: "gtmId" as keyof Settings, placeholder: "GTM-XXXXXXX" }] },
        { id: "pixel", name: "Meta Pixel", description: "Facebook / Instagram Ads", docsUrl: "https://business.facebook.com/events_manager", color: "#1877f2", fields: [{ label: "Pixel ID", key: "pixelId" as keyof Settings, placeholder: "123456789012345" }] },
        { id: "tiktok", name: "TikTok Pixel", description: "TikTok Ads Attribution", color: "#fe2c55", fields: [{ label: "Pixel ID", key: "tiktokPixelId" as keyof Settings, placeholder: "C1234ABCD..." }] },
        { id: "ga4", name: "Google Analytics 4", description: "GA4 Measurement ID", color: "#e8710a", fields: [{ label: "Measurement ID", key: "ga4MeasurementId" as keyof Settings, placeholder: "G-XXXXXXXXXX" }] },
      ],
    },
    {
      section: "Delivery Couriers",
      sectionIcon: Truck,
      sectionColor: "#f59e0b",
      cards: [
        { id: "bdcourier", name: "BD Courier", description: "Fraud Check + Delivery", color: "#22c55e", fields: [{ label: "API Key", key: "bdcourierApiKey" as keyof Settings, secret: true, placeholder: "bdcourier_key_..." }] },
        { id: "steadfast", name: "Steadfast Courier", description: "COD Delivery Bangladesh", docsUrl: "https://steadfast.com.bd", color: "#f59e0b", fields: [{ label: "API Key", key: "steadfastApiKey" as keyof Settings, secret: true }, { label: "Secret Key", key: "steadfastSecretKey" as keyof Settings, secret: true }] },
        { id: "pathao", name: "Pathao", description: "Pathao Last Mile Delivery", docsUrl: "https://merchant.pathao.com", color: "#ef4444", fields: [{ label: "Client ID", key: "pathaoClientId" as keyof Settings, placeholder: "pathao-..." }, { label: "Client Secret", key: "pathaoClientSecret" as keyof Settings, secret: true }] },
        { id: "oneclick", name: "One Click Delivery", description: "One Click BD Logistics", color: "#8b5cf6", fields: [{ label: "API Key", key: "oneclickApiKey" as keyof Settings, secret: true, placeholder: "oneclick_..." }] },
      ],
    },
    {
      section: "Payment Gateways",
      sectionIcon: CreditCard,
      sectionColor: "#a78bfa",
      cards: [
        { id: "uddoktapay", name: "Uddokta Pay", description: "Mobile Payment Gateway BD", color: "#ff6b35", fields: [{ label: "API Key", key: "uddoktapayApiKey" as keyof Settings, secret: true }, { label: "API Secret", key: "uddoktapayApiSecret" as keyof Settings, secret: true }] },
        { id: "sslcommerz", name: "SSLCommerz", description: "Card & Mobile Banking BD", docsUrl: "https://sslcommerz.com", color: "#1a73e8", fields: [{ label: "Store ID", key: "sslcommerzStoreId" as keyof Settings, placeholder: "yourstore123" }, { label: "Store Password", key: "sslcommerzPassword" as keyof Settings, secret: true }] },
        { id: "bkash", name: "bKash Payment", description: "bKash API Integration", color: "#e2136e", fields: [{ label: "API Key", key: "bkashApiKey" as keyof Settings, secret: true, placeholder: "bkash_api_..." }] },
      ],
    },
    {
      section: "Notifications",
      sectionIcon: Bell,
      sectionColor: "#34d399",
      cards: [
        { id: "whatsapp", name: "WhatsApp Business", description: "Customer Notifications", color: "#25d366", fields: [{ label: "WhatsApp Number", key: "whatsappNumber" as keyof Settings, placeholder: "+880 1XXXXXXXXX" }] },
        { id: "sms", name: "SMS Gateway", description: "BD SMS API Integration", color: "#f59e0b", fields: [{ label: "SMS API Key", key: "smsApiKey" as keyof Settings, secret: true, placeholder: "sms_key_..." }] },
      ],
    },
    {
      section: "Social Media Links",
      sectionIcon: ExternalLink,
      sectionColor: "#ff1744",
      cards: [
        { id: "socials", name: "Official Socials", description: "Public links in footer", color: "#ff1744", fields: [
          { label: "Instagram URL", key: "instagramUrl" as keyof Settings, placeholder: "https://instagram.com/..." },
          { label: "Facebook URL", key: "facebookUrl" as keyof Settings, placeholder: "https://facebook.com/..." },
          { label: "Twitter URL", key: "twitterUrl" as keyof Settings, placeholder: "https://twitter.com/..." },
          { label: "TikTok URL", key: "tiktokUrl" as keyof Settings, placeholder: "https://tiktok.com/..." },
        ]},
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-10">
        <div>
          <h1 className="font-black text-3xl uppercase tracking-tight text-white">Integrations</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1">API Keys &amp; Third-party Connections</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        ) : (
          <div className="space-y-8">
            {INTEGRATIONS.map(({ section, sectionIcon: SectionIcon, sectionColor, cards }) => (
              <div key={section}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${sectionColor}15`, border: `1px solid ${sectionColor}25` }}>
                    <SectionIcon className="w-3.5 h-3.5" style={{ color: sectionColor }} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: sectionColor }}>{section}</p>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${sectionColor}30, transparent)` }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map(card => (
                    <IntegrationCard
                      key={card.id}
                      name={card.name}
                      description={card.description}
                      docsUrl={card.docsUrl}
                      color={card.color}
                      fields={card.fields}
                      settings={settings}
                      onChange={handleChange}
                      onSave={() => saveGroup(card.id, card.fields.map(f => f.key))}
                      saving={savingGroup === card.id}
                      saved={savedGroup === card.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save All */}
        <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(255,23,68,0.1)" }}>
          <button onClick={() => saveGroup("all", Object.keys(EMPTY) as (keyof Settings)[])}
            disabled={!!savingGroup}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-60"
            style={savedGroup === "all"
              ? { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }
              : { background: "linear-gradient(135deg, #ff1744, #ff4500)", color: "white", boxShadow: "0 0 24px rgba(255,23,68,0.35)" }}>
            {savedGroup === "all" ? <><Check className="w-4 h-4" />All Saved!</> : savingGroup === "all" ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>Saving…</> : <><Save className="w-4 h-4" />Save All Integrations</>}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
