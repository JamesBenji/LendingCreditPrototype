import { TriangleAlert, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// ── SAP-style section panel (reused from LoanForm pattern) ───────────────────
function Section({ title, children, className = "" }) {
  return (
    <div className={`bg-white border border-border rounded-sm ${className}`}>
      <div className="bg-[#f0f4f8] border-b border-border px-5 py-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── KPI tile ─────────────────────────────────────────────────────────────────
function KpiTile({ label, value, sub }) {
  return (
    <div className="border-r border-border last:border-r-0 px-5 py-4 text-center flex-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export default function ResultView({ result, onReset }) {
  const {
    decision, risk_tier,
    pd_pct, el_rate_pct, el_dollars, suggested_rate_pct,
    risk_drivers, purpose_label, loan_amnt,
    lgd_pct, funding_cost_pct, operating_margin_pct,
  } = result

  const isApprove = decision === "Approve"
  const isRefer   = decision.includes("Refer")

  const decisionBg    = isApprove ? "bg-[#e8f5e9] border-l-4 border-[#2e7d32]"
                      : isRefer   ? "bg-[#fff8e1] border-l-4 border-[#f9a825]"
                      :             "bg-[#fce4e4] border-l-4 border-[#c62828]"
  const decisionColor = isApprove ? "text-[#1b5e20]" : isRefer ? "text-[#6d4c00]" : "text-[#7f0000]"
  const badgeVariant  = isApprove ? "success" : isRefer ? "warning" : "destructive"
  const barColor      = isApprove ? "bg-green-500" : isRefer ? "bg-yellow-500" : "bg-red-500"

  return (
    <div>
      {/* Back link */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> New Assessment
      </button>

      {/* ── Decision banner ── */}
      <div className={`rounded-sm p-5 flex items-center justify-between mb-4 ${decisionBg}`}>
        <div>
          <p className={`text-4xl font-bold leading-none ${decisionColor}`}>{decision}</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Loan Amount (USD): <strong>${loan_amnt.toLocaleString()}</strong>
            {purpose_label ? <> &middot; {purpose_label}</> : null}
          </p>
        </div>
        <Badge variant={badgeVariant} className="text-base px-4 py-1.5">{risk_tier}</Badge>
      </div>

      {/* ── KPI bar ── */}
      <div className="bg-white border border-border rounded-sm mb-4 flex divide-x divide-border">
        <KpiTile label="Suggested Interest Rate" value={`${suggested_rate_pct}%`} sub="Annual percentage rate" />
        <KpiTile label="Expected Loss Rate (EL Rate)" value={`${el_rate_pct}%`} sub="Of principal" />
        <KpiTile label="Expected Loss Amount (EL)" value={`$${el_dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`On $${loan_amnt.toLocaleString()} loan`} />
        <KpiTile label="Probability of Default (PD)" value={`${pd_pct}%`} sub="Application-time model" />
      </div>

      {/* ── Two-column detail area ── */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">

        {/* Left — PD detail */}
        <Section title="Probability of Default (PD)">
          <div className="flex items-center gap-6 mb-4">
            <span className="text-6xl font-bold text-primary leading-none">{pd_pct}%</span>
            <p className="text-base text-muted-foreground leading-relaxed">
              Estimated likelihood this loan will be charged off.<br />
              Based on application-time information only — the model does not use
              LendingClub&apos;s own grade or interest rate.
            </p>
          </div>
          <div className="bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(pd_pct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>0% — Approve (&lt;15%)</span>
            <span>Refer (15–30%)</span>
            <span>100%</span>
          </div>
        </Section>

        {/* Right — Top Risk Factors */}
        <Section title="Top Risk Factors">
          {risk_drivers && risk_drivers.length > 0 ? (
            <ul className="space-y-4">
              {risk_drivers.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                    <TriangleAlert className="w-4 h-4 text-yellow-600" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{d.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This applicant: <strong>{d.value_str}</strong>
                      <br />Typical borrower: {d.typical_str}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No significant risk deviations detected.</p>
          )}
        </Section>

      </div>

      {/* ── Assumptions ── */}
      <Section title="Model &amp; Pricing Assumptions">
        <Separator className="mb-3" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Loss Given Default (LGD):</strong> {lgd_pct}% — measured on charged-off loans from the training period (net of recoveries).&emsp;
          <strong>Funding Cost:</strong> {funding_cost_pct}% (assumed).&emsp;
          <strong>Operating Margin:</strong> {operating_margin_pct}% (assumed).
          <br /><br />
          Suggested rate formula: Funding Cost + Operating Margin + (Probability of Default (PD) × Loss Given Default (LGD)).
          Simplifications: no interest income before default, no prepayment, no time value of money, no collection costs.
        </p>
      </Section>

      {/* ── Footer toolbar ── */}
      <div className="bg-white border border-border rounded-sm px-5 py-3 mt-4 flex justify-end">
        <Button variant="outline" onClick={onReset}>
          <ArrowLeft className="w-4 h-4 mr-2" /> New Assessment
        </Button>
      </div>

    </div>
  )
}
