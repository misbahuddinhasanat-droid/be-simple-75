export default function ReturnPolicy() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-32 pb-24">
      <div className="container px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 border-b-2 border-[#1f1f1f] pb-6">
          Returns
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-12 text-zinc-400 font-medium leading-relaxed">
          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">7-Day Return Policy</h2>
            <p>
              We want you to love your gear. If you're not satisfied, you can return or exchange any unworn, unwashed item with original tags within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">Custom Orders</h2>
            <p className="border-l-4 border-[#e63329] pl-6 py-2 bg-[#e63329]/5 text-white">
              Important: Custom designs created in the Studio are unique to you. We cannot accept returns on custom pieces unless there is a manufacturing defect or printing error.
            </p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase tracking-wider text-2xl mb-4">How to Return</h2>
            <ol className="list-decimal list-inside space-y-4">
              <li>Contact our support team via WhatsApp or Email.</li>
              <li>Provide your Order ID and photos of the item.</li>
              <li>Once approved, send the item back to our hub in Dhaka.</li>
              <li>We will process your refund or exchange within 3-5 business days of receiving the item.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
