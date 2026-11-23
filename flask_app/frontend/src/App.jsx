import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <div className="app-shell bg-[#f5f6f7] flex flex-col">

        {/* ── SAP-style Shell Header ── */}
        <header className="bg-primary text-primary-foreground h-16 flex items-center px-4 sm:px-6 shrink-0 shadow-sm">
          <img src="/eab-credit-logo.png" alt="EAB Credit" className="h-12 w-20 object-contain shrink-0" />
          <span aria-hidden="true" className="mx-4 sm:mx-6 h-8 w-px bg-white/25 shrink-0" />
          <span className="min-w-0 text-lg sm:text-2xl font-semibold tracking-tight leading-tight text-white">Loan Officer Portal</span>
        </header>

        {/* ── Page Title Bar ── */}
        <div className="bg-white border-b border-border px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <h1 className="text-xl font-semibold text-foreground">
            {result ? "Assessment Result" : "New Loan Application"}
          </h1>
          {result && (
            <Button type="button" onClick={() => setResult(null)} className="h-10 gap-2 text-base font-bold">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> New Assessment
            </Button>
          )}
        </div>

        {/* ── Page Body ── */}
        <main className="app-body">
          {!result ? (
            options ? (
              <LoanForm options={options} onResult={setResult} />
            ) : (
              <div className="text-muted-foreground text-sm py-16 text-center">Loading…</div>
            )
          ) : (
            <div className="result-scroll" role="region" aria-label="Assessment result" tabIndex={0}>
              <ResultView result={result} />
            </div>
          )}
        </main>

      </div>
    </TooltipProvider>
  )
}
