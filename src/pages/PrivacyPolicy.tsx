export default function PrivacyPolicy() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-32 pb-24">
      <div className="container px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-2 border-[#1f1f1f] pb-6">
          Privacy
        </h1>
        
        <div className="space-y-12 text-zinc-400 font-medium leading-relaxed">
          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">Data Collection</h2>
            <p>
              We collect your name, phone number, and address strictly for order fulfillment and customer support. Your data is never sold or shared with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">Security</h2>
            <p>
              Our platform uses industry-standard encryption to protect your personal information during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">Cookies</h2>
            <p>
              We use cookies to keep track of your shopping bag and for basic analytics to improve your experience.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
