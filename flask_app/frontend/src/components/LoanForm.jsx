import { cloneElement, useEffect, useId, useState } from "react"
import { ChevronDown, Info } from "lucide-react"
import { NumberInput } from "@/components/ui/number-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MathFormula } from "@/components/ui/math-formula"
import { calculateDti } from "@/lib/debt-to-income"
import applicationExamples from "@/lib/application-examples.json"
import { useMobile } from "@/lib/use-mobile"

// ── SAP-style section panel ───────────────────────────────────────────────────
function Section({ title, children, cols = 3 }) {
  return (
    <section className="bg-white border border-border rounded-sm" aria-label={title}>
      {/* Section title bar */}
      <div className="bg-[#f0f4f8] border-b border-border px-5 py-2">
        <h2 className="text-base font-semibold text-primary uppercase tracking-wide">{title}</h2>
      </div>
      <div className={`input-grid input-grid-${cols} grid gap-x-5 gap-y-6 p-4`}>
        {children}
      </div>
    </section>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function TipDetail({ label, children }) {
  return (
    <div className="border-t border-primary/15 pt-3">
      <p className="font-semibold text-primary mb-1">{label}</p>
      <div>{children}</div>
    </div>
  )
}

function Field({ label, tip, hint, error, children, span = 1 }) {
  const id = useId()
  return (
    <div className={`flex flex-col gap-2 col-span-${span}`}>
      <div className="field-label flex items-center gap-1.5">
        <Label id={`${id}-label`} htmlFor={id}>{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${label}`}
              className="info-trigger inline-flex shrink-0 items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Info className="w-2.5 h-2.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-semibold text-primary mb-3">{label}</p>
            <div className="space-y-3">{tip}</div>
          </TooltipContent>
        </Tooltip>
      </div>
      {cloneElement(children, {
        id,
        "aria-labelledby": `${id}-label`,
        ...(error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {}),
      })}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive leading-tight">{error}</p>}
      {hint && <p className="text-xs text-muted-foreground leading-tight">{hint}</p>}
    </div>
  )
}

// ── SelectField helper ────────────────────────────────────────────────────────
function SelectField({ value, onChange, options, ...props }) {
  const mobile = useMobile()
  if (mobile) {
    return (
      <select {...props} className="mobile-native-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value
          const label = typeof option === "string" ? option : option.label
          return <option key={val} value={val}>{label}</option>
        })}
      </select>
    )
  }
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger {...props}><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const val = typeof o === "string" ? o : o.value
          const lbl = typeof o === "string" ? o : o.label
          return <SelectItem key={val} value={val}>{lbl}</SelectItem>
        })}
      </SelectContent>
    </Select>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function LoanForm({ options, onResult }) {
  const d = options.defaults

  const [form, setForm] = useState({
    loan_amnt:             String(Math.round(d.loan_amnt ?? 12000)),
    term:                  d.term ?? "36 months",
    purpose:               d.purpose ?? "debt_consolidation",
    annual_inc:            String(Math.round(d.annual_inc ?? 64000)),
    emp_length:            d.emp_length ?? "10+ years",
    home_ownership:        d.home_ownership ?? "MORTGAGE",
    verification_status:   d.verification_status ?? "Source Verified",
    application_type:      d.application_type ?? "Individual",
    fico_avg:              String(Math.round(d.fico_avg ?? 692)),
    revol_util:            String((d.revol_util ?? 50).toFixed(1)),
    mths_since_recent_inq: String(Math.round(d.mths_since_recent_inq ?? 6)),
    delinq_2yrs:           String(Math.round(d.delinq_2yrs ?? 0)),
    open_acc:              String(Math.round(d.open_acc ?? 11)),
    pub_rec:               String(Math.round(d.pub_rec ?? 0)),
  })
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState(() =>
    ((Math.round(d.annual_inc ?? 64000) / 12) * Number((d.dti ?? 17.6).toFixed(1)) / 100).toFixed(2)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputVersion, setInputVersion] = useState(0)
  const [exampleNotice, setExampleNotice] = useState(null)
  const dti = calculateDti(monthlyDebtPayments, form.annual_inc)
  const dtiError = dti !== null && dti > 100
    ? "DTI must not exceed 100%. Check monthly debt payments and annual income."
    : null

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    if (!exampleNotice) return
    const timeout = window.setTimeout(() => setExampleNotice(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [exampleNotice])

  function loadExample(example) {
    if (loading) return
    setForm({ ...example.form })
    setMonthlyDebtPayments(example.monthlyDebtPayments)
    setError(null)
    // Remount the controls to clear previous validation messages and reset scroll.
    setInputVersion((version) => version + 1)
    setExampleNotice({ title: example.title })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (dti === null || dtiError) {
      e.currentTarget.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    // Dismiss the keyboard before loading or displaying a result.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dti: dti.toFixed(1) }),
      })
      if (!res.ok) {
        const response = await res.json().catch(() => null)
        setError(response?.error ?? "The assessment could not be completed. Please try again.")
        return
      }
      onResult(await res.json())
    } catch {
      setError("Could not reach the assessment server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="application-layout" aria-busy={loading} autoComplete="off">
      <div className="input-panel">
        <div key={inputVersion} className="input-scroll" role="region" aria-label="Application inputs" tabIndex={0}>

      {/* ── LOAN DETAILS ── */}
      <Section title="Loan Details" cols={3}>
        <Field label="Loan Amount (USD)"
          tip={<>
            <p>The total amount the applicant is requesting to borrow.</p>
            <TipDetail label="Accepted amount">
              <p><strong>$500–$40,000</strong>, in increments of $500.</p>
            </TipDetail>
          </>}>
          <NumberInput value={form.loan_amnt} onChange={setNum("loan_amnt")} min={500} max={40000} step={500} required />
        </Field>

        <Field label="Loan Term"
          tip={<>
            <p>The length of time available to repay the loan.</p>
            <TipDetail label="Compare the terms">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>36 months:</strong> Higher monthly payments, typically less total interest.</li>
                <li><strong>60 months:</strong> Lower monthly payments, typically more total interest.</li>
              </ul>
            </TipDetail>
          </>}>
          <SelectField value={form.term} onChange={set("term")} options={options.term_options} />
        </Field>

        <Field label="Loan Purpose"
          tip={<>
            <p>The applicant’s stated reason for borrowing.</p>
            <TipDetail label="Why it matters">
              <p>Default risk can vary by purpose. Debt consolidation, for example, may carry different risk than a small business loan.</p>
            </TipDetail>
          </>}>
          <SelectField value={form.purpose} onChange={set("purpose")} options={options.purpose_options} />
        </Field>
      </Section>

      {/* ── APPLICANT PROFILE ── */}
      <Section title="Applicant Profile" cols={3}>
        <Field label="Annual Income (USD)"
          tip={<>
            <p>Enter total yearly income <strong>before taxes</strong>, from all sources.</p>
            <TipDetail label="How it is used">
              <p>Helps assess repayment capacity and calculate the loan-to-income ratio (LTI).</p>
            </TipDetail>
            <TipDetail label="LTI formula">
              <MathFormula math={String.raw`\mathrm{LTI} = \frac{\text{Loan amount}}{\text{Annual income}}`} />
            </TipDetail>
          </>}>
          <NumberInput value={form.annual_inc} onChange={setNum("annual_inc")} min={1000} step={1000} required />
        </Field>

        <Field label="Monthly Debt Payments (USD)"
          tip={<>
            <p>Total required monthly payments on the applicant’s <strong>existing debts</strong>, before taking this loan.</p>
            <TipDetail label="Include">
              <ul className="list-disc pl-5 space-y-1">
                <li>Car, student, and existing personal loan payments</li>
                <li>Minimum required credit card payments</li>
              </ul>
            </TipDetail>
            <TipDetail label="Leave out">
              <p>The proposed loan payment, groceries, utilities, and other everyday expenses. Use the same debt obligations as the source credit report.</p>
            </TipDetail>
            <TipDetail label="How it is used">
              <p>Combined with annual income to calculate DTI automatically. Enter <strong>0</strong> if there are no existing debt payments.</p>
            </TipDetail>
          </>}>
          <NumberInput value={monthlyDebtPayments} onChange={(event) => setMonthlyDebtPayments(event.target.value)} min={0} step={0.01} required />
        </Field>

        <Field label="Employment Length"
          tip={<>
            <p>How long the applicant has been with their current employer.</p>
            <TipDetail label="Why it matters">
              <p>Longer employment can indicate more stable income and a greater ability to keep up with payments.</p>
            </TipDetail>
          </>}>
          <SelectField value={form.emp_length} onChange={set("emp_length")} options={options.emp_length_options} />
        </Field>

        <Field label="Home Ownership"
          tip={<>
            <p>The applicant’s current housing arrangement.</p>
            <TipDetail label="Choose the matching option">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Rent:</strong> Rents their home.</li>
                <li><strong>Own:</strong> Owns their home without a mortgage.</li>
                <li><strong>Mortgage:</strong> Owns their home with a mortgage.</li>
                <li><strong>Other:</strong> Another housing arrangement.</li>
              </ul>
            </TipDetail>
          </>}>
          <SelectField value={form.home_ownership} onChange={set("home_ownership")} options={options.home_ownership_options} />
        </Field>

        <Field label="Income Verification Status"
          tip={<>
            <p>Whether the applicant’s income has been independently checked.</p>
            <TipDetail label="What each status means">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Source Verified:</strong> The income source has been confirmed.</li>
                <li><strong>Verified:</strong> The income amount has been confirmed.</li>
                <li><strong>Not Verified:</strong> Income is self-reported.</li>
              </ul>
            </TipDetail>
          </>}>
          <SelectField value={form.verification_status} onChange={set("verification_status")} options={options.verification_options} />
        </Field>

        <Field label="Application Type"
          tip={<>
            <p>Whether the application has one applicant or includes a co-applicant.</p>
            <TipDetail label="Application options">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Individual:</strong> One applicant.</li>
                <li><strong>Joint App:</strong> An application with a co-applicant.</li>
              </ul>
            </TipDetail>
          </>}>
          <SelectField value={form.application_type} onChange={set("application_type")} options={options.application_type_options} />
        </Field>
      </Section>

      {/* ── CREDIT PROFILE ── */}
      <Section title="Credit Profile" cols={4}>
        <Field label="FICO Credit Score (FICO)"
          tip={<>
            <p><strong>FICO:</strong> Fair Isaac Corporation.</p>
            <p>A standardised measure of the applicant’s credit history. Higher scores generally indicate lower default risk.</p>
            <TipDetail label="Score range">
              <p><strong>300</strong> (poor) to <strong>850</strong> (excellent).</p>
            </TipDetail>
            <TipDetail label="If you have a range">
              <p>Enter the midpoint. For a range of <strong>680–684</strong>:</p>
              <MathFormula math={String.raw`\frac{680 + 684}{2} = 682`} />
            </TipDetail>
          </>}>
          <NumberInput value={form.fico_avg} onChange={setNum("fico_avg")} min={300} max={850} step={1} required />
        </Field>

        <Field label="Debt-to-Income Ratio (DTI) %"
          error={dtiError}
          tip={<>
            <p>The percentage of gross monthly income used for existing debt payments. Calculated automatically from monthly debt payments and annual income.</p>
            <TipDetail label="Formula">
              <MathFormula math={String.raw`\mathrm{DTI} = \frac{\text{Monthly debt payments}}{\text{Gross monthly income}} \times 100`} />
            </TipDetail>
            <TipDetail label="How to read it">
              <p>Higher DTI means less income is available for new loan payments.</p>
            </TipDetail>
          </>}>
          <Input type="text" value={dti === null ? "" : dti.toFixed(1)} readOnly placeholder="—" className={`bg-muted font-semibold ${dtiError ? "border-destructive text-destructive focus-visible:ring-destructive" : ""}`} />
        </Field>

        <Field label="Revolving Utilisation Rate (RUR) %"
          tip={<>
            <p>The percentage of available revolving credit, such as credit cards, currently in use.</p>
            <TipDetail label="Formula">
              <MathFormula math={String.raw`\mathrm{RUR} = \frac{\text{Revolving balance}}{\text{Total revolving credit limit}} \times 100`} />
            </TipDetail>
            <TipDetail label="Example">
              <p>A <strong>$2,500</strong> balance against a <strong>$10,000</strong> credit limit:</p>
              <MathFormula math={String.raw`\frac{2{,}500}{10{,}000} \times 100 = 25\%`} />
            </TipDetail>
          </>}>
          <NumberInput value={form.revol_util} onChange={setNum("revol_util")} min={0} max={100} step={0.1} />
        </Field>

        <Field label="Months Since Last Credit Inquiry"
          tip={<>
            <p>Months since the most recent <strong>hard inquiry</strong> on the applicant’s credit report.</p>
            <TipDetail label="What counts">
              <p>A credit check made when applying for credit. Enter <strong>0</strong> if it happened within the current month.</p>
            </TipDetail>
            <TipDetail label="Why it matters">
              <p>Very recent inquiries may indicate active borrowing and can signal higher risk.</p>
            </TipDetail>
          </>}>
          <NumberInput value={form.mths_since_recent_inq} onChange={setNum("mths_since_recent_inq")} min={0} max={240} step={1} />
        </Field>

        <Field label="Delinquencies in Last 2 Years"
          tip={<>
            <p>Number of payment delinquencies recorded in the last <strong>24 months</strong>.</p>
            <TipDetail label="What to count">
              <p>Payments that were <strong>30 or more days overdue</strong>. Enter <strong>0</strong> if none were recorded.</p>
            </TipDetail>
            <TipDetail label="Why it matters">
              <p>Past delinquencies can indicate difficulty keeping up with repayments.</p>
            </TipDetail>
          </>}>
          <NumberInput value={form.delinq_2yrs} onChange={setNum("delinq_2yrs")} min={0} step={1} />
        </Field>

        <Field label="Number of Open Accounts"
          tip={<>
            <p>Total open credit accounts listed on the applicant’s credit report.</p>
            <TipDetail label="Include">
              <ul className="list-disc pl-5 space-y-1">
                <li>Credit cards</li>
                <li>Loans</li>
                <li>Lines of credit</li>
              </ul>
            </TipDetail>
            <TipDetail label="Why it matters">
              <p>A very high count may indicate that the applicant is overextended.</p>
            </TipDetail>
          </>}>
          <NumberInput value={form.open_acc} onChange={setNum("open_acc")} min={0} step={1} />
        </Field>

        <Field label="Public Records"
          tip={<>
            <p>Number of derogatory public records listed on the applicant’s credit file.</p>
            <TipDetail label="Examples">
              <ul className="list-disc pl-5 space-y-1">
                <li>Bankruptcies</li>
                <li>Tax liens</li>
                <li>Civil judgements</li>
              </ul>
            </TipDetail>
            <TipDetail label="What to enter">
              <p>Use the count shown on the credit report, or <strong>0</strong> if none are listed.</p>
            </TipDetail>
          </>}>
          <NumberInput value={form.pub_rec} onChange={setNum("pub_rec")} min={0} step={1} />
        </Field>
      </Section>

        </div>
      </div>

      <aside className="assessment-panel" aria-labelledby="assessment-title">
        <div className="assessment-intro">
          <h2 id="assessment-title" className="text-xl font-semibold text-primary">Assessment</h2>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="assessment-submit w-full h-12 px-4 text-base font-bold shrink-0">
          {loading ? "Assessing…" : "Assess Application →"}
        </Button>
        {error && <p role="alert" className="assessment-error text-sm text-destructive">{error}</p>}
        <details className="application-examples group w-full border-t border-border pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold uppercase tracking-wide text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            Examples
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="mt-3 divide-y divide-border">
            {applicationExamples.map((example) => (
              <li key={example.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-primary">{example.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Expected: {example.expectedRiskTier}</p>
                </div>
                <Button type="button" size="sm" disabled={loading} onClick={() => loadExample(example)} aria-label={`Set ${example.title} example`} className="shrink-0 px-4 text-base font-semibold">
                  Set
                </Button>
              </li>
            ))}
          </ul>
        </details>
      </aside>

      <div className="mobile-assessment-action">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="w-full h-12 text-base font-bold">
          {loading ? "Assessing…" : "Assess Application →"}
        </Button>
      </div>

      {exampleNotice && (
        <div key={inputVersion} role="status" className="example-notice fixed top-4 left-4 right-4 sm:left-auto z-50 max-w-[calc(100vw-2rem)] sm:max-w-[26rem] rounded-md border-2 border-primary bg-white px-4 py-3 text-base font-medium text-primary shadow-lg">
          Example loaded and set. Click Assess Application.
        </div>
      )}

    </form>
  )
}
