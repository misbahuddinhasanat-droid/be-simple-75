import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Headset } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hey! 👋 I'm your Be Simple Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [shifted, setShifted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useSettings();

  useEffect(() => {
    const handler = (e: any) => setShifted(e.detail);
    window.addEventListener("sticky-bar", handler);
    return () => window.removeEventListener("sticky-bar", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    const currentMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: currentMessages.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
          }))
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: "ai", content: data.content }]);
      } else {
        throw new Error("No content");
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "I'm having a bit of trouble connecting to my brain. Please try again or talk to a human! 😅" }]);
    }
    setLoading(false);
  };

  const talkToHuman = () => {
    const whatsappUrl = settings?.storeInfo?.whatsappUrl;
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
      setIsOpen(false);
    } else {
      alert("WhatsApp support is currently unavailable.");
    }
  };

  return (
    <div className={`fixed left-8 md:left-6 z-50 transition-all duration-300 ${shifted ? 'bottom-[100px]' : 'bottom-32'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originX: 0, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 left-0 w-[350px] max-w-[90vw] h-[500px] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ background: "#0f172a", border: "1px solid rgba(255,23,68,0.2)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#1e293b]/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Online & Learning</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-[#050508]/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] font-medium leading-relaxed ${
                    m.role === "user" 
                    ? 'bg-rose-600 text-white rounded-tr-none shadow-lg shadow-rose-900/20' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                    <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-4 py-2 bg-[#1e293b]/30 border-t border-white/5">
              <button onClick={talkToHuman} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10 group/btn">
                <Headset className="w-4 h-4 text-rose-500 group-hover/btn:scale-110 transition-transform" /> Talk to Human Agent
              </button>
            </div>

            {/* Input */}
            <div className="p-4 pt-2 bg-[#0f172a]">
              <div className="relative">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type your question..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-sm font-medium text-white outline-none focus:border-rose-500/50 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-rose-500 hover:text-rose-400 disabled:opacity-30 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[8px] text-center text-slate-600 mt-2 uppercase tracking-widest font-bold">Powered by Be Simple AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 text-white shadow-[0_0_20px_rgba(255,23,68,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
          </span>
        )}
      </button>
    </div>
  );
}
