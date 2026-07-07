export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 prose-sm">
      <h1 className="font-display text-3xl text-canal mb-2">Privacy Policy</h1>
      <p className="text-char/50 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="text-char/70 space-y-4 text-sm">
        <p>
          <strong>Note:</strong> This is placeholder text for a working template — it is not
          legal advice. Have this reviewed by a lawyer familiar with Pakistani data protection
          and consumer law before relying on it for a live business.
        </p>

        <h2 className="font-semibold text-char mt-6">What we collect</h2>
        <p>
          Name, phone number, email (optional), delivery address, and order history — collected
          when you sign up, place an order, or contact support.
        </p>

        <h2 className="font-semibold text-char mt-6">How we use it</h2>
        <p>
          To process and deliver your orders, send order updates via SMS/WhatsApp, and improve
          our service. We do not sell your data to third parties.
        </p>

        <h2 className="font-semibold text-char mt-6">Payment information</h2>
        <p>
          Payments through JazzCash and EasyPaisa are processed directly by those providers —
          we do not store your mobile wallet PIN or full payment credentials.
        </p>

        <h2 className="font-semibold text-char mt-6">Your rights</h2>
        <p>
          You can request a copy of your data or ask us to delete your account by contacting
          support.
        </p>

        <h2 className="font-semibold text-char mt-6">Contact</h2>
        <p>Questions about this policy: reach us via the <a href="/contact" className="text-canal underline">contact page</a>.</p>
      </div>
    </div>
  );
}
