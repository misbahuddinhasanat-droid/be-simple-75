import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, Check, Eye, EyeOff, ExternalLink, Tag, Package, Truck, CreditCard, Zap } from "lucide-react";

const ADMIN_KEY = "besimple2024";

interface Settings {
  gtmId: string; pixelId: string; bdcourierApiKey: string;
  pathaoClientId: string; pathaoClientSecret: string;
  steadfastApiKey: string; steadfastSecretKey: string;
  uddoktapayApiKey: string; uddoktapayApiSecret: string;
}

const DEFAULT: Settings = {
  gtmId: "", pixelId: "", bdcourierApiKey: "",
  pathaoClientId: "", pathaoClientSecret: "",
  steadfastApiKey: "", steadfastSecretKey: "",
  uddoktapayApiKey: "", uddoktapayApiSecret: "",
};

function ApiSection({
  title, icon: Icon, gradient, children, docUrl, docLabel
}: {
  title: string; icon: typeof Tag; gradient: string;
  children: React.ReactNode; docUrl?: string; docLabel?: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: gradient }}>
            <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h2 className="font-black text-white text-sm tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>API Configuration</p>
          </div>
        </div>
        {docUrl && (
          <a href={docUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
            <ExternalLink className="w-3 h-3" /> {docLabel ?? "Docs"}
          </a>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, secret = false, hint
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; secret?: boolean; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const inputType = secret && !show ? "password" : "text";

  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 px-4 text-white text-sm font-medium focus:outline-none transition-all rounded-xl placeholder:font-normal"
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            paddingRight: secret ? "44px" : "16px",
          }}
          onFocus={e => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(201,162,39,0.5)";
            (e.currentTarget as HTMLInputElement).style.background = "rgba(255,255,255,0.07)";
          }}
          onBlur={e => {
            (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.09)";
            (e.currentTarget as HTMLInputElement).style.background = "rgba(255,255,255,0.05)";
          }}
        />
        {secret && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] font-medium mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>{hint}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof Settings) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { "x-admin-key": ADMIN_KEY } })
      .then(r => r.json()).then((d: Settings) => { setForm(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError("Failed to save. Please try again.");
    } catch { setError("Network error. Check connection."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4 max-w-2xl">
          {[1,2,3,4,5].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-7">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(255,255,255,0.2)" }}>Configuration</p>
            <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
            style={{
              background: saved ? "linear-gradient(135deg, #34d399, #059669)" : "linear-gradient(135deg, #c9a227, #8a6f2b)",
              color: saved ? "#fff" : "#000",
              boxShadow: saved ? "0 4px 20px rgba(52,211,153,0.3)" : "0 4px 20px rgba(201,162,39,0.25)",
            }}>
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save All"}
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-bold"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Tracking & Analytics */}
        <ApiSection title="Tracking & Analytics" icon={Tag} gradient="linear-gradient(135deg, #a78bfa, #7c3aed)"
          docUrl="https://tagmanager.google.com/" docLabel="GTM Dashboard">
          <Field label="Google Tag Manager ID" placeholder="GTM-XXXXXXX" value={form.gtmId} onChange={set("gtmId")}
            hint="Format: GTM-XXXXXXX — injected on every storefront page automatically" />
          <Field label="Meta Pixel ID" placeholder="123456789012345" value={form.pixelId} onChange={set("pixelId")}
            hint="15-digit Facebook/Meta Pixel ID for conversion tracking" />
        </ApiSection>

        {/* BD Courier */}
        <ApiSection title="BD Courier" icon={Truck} gradient="linear-gradient(135deg, #60a5fa, #2563eb)"
          docUrl="https://app.bdcourier.com/merchant/api" docLabel="BD Courier API">
          <Field label="BD Courier API Key" placeholder="Your BD Courier API key" value={form.bdcourierApiKey}
            onChange={set("bdcourierApiKey")} secret
            hint="Powers the Fraud Check button on the Leads page — checks customer cancellation history by phone number" />
        </ApiSection>

        {/* Pathao */}
        <ApiSection title="Pathao Parcel Delivery" icon={Package} gradient="linear-gradient(135deg, #34d399, #059669)"
          docUrl="https://merchant.pathao.com/api/documentation" docLabel="Pathao Docs">
          <Field label="Client ID" placeholder="pathao_client_xxxxxxxxxxxxxx" value={form.pathaoClientId}
            onChange={set("pathaoClientId")} hint="Found in your Pathao merchant developer settings" />
          <Field label="Client Secret" placeholder="pathao_secret_xxxxxxxxxxxxx" value={form.pathaoClientSecret}
            onChange={set("pathaoClientSecret")} secret hint="Keep private — never share your Pathao secret key" />
        </ApiSection>

        {/* Steadfast */}
        <ApiSection title="Steadfast Parcel Delivery" icon={Zap} gradient="linear-gradient(135deg, #fbbf24, #d97706)"
          docUrl="https://steadfast.com.bd/merchant/api-integration" docLabel="Steadfast Docs">
          <Field label="API Key" placeholder="Your Steadfast API key" value={form.steadfastApiKey}
            onChange={set("steadfastApiKey")} secret hint="Your Steadfast merchant API key" />
          <Field label="Secret Key" placeholder="Your Steadfast secret key" value={form.steadfastSecretKey}
            onChange={set("steadfastSecretKey")} secret hint="Steadfast secret key for request signing" />
        </ApiSection>

        {/* Uddokta Pay */}
        <ApiSection title="Uddokta Pay" icon={CreditCard} gradient="linear-gradient(135deg, #f472b6, #db2777)"
          docUrl="https://uddoktapay.com/api/documentation" docLabel="UddoktaPay Docs">
          <Field label="API Key" placeholder="Your UddoktaPay API key" value={form.uddoktapayApiKey}
            onChange={set("uddoktapayApiKey")} secret hint="Your UddoktaPay merchant API key" />
          <Field label="API Secret" placeholder="Your UddoktaPay API secret" value={form.uddoktapayApiSecret}
            onChange={set("uddoktapayApiSecret")} secret hint="UddoktaPay API secret for request authentication" />
        </ApiSection>

        {/* Bottom save */}
        <div className="flex justify-end pb-4">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50"
            style={{
              background: saved ? "linear-gradient(135deg, #34d399, #059669)" : "linear-gradient(135deg, #c9a227, #8a6f2b)",
              color: saved ? "#fff" : "#000",
            }}>
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save All Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
