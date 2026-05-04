import { Link } from "wouter";

export default function Contact() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-32 pb-24">
      <div className="container px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-2 border-[#1f1f1f] pb-6">
          Contact Us
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Got a question about an order, a design, or just want to talk shop? Drop us a line. We're here to help you stand out.
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Email</h3>
                <p className="text-xl font-bold">support@besimple75.com</p>
              </div>
              
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">WhatsApp</h3>
                <p className="text-xl font-bold">+880 1XXX XXXXXX</p>
              </div>
              
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Instagram</h3>
                <p className="text-xl font-bold">@besimple75bd</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#050505] border-2 border-[#1f1f1f] p-8">
            <h3 className="font-black uppercase tracking-wider text-xl mb-6">Send a Message</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full h-14 bg-[#111] border-[#1f1f1f] px-4 font-medium focus:outline-none focus:border-white transition-colors" />
              <input type="email" placeholder="Email" className="w-full h-14 bg-[#111] border-[#1f1f1f] px-4 font-medium focus:outline-none focus:border-white transition-colors" />
              <textarea placeholder="Message" rows={4} className="w-full bg-[#111] border-[#1f1f1f] p-4 font-medium focus:outline-none focus:border-white transition-colors resize-none" />
              <button className="w-full h-14 bg-[#e63329] text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
