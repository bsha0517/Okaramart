const VALUE_PROPS = [
  { icon: "✓", label: "Cash on Delivery available" },
  { icon: "✓", label: "JazzCash & EasyPaisa accepted" },
  { icon: "✓", label: "Local Okara riders" },
];

export default function ValuePropStrip() {
  return (
    <section className="mb-8 flex flex-wrap gap-3">
      {VALUE_PROPS.map((v, i) => (
        <div key={i} className="flex items-center gap-2 bg-canal/5 rounded-full px-3 py-1.5 text-sm text-canal font-medium">
          <span className="w-4 h-4 rounded-full bg-canal text-husk text-[10px] flex items-center justify-center font-bold">{v.icon}</span>
          {v.label}
        </div>
      ))}
    </section>
  );
}
