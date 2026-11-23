import { useState, useEffect } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import LoanForm from "@/components/LoanForm"
import ResultView from "@/components/ResultView"

export default function App() {
  const [options, setOptions] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch("/api/options")
      .then((r) => r.json())
      .then(setOptions)
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-[#f5f6f7] flex flex-col">

        {/* ── SAP-style Shell Header ── */}
        <header className="bg-primary text-primary-foreground h-[2.75rem] flex items-center px-6 shrink-0 shadow-sm">
          <span className="text-base font-bold tracking-tight">CreditSense</span>
          <span className="mx-3 opacity-30 text-lg font-thin">|</span>
          <span className="text-sm opacity-80">Loan Officer Portal</span>
        </header>

        {/* ── Page Title Bar ── */}
        <div className="bg-white border-b border-border px-8 py-3 flex items-baseline gap-3 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">
            {result ? "Assessment Result" : "New Loan Application"}
          </h1>
          <span className="text-sm text-muted-foreground">
            {result ? "Credit risk evaluation" : "Application-time credit risk assessment"}
          </span>
        </div>

        {/* ── Page Body ── */}
        <main className="flex-1 px-8 py-6 max-w-[1280px] w-full mx-auto">
          {!result ? (
            options ? (
              <LoanForm options={options} onResult={setResult} />
            ) : (
              <div className="text-muted-foreground text-sm py-16 text-center">Loading…</div>
            )
          ) : (
            <ResultView result={result} onReset={() => setResult(null)} />
          )}
        </main>

      </div>
    </TooltipProvider>
  )
}
