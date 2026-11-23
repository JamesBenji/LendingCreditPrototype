import { Info } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MathFormula } from "@/components/ui/math-formula"

function InfoTooltip({ title, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={`About ${title}`} className="shrink-0 rounded-full text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="mb-3 font-semibold text-primary">{title}</p>
        <div className="space-y-3">{children}</div>
      </TooltipContent>
    </Tooltip>
  )
}

function Section({ title, help, children }) {
  return (
    <section className="result-section" aria-label={title}>
      <div className="flex items-center gap-2 border-b border-border bg-[#f0f4f8] px-4 py-2">
        <h2 className="text-base font-semibold uppercase tracking-wide text-primary">{title}</h2>
        {help && <InfoTooltip title={title}>{help}</InfoTooltip>}
      </div>
      <div className="result-section-body">{children}</div>
    </section>
  )
}

function Metric({ label, value, note, help, color = "text-primary", noteColor = "text-muted-foreground", inlineNote = false }) {
  return (
    <div className={"result-metric min-w-0 px-4 py-4" + (inlineNote ? " result-metric-inline" : "")}>
      <div className="result-metric-label flex items-center gap-2">
        <p className="text-base font-semibold text-muted-foreground">{label}</p>
        {help && <InfoTooltip title={label}>{help}</InfoTooltip>}
      </div>
      <div className={inlineNote ? "result-value-line mt-2 flex items-baseline gap-3" : "result-value-line mt-2"}>
        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        {note && <p className={`${inlineNote ? "whitespace-nowrap" : "mt-1"} text-sm ${noteColor}`}>{note}</p>}
      </div>
    </div>
  )
}

