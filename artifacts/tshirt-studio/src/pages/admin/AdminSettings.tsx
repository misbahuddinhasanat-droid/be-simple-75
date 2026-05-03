import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Settings, Check, ExternalLink } from "lucide-react";

const ADMIN_KEY = "besimple2024";

interface SettingsData {
  gtmId: string;
  pixelId: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>({ gtmId: "", pixelId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SettingsData>({ gtmId: "", pixelId: "" });

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { "x-admin-key": ADMIN_KEY } })
      .then((r) => r.json())
      .then((d: SettingsData) => {
        setSettings(d);
        setForm(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
        body: JSON.stringify({ gtmId: form.gtmId, pixelId: form.pixelId }),
      });
      if (res.ok) {
        const updated = await res.json() as SettingsData;
        setSettings(updated);
        setForm(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const isDirty = form.gtmId !== settings.gtmId || form.pixelId !== settings.pixelId;

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="font-black uppercase tracking-tight text-white text-3xl">Settings</h1>
          <p className="text-[#7a8a99] text-xs font-bold uppercase tracking-widest mt-1">Tracking & analytics configuration</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => <div key={i} className="h-24 bg-[#0d1b2a] border border-[#1a2840] animate-pulse rounded-sm" />)}
          </div>
        ) : (
          <>
            {/* GTM Card */}
            <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a2840] flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#b8973a]" />
                <div>
                  <h2 className="font-black uppercase tracking-wider text-white text-sm">Google Tag Manager</h2>
                  <p className="text-[#7a8a99] text-[10px]">Dynamically injects GTM into the storefront</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#7a8a99] mb-2">
                    GTM Container ID
                  </label>
                  <input
                    value={form.gtmId}
                    onChange={(e) => setForm(f => ({ ...f, gtmId: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                    className="w-full h-12 bg-[#111f33] border border-[#1a2840] px-4 text-white font-bold text-sm font-mono focus:outline-none focus:border-[#b8973a] transition-colors placeholder:text-[#4a5568]"
                  />
                  <p className="text-[#4a5568] text-[10px] mt-2">
                    Find this in your{" "}
                    <a href="https://tagmanager.google.com" target="_blank" rel="noreferrer" className="text-[#b8973a] hover:underline inline-flex items-center gap-0.5">
                      GTM account <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {" "}— looks like GTM-XXXXXXX
                  </p>
                </div>

                {form.gtmId && (
                  <div className={`px-3 py-2 border rounded-sm text-[11px] font-bold ${
                    /^GTM-[A-Z0-9]+$/.test(form.gtmId)
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {/^GTM-[A-Z0-9]+$/.test(form.gtmId)
                      ? `✓ Valid format — will inject GTM ${form.gtmId} on all pages`
                      : "✗ Must start with GTM- followed by letters and numbers"}
                  </div>
                )}
              </div>
            </div>

            {/* Meta Pixel Card */}
            <div className="bg-[#0d1b2a] border border-[#1a2840] rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a2840] flex items-center gap-3">
                <div className="w-4 h-4 bg-[#1877F2] rounded-sm flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-[8px]">f</span>
                </div>
                <div>
                  <h2 className="font-black uppercase tracking-wider text-white text-sm">Meta Pixel (Facebook)</h2>
                  <p className="text-[#7a8a99] text-[10px]">Tracks PageView and conversion events for Facebook Ads</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#7a8a99] mb-2">
                    Pixel ID
                  </label>
                  <input
                    value={form.pixelId}
                    onChange={(e) => setForm(f => ({ ...f, pixelId: e.target.value }))}
                    placeholder="123456789012345"
                    className="w-full h-12 bg-[#111f33] border border-[#1a2840] px-4 text-white font-bold text-sm font-mono focus:outline-none focus:border-[#b8973a] transition-colors placeholder:text-[#4a5568]"
                  />
                  <p className="text-[#4a5568] text-[10px] mt-2">
                    Find this in{" "}
                    <a href="https://business.facebook.com/events_manager" target="_blank" rel="noreferrer" className="text-[#b8973a] hover:underline inline-flex items-center gap-0.5">
                      Meta Events Manager <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {" "}— a 15-digit number
                  </p>
                </div>

                {form.pixelId && (
                  <div className={`px-3 py-2 border rounded-sm text-[11px] font-bold ${
                    /^\d{10,16}$/.test(form.pixelId)
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}>
                    {/^\d{10,16}$/.test(form.pixelId)
                      ? `✓ Valid Pixel ID — will fire PageView on all pages`
                      : "✗ Pixel ID should be 10–16 digits only"}
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#111f33]/50 border border-[#1a2840] rounded-sm p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b8973a] mb-3">How it works</p>
              <ul className="space-y-1.5 text-[#7a8a99] text-xs font-medium">
                <li>• GTM and Pixel IDs are saved to the database — no redeploy needed</li>
                <li>• Scripts load automatically on every page when a valid ID is set</li>
                <li>• Leave blank to disable a tracker without breaking anything</li>
                <li>• Changes take effect on the next page load / refresh</li>
              </ul>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-8 py-3 bg-[#b8973a] hover:bg-[#d4af6a] text-[#0a1628] font-black uppercase tracking-widest text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>Saving...</>
                ) : saved ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : (
                  "Save Settings"
                )}
              </button>
              {saved && (
                <p className="text-green-400 text-xs font-black uppercase tracking-widest">Changes applied — refresh storefront to activate</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
