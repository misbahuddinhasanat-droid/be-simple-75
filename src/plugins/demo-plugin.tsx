import { addFilter } from "../lib/plugin-system";

const AI_INPUT_STYLE = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" };

// This plugin injects a "Material" input field into the custom attributes section
// without touching the core AdminProducts.tsx file!
addFilter('product_editor_custom_fields', (fields: React.ReactNode[], { formData, setFormData }: any) => {
  const MaterialField = (
    <div key="plugin-material" className="mt-4 p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Plugin Injected: Material</label>
        <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 uppercase">Module Active</span>
      </div>
      <input 
        value={formData.customAttributes?.material || ""} 
        onChange={e => setFormData({ 
          ...formData, 
          customAttributes: { ...formData.customAttributes, material: e.target.value } 
        })}
        placeholder="E.g. 100% Premium Cotton" 
        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-amber-500/50"
        style={AI_INPUT_STYLE} 
      />
    </div>
  );

  return [...fields, MaterialField];
});
