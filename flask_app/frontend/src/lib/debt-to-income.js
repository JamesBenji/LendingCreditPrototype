export function calculateDti(monthlyDebtPayments, annualIncome) {
  if (monthlyDebtPayments == null || annualIncome == null) return null
  if (String(monthlyDebtPayments).trim() === "" || String(annualIncome).trim() === "") return null

  const debt = Number(monthlyDebtPayments)
  const income = Number(annualIncome)
  if (!Number.isFinite(debt) || !Number.isFinite(income) || debt < 0 || income <= 0) return null

  const dti = (debt / income) * 1200
  return Number.isFinite(dti) ? dti : null
}