export default function ResultView({ result }) {
  const {
    decision, risk_tier, pd_pct, el_rate_pct, el_dollars, suggested_rate_pct,
    risk_drivers = [], loan_amnt, lgd_pct, funding_cost_pct, operating_margin_pct,
    pricing_capped, rate_cap_pct, uncapped_suggested_rate_pct,
    term_months, monthly_payment, final_payment, total_repayment, total_interest,
  } = result
  const isApprove = decision === "Approve"
  const isRefer = decision.includes("Refer")
  const riskColor = isApprove ? "text-green-800" : isRefer ? "text-amber-800" : "text-red-800"
  const barColor = isApprove ? "bg-green-800" : isRefer ? "bg-amber-800" : "bg-red-800"
  const riskPosition = Math.max(0, Math.min(pd_pct, 100))
  const roundingAffectsBand = (isApprove && pd_pct >= 15) || (isRefer && pd_pct >= 30)
  const moneyExact = (value) => value == null ? "—" : value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="assessment-result">
      <div className="result-metrics">
        <Metric label="Principal" value={moneyExact(loan_amnt)} help={<p>The amount requested by the applicant, before interest.</p>} />

        <Metric label="Risk (Predicted)" value={`${pd_pct}%`} note={risk_tier} color={riskColor} noteColor={riskColor} inlineNote help={<>
          <p><strong>Probability of Default (PD):</strong> The model’s predicted likelihood that this loan will be charged off.</p>
          <p><strong>Recommendation:</strong> {isRefer ? "Refer to Superior" : decision}.</p>
          <div className="border-t border-primary/15 pt-3">
            <p className="mb-2 font-semibold text-primary">Decision thresholds</p>
            <ul className="space-y-1">
              <li><strong>Approve:</strong> Below 15%.</li>
              <li><strong>Refer to Superior:</strong> 15% to below 30%.</li>
              <li><strong>Decline:</strong> 30% and above.</li>
            </ul>
            {roundingAffectsBand && <p className="mt-2">The decision uses the unrounded probability.</p>}
          </div>
          <div className="border-t border-primary/15 pt-3">
            <p className="mb-2 font-semibold text-primary">Borrower risk indicators</p>
            {risk_drivers.length > 0 ? (
              <ul className="space-y-2">
                {risk_drivers.map((driver) => (
                  <li key={driver.label}>
                    <p className="font-semibold">{driver.label}</p>
                    <p>Applicant: <strong>{driver.value_str}</strong> · Typical: {driver.typical_str}</p>
                  </li>
                ))}
              </ul>
            ) : <p>No adverse differences from typical borrowers.</p>}
            <p className="mt-2">Typical values are training-period medians.</p>
          </div>
          <p>PD is directly predicted by the model. Interest, payments, and expected losses are calculated using that prediction.</p>
          <p>Uncollected credit features use training defaults. LendingClub’s own grade and interest rate are excluded from the risk model.</p>
        </>} />

        <Metric label="Loan Price (Calculated)" value={moneyExact(total_repayment)} help={<><p>Total scheduled principal and interest over <strong>{term_months} months</strong> at a fixed annual interest rate of <strong>{suggested_rate_pct}%</strong>.</p>
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <dt>Principal</dt><dd className="text-right font-semibold tabular-nums">{moneyExact(loan_amnt)}</dd>
            <dt>Monthly payment</dt><dd className="text-right font-semibold tabular-nums">{moneyExact(monthly_payment)}</dd>
            <dt>Final payment</dt><dd className="text-right font-semibold tabular-nums">{moneyExact(final_payment)}</dd>
            <dt>Total interest</dt><dd className="text-right font-semibold tabular-nums">{moneyExact(total_interest)}</dd>
          </dl>
          <div className="border-t border-primary/15 pt-3">
            <p className="font-semibold text-primary">Monthly payment calculation</p>
            <MathFormula math={suggested_rate_pct === 0 ? String.raw`M = \frac{P}{n}` : String.raw`M = \frac{P r}{1 - (1+r)^{-n}}`} />
            <MathFormula math={String.raw`r = \frac{a}{12 \times 100}`} />
            <p><strong>P:</strong> Principal. <strong>a:</strong> Annual rate (%). <strong>r:</strong> Monthly rate. <strong>n:</strong> Number of monthly payments.</p>
          </div>
          <div className="border-t border-primary/15 pt-3">
            <p className="font-semibold text-primary">Total repayment calculation</p>
            <MathFormula math={String.raw`T = (n-1) M + F`} />
            <p><strong>M:</strong> Monthly payment, rounded to cents. <strong>F:</strong> Final payment, adjusted to clear the remaining balance. <strong>T:</strong> Total repayment.</p>
            <MathFormula math={String.raw`\text{Total interest} = T - P`} />
          </div>
          <p>Assumes on-time monthly payments, no fees, and no early repayment. Interest is charged on the remaining principal and rounded to cents each month.</p></>} />

        <Metric label="Interest Rate (Calculated)" value={`${suggested_rate_pct}%`} note={pricing_capped ? `Capped at ${rate_cap_pct}%` : undefined} help={<><p><strong>Loss Given Default: {lgd_pct}%.</strong> Measured on training-period charge-offs, net of recoveries.</p>
          <p><strong>Funding Cost: {funding_cost_pct}%.</strong> Assumed cost of funding the loan.</p>
          <p><strong>Operating Margin: {operating_margin_pct}%.</strong> Assumed allowance for operating costs and profit.</p>
          <div className="border-t border-primary/15 pt-3">
            <p className="font-semibold text-primary">Interest Rate Calculation</p>
            <MathFormula math={String.raw`\text{Rate} = \text{Funding cost} + \text{Margin} + \mathrm{PD} \times \mathrm{LGD}`} />
            <div className="space-y-1">
              <p><strong>PD:</strong> Probability of Default</p>
              <p><strong>LGD:</strong> Loss Given Default</p>
            </div>
          </div>
          {rate_cap_pct != null && <p><strong>Rate Cap:</strong> {rate_cap_pct}%.</p>}
          {pricing_capped && <p className="text-amber-800">Uncapped estimate: {uncapped_suggested_rate_pct}%. Suggested rate capped at {rate_cap_pct}%.</p>}
          <p>This simplified calculation excludes interest income before default, prepayment, time value of money, and collection costs.</p></>} />

        <Metric label="Monthly Payment (Calculated)" value={moneyExact(monthly_payment)} help={<>
          <p>The regular monthly principal-and-interest payment over <strong>{term_months} months</strong> at <strong>{suggested_rate_pct}%</strong> annual interest.</p>
          <MathFormula math={suggested_rate_pct === 0 ? String.raw`M = \frac{P}{n}` : String.raw`M = \frac{P r}{1 - (1+r)^{-n}}`} />
          <MathFormula math={String.raw`r = \frac{a}{12 \times 100}`} />
          <p><strong>P:</strong> Principal. <strong>a:</strong> Annual interest rate (%). <strong>r:</strong> Monthly interest rate. <strong>n:</strong> Number of payments.</p>
          <p>The final payment is <strong>{moneyExact(final_payment)}</strong>, adjusted for cent rounding to clear the balance.</p>
        </>} />

        <Metric label="Duration" value={term_months == null ? "—" : `${term_months} months`} help={<p>The repayment term selected in the application. Interest and monthly payments are calculated over this duration.</p>} />

        <Metric label="Profit (Before Costs)" value={moneyExact(total_interest)} help={<>
          <p>Total interest earned if the borrower repays the loan in full over the selected duration.</p>
          <MathFormula math={String.raw`\text{Gross interest} = \text{Total repayment} - \text{Principal}`} />
          <p>Shown before funding costs, operating expenses, and credit losses. This figure represents gross interest income.</p>
        </>} />

        <Metric label="Expected Loss (Calculated)" value={`${el_rate_pct}%`} help={<>
          <p>The estimated share of principal lost to default, after recoveries.</p>
          <MathFormula math={String.raw`\mathrm{EL} = \mathrm{PD} \times \mathrm{LGD}`} />
          <p><strong>PD:</strong> Probability of Default. <strong>LGD:</strong> Loss Given Default.</p>
          <p>Both are used as fractions in the calculation. The result is displayed as a percentage and uses the unrounded model prediction.</p>
        </>} />

        <Metric label="Expected Loss Amount (Calculated)" value={moneyExact(el_dollars)} help={<>
          <p>The estimated credit loss in dollars on this principal.</p>
          <MathFormula math={String.raw`\text{Loss amount} = P \times \mathrm{PD} \times \mathrm{LGD}`} />
          <p><strong>P:</strong> Principal. <strong>PD:</strong> Probability of Default. <strong>LGD:</strong> Loss Given Default.</p>
          <p>Calculated using unrounded values. This is a credit-loss estimate, not an extra charge to the borrower.</p>
        </>} />

      </div>

      <div className="result-detail-area">
        <Section title="Credit Risk" help={<>
          <p>Default probability estimates the likelihood that the loan will be charged off.</p>
          <p>The model uses application inputs and training defaults for uncollected credit features. LendingClub’s own grade and interest rate are excluded.</p>
        </>}>
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-base font-bold text-muted-foreground">Probability of Default (Predicted)</p>
              <strong className="text-2xl font-bold text-primary tabular-nums">{pd_pct}%</strong>
            </div>
            <div role="meter" aria-label="Default probability" aria-valuemin={0} aria-valuemax={100} aria-valuenow={riskPosition} aria-valuetext={`${pd_pct}% — ${risk_tier}`} className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${barColor}`} style={{ width: `${riskPosition}%` }} />
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="font-semibold text-primary">Approve</dt>
                <dd className="mt-1 text-base font-bold text-muted-foreground">&lt;15%</dd>
              </div>
              <div>
                <dt className="font-semibold text-primary">Refer to Superior</dt>
                <dd className="mt-1 text-base font-bold text-muted-foreground">&lt;30%</dd>
              </div>
              <div>
                <dt className="font-semibold text-primary">Decline</dt>
                <dd className="mt-1 text-base font-bold text-muted-foreground">≥30%</dd>
              </div>
            </dl>
            {roundingAffectsBand && <p className="text-xs text-muted-foreground">The decision uses the unrounded probability.</p>}
          </div>
        </Section>

        <Section title="Borrower Risk Indicators" help={<p>These indicators compare the applicant’s values with training-period medians. They highlight adverse differences in the borrower’s profile.</p>}>
          {risk_drivers.length > 0 ? (
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="w-[60%] pb-2 text-left font-medium">Indicator</th>
                  <th scope="col" className="w-[20%] pb-2 text-right font-medium">Applicant</th>
                  <th scope="col" className="w-[20%] pb-2 text-right font-medium">Typical</th>
                </tr>
              </thead>
              <tbody>
                {risk_drivers.map((driver) => (
                  <tr key={driver.label} className="border-b border-border last:border-b-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-foreground">{driver.label.replace(/ [(][^)]*[)]$/, "")}</th>
                    <td className="py-2 pl-1 text-right font-semibold text-primary tabular-nums break-words">{driver.value_str}</td>
                    <td className="py-2 pl-1 text-right text-muted-foreground tabular-nums break-words">{driver.typical_str}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No adverse differences from typical borrowers.</p>
          )}
        </Section>
      </div>
    </div>
  )
}
