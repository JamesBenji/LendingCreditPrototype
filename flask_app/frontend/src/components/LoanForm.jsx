import { useState } from "react"
import { Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// ── SAP-style section panel ───────────────────────────────────────────────────
function Section({ title, children, cols = 3 }) {
  return (
    <div className="bg-white border border-border rounded-sm mb-4">
      {/* Section title bar */}
      <div className="bg-[#f0f4f8] border-b border-border px-5 py-2">
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className={`grid gap-x-5 gap-y-3 p-4 grid-cols-${cols}`}>
        {children}
      </div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, tip, hint, children, span = 1 }) {
  return (
    <div className={`flex flex-col gap-1 col-span-${span}`}>
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none"
            >
              <Info className="w-2.5 h-2.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{tip}</TooltipContent>
        </Tooltip>
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground leading-tight">{hint}</p>}
    </div>
  )
}

// ── SelectField helper ────────────────────────────────────────────────────────
function SelectField({ value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
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
    dti:                   String((d.dti ?? 17.6).toFixed(1)),
    revol_util:            String((d.revol_util ?? 50).toFixed(1)),
    mths_since_recent_inq: String(Math.round(d.mths_since_recent_inq ?? 6)),
    delinq_2yrs:           String(Math.round(d.delinq_2yrs ?? 0)),
    open_acc:              String(Math.round(d.open_acc ?? 11)),
    pub_rec:               String(Math.round(d.pub_rec ?? 0)),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Server error")
      onResult(await res.json())
    } catch {
      setError("Could not reach the assessment server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* ── LOAN DETAILS ── */}
      <Section title="Loan Details" cols={3}>
        <Field label="Loan Amount (USD)"
          tip="The total amount of money the applicant is requesting to borrow. Must be between $500 and $40,000."
          hint="Between $500 and $40,000">
          <Input type="number" value={form.loan_amnt} onChange={setNum("loan_amnt")} min={500} max={40000} step={500} required />
        </Field>

        <Field label="Loan Term"
          tip="Repayment period. 36 months means higher monthly payments but lower total interest. 60 months spreads payments longer but costs more overall.">
          <SelectField value={form.term} onChange={set("term")} options={options.term_options} />
        </Field>

        <Field label="Loan Purpose"
          tip="The stated reason for the loan. Purpose affects default risk — debt consolidation tends to be lower risk than small business loans.">
          <SelectField value={form.purpose} onChange={set("purpose")} options={options.purpose_options} />
        </Field>
      </Section>

      {/* ── APPLICANT PROFILE ── */}
      <Section title="Applicant Profile" cols={3}>
        <Field label="Annual Income (USD)"
          tip="Total yearly income before taxes, from all sources. Used to compute the Loan-to-Income Ratio (LTI) and assess repayment capacity.">
          <Input type="number" value={form.annual_inc} onChange={setNum("annual_inc")} min={1000} step={1000} required />
        </Field>

        <Field label="Employment Length"
          tip="How long the applicant has been with their current employer. Longer employment typically signals income stability and lower default risk.">
          <SelectField value={form.emp_length} onChange={set("emp_length")} options={options.emp_length_options} />
        </Field>

        <Field label="Home Ownership"
          tip="The applicant's current housing situation. Mortgage holders tend to have demonstrated creditworthiness. Renters may have fewer fixed assets.">
          <SelectField value={form.home_ownership} onChange={set("home_ownership")} options={options.home_ownership_options} />
        </Field>

        <Field label="Income Verification Status"
          tip="Whether the applicant's income has been independently verified. 'Source Verified' confirms the income source. 'Verified' confirms the amount. 'Not Verified' is self-reported only.">
          <SelectField value={form.verification_status} onChange={set("verification_status")} options={options.verification_options} />
        </Field>

        <Field label="Application Type"
          tip="Individual means a solo application. Joint App includes a co-applicant whose income and credit are also considered.">
          <SelectField value={form.application_type} onChange={set("application_type")} options={options.application_type_options} />
        </Field>
      </Section>

      {/* ── CREDIT PROFILE ── */}
      <Section title="Credit Profile" cols={4}>
        <Field label="FICO Credit Score (FICO)"
          tip="Standardised credit score from 300 (poor) to 850 (excellent). Higher scores indicate a stronger credit history and lower default risk. Enter the midpoint if a range is given."
          hint="Range: 300 – 850">
          <Input type="number" value={form.fico_avg} onChange={setNum("fico_avg")} min={300} max={850} step={1} required />
        </Field>

        <Field label="Debt-to-Income Ratio (DTI) %"
          tip="Total monthly debt payments divided by gross monthly income, as a percentage. Higher DTI means less disposable income to service new debt. Formula: (monthly debts ÷ monthly income) × 100."
          hint="Monthly debt payments ÷ monthly income × 100">
          <Input type="number" value={form.dti} onChange={setNum("dti")} min={0} max={100} step={0.1} required />
        </Field>

        <Field label="Revolving Utilisation Rate (RUR) %"
          tip="Percentage of available revolving credit (e.g. credit cards) currently in use. High utilisation suggests reliance on credit. Formula: (balance ÷ credit limit) × 100."
          hint="Credit used ÷ total revolving credit limit × 100">
          <Input type="number" value={form.revol_util} onChange={setNum("revol_util")} min={0} max={100} step={0.1} />
        </Field>

        <Field label="Months Since Last Credit Inquiry"
          tip="Months since the most recent hard inquiry on the applicant's credit report. Very recent inquiries may indicate the applicant is actively seeking new credit, which can signal higher risk.">
          <Input type="number" value={form.mths_since_recent_inq} onChange={setNum("mths_since_recent_inq")} min={0} max={240} step={1} />
        </Field>

        <Field label="Delinquencies in Last 2 Years"
          tip="Number of times the applicant has been 30 or more days past due on a payment in the last 24 months. Even one delinquency significantly increases default probability."
          hint="Number of 30+ day late payments">
          <Input type="number" value={form.delinq_2yrs} onChange={setNum("delinq_2yrs")} min={0} step={1} />
        </Field>

        <Field label="Number of Open Accounts"
          tip="Total number of open credit accounts on the applicant's credit report, including credit cards, loans, and lines of credit. Very high counts can indicate over-extension.">
          <Input type="number" value={form.open_acc} onChange={setNum("open_acc")} min={0} step={1} />
        </Field>

        <Field label="Public Records"
          tip="Number of derogatory public records on the applicant's credit file, such as bankruptcies, tax liens, or civil judgements. Any public record is a significant negative signal."
          hint="Bankruptcies, tax liens, judgements">
          <Input type="number" value={form.pub_rec} onChange={setNum("pub_rec")} min={0} step={1} />
        </Field>
      </Section>

      {/* ── Footer toolbar ── */}
      <div className="bg-white border border-border rounded-sm px-5 py-3 flex items-center gap-4">
        {error && <p className="text-sm text-destructive flex-1">{error}</p>}
        <Button type="submit" size="lg" disabled={loading} className="ml-auto">
          {loading ? "Assessing…" : "Assess Application →"}
        </Button>
      </div>

    </form>
  )
}
