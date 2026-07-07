export default function CareersPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-4">Careers at Okara Mart</h1>
      <p className="text-char/70 mb-6">
        We're a local team building fast grocery delivery for Okara. As we grow, we'll
        need packers, riders, and store staff who know the city well.
      </p>

      <div className="bg-white border border-canal/10 rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-1">Riders</h2>
        <p className="text-char/60 text-sm">Deliver orders across Okara on your own bike. Flexible hours, per-delivery pay.</p>
      </div>
      <div className="bg-white border border-canal/10 rounded-xl p-5 mb-4">
        <h2 className="font-semibold mb-1">Packers</h2>
        <p className="text-char/60 text-sm">Work at our Okara dark store, picking and packing orders quickly and accurately.</p>
      </div>
      <div className="bg-white border border-canal/10 rounded-xl p-5 mb-8">
        <h2 className="font-semibold mb-1">Store management</h2>
        <p className="text-char/60 text-sm">Help run day-to-day operations, inventory, and the local team.</p>
      </div>

      <p className="text-char/70">
        Interested? Send your name, role of interest, and phone number to{" "}
        <a href="/contact" className="text-canal underline">our contact page</a>, and we'll reach out
        when a position opens up.
      </p>
    </div>
  );
}
