export default function CustomerSupportPage() {
  const faqs = [
    { q: "Where do you deliver?", a: "Okara city only — check the Delivery Areas page for exact coverage and fees." },
    { q: "What payment methods do you accept?", a: "JazzCash, EasyPaisa, and Cash on Delivery." },
    { q: "How do I track my order?", a: "Log in and check My Account for live order status, from placed to delivered." },
    { q: "Can I cancel an order?", a: "Contact us as soon as possible — orders already packed or out for delivery may not be cancellable." },
    { q: "What if an item is missing or wrong?", a: "Message us on WhatsApp with your order number and we'll sort it out quickly." },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-2">Customer support</h1>
      <p className="text-char/70 mb-8">
        Common questions below — for anything else, reach us directly on{" "}
        <a href="/contact" className="text-canal underline">the contact page</a> or via WhatsApp.
      </p>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white border border-canal/10 rounded-xl p-4">
            <p className="font-medium mb-1">{f.q}</p>
            <p className="text-char/60 text-sm">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
