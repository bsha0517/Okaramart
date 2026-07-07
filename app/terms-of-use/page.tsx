export default function TermsOfUsePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-2">Terms of Use</h1>
      <p className="text-char/50 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="text-char/70 space-y-4 text-sm">
        <p>
          <strong>Note:</strong> This is placeholder text for a working template — it is not
          legal advice. Have this reviewed by a lawyer before relying on it for a live business.
        </p>

        <h2 className="font-semibold text-char mt-6">Service area</h2>
        <p>Okara Mart delivers within Okara city only. Availability and delivery times vary by area.</p>

        <h2 className="font-semibold text-char mt-6">Orders and payment</h2>
        <p>
          Orders are confirmed once payment is verified (JazzCash/EasyPaisa) or accepted
          (Cash on Delivery). Prices and stock availability may change without notice.
        </p>

        <h2 className="font-semibold text-char mt-6">Cancellations and returns</h2>
        <p>
          Orders may be cancelled before packing begins. Damaged, missing, or incorrect items
          can be reported to support for a replacement or refund.
        </p>

        <h2 className="font-semibold text-char mt-6">Account responsibility</h2>
        <p>You're responsible for keeping your account and delivery address information accurate.</p>

        <h2 className="font-semibold text-char mt-6">Limitation of liability</h2>
        <p>
          Okara Mart is not liable for delays caused by circumstances outside our control,
          including weather, traffic, or force majeure events.
        </p>

        <h2 className="font-semibold text-char mt-6">Contact</h2>
        <p>Questions about these terms: reach us via the <a href="/contact" className="text-canal underline">contact page</a>.</p>
      </div>
    </div>
  );
}
