const steps = [
  "Agent A",
  "Agreement",
  "Evidence",
  "Consensus",
  "Settlement",
  "Trust Score",
];

export function FlowDiagram() {
  return (
    <div className="glass overflow-hidden rounded-2xl p-5 md:p-8">
      <div className="mb-6 text-xs uppercase tracking-[0.2em] text-mist-400">Autonomous settlement path</div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 md:flex-1">
            <div className="flow-dot flex min-w-0 flex-1 flex-col items-start gap-2 md:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent hairline">
                {index + 1}
              </div>
              <div className="text-sm text-mist-100">{step}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-1 hidden h-px flex-1 bg-gradient-to-r from-accent/70 to-signal/40 md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
