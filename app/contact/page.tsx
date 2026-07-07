export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-4">Contact us</h1>
      <p className="text-char/70 mb-8">
        Questions about an order, delivery, or anything else — we're here to help.
      </p>

      <div className="space-y-4">
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <p className="font-medium mb-1">WhatsApp</p>
          <p className="text-char/60 text-sm">Fastest way to reach us — tap the WhatsApp icon in the corner of any page.</p>
        </div>
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <p className="font-medium mb-1">Phone</p>
          <p className="text-char/60 text-sm">0300-0000000 (9am – 10pm, every day)</p>
        </div>
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <p className="font-medium mb-1">Email</p>
          <p className="text-char/60 text-sm">support@okaramart.pk</p>
        </div>
        <div className="bg-white border border-canal/10 rounded-xl p-4">
          <p className="font-medium mb-1">Delivery area</p>
          <p className="text-char/60 text-sm">We currently deliver within Okara city only.</p>
        </div>
      </div>
    </div>
  );
}
