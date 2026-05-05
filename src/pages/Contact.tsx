import { Link } from "wouter";
import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Contact() {
  const { data: settings } = useSettings();
  const { toast } = useToast();
  const info = settings?.storeInfo;
  const waUrl = info?.whatsappUrl || "#";
  const igUrl = info?.instagramUrl || "#";
  const mailAddr = info?.email || "support@besimple75.com";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "contact", name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
      toast({ title: "Received", description: "Your message has been uplinked. We will reply soon." });
      setMessage("");
    } catch {
      toast({ title: "Could not send", description: "Please try WhatsApp or email instead.", variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-28 md:pt-32 pb-24 px-4">
      <div className="container px-4 md:px-8 max-w-4xl mx-auto">
        <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-2">Be Simple 75</p>
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 border-b border-white/10 pb-6">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-16">
          <div>
            <p className="text-zinc-400 leading-relaxed mb-10 font-medium">
              Orders, sizing, collaborations, or custom prints — tap any channel below. Form messages land in our admin inbox.
            </p>

            <div className="space-y-8 text-sm md:text-base">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email</h3>
                <a href={`mailto:${mailAddr}?subject=Inquiry from Be Simple 75`} className="text-xl font-bold text-white underline-offset-4 hover:text-rose-400 hover:underline break-all">
                  {mailAddr}
                </a>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">WhatsApp</h3>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline">
                  Open chat
                </a>
                <p className="text-zinc-500 text-sm mt-1 font-medium">{info?.whatsappNumber || "—"}</p>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Instagram</h3>
                <a href={igUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-white underline-offset-4 hover:text-rose-400 hover:underline">
                  {info?.instagramHandle
                    ? info.instagramHandle.startsWith("@")
                      ? info.instagramHandle
                      : `@${info.instagramHandle}`
                    : igUrl.replace(/^https:\/\//, "")}
                </a>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/faq"><span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">FAQs</span></Link>
                <Link href="/track-order"><span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">Track order</span></Link>
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 md:p-10">
            <h3 className="font-black uppercase tracking-wider text-xl mb-2">Send a message</h3>
            <p className="text-[11px] text-zinc-500 font-medium mb-6">Saved contacts autofill — no need to type from scratch.</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-14 bg-[#111] border border-[#282828] rounded-xl px-4 font-medium outline-none focus:border-rose-500 transition-colors placeholder:text-zinc-600 text-white"
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 bg-[#111] border border-[#282828] rounded-xl px-4 font-medium outline-none focus:border-rose-500 transition-colors placeholder:text-zinc-600 text-white"
              />
              <textarea
                name="message"
                autoComplete="off"
                placeholder="How can we help?"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-[#111] border border-[#282828] rounded-xl p-4 font-medium outline-none focus:border-rose-500 resize-none placeholder:text-zinc-600 text-white"
              />

              <button type="submit" disabled={sending} className="w-full h-14 rounded-xl bg-[#e63329] text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Send message
              </button>

              {sent && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-center text-emerald-500">
                  Your message uploaded — we're on it.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
