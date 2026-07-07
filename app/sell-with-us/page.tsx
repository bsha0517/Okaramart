export default function SellWithUsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-4">Sell on Okara Mart</h1>
      <p className="text-char/70 mb-6">
        Are you a local supplier, distributor, or brand in Okara? We're always looking to
        add quality products — groceries, dairy, snacks, household goods, and more — to our
        catalog.
      </p>

      <div className="bg-white border border-canal/10 rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-2">What we look for</h2>
        <ul className="text-sm text-char/60 space-y-1 list-disc list-inside">
          <li>Reliable, consistent supply</li>
          <li>Competitive wholesale pricing</li>
          <li>Products relevant to daily household needs</li>
          <li>Ability to deliver to our Okara dark store</li>
        </ul>
      </div>

      <p className="text-char/70">
        Interested in becoming a supplier? Get in touch via our{" "}
        <a href="/contact" className="text-canal underline">contact page</a> with your business
        name, product categories, and contact details, and our team will follow up.
      </p>
    </div>
  );
}
