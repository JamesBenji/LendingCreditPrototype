from decimal import Decimal, ROUND_HALF_UP


def calculate_repayment(principal, annual_rate_pct, term_months):
    """Fixed monthly amortisation, with a final instalment adjusted to cents."""
    principal = Decimal(str(principal))
    annual_rate = Decimal(str(annual_rate_pct))
    if not principal.is_finite() or principal <= 0:
        raise ValueError("Principal must be a positive finite amount.")
    if not annual_rate.is_finite() or annual_rate < 0:
        raise ValueError("Interest rate must be a non-negative finite percentage.")
    if isinstance(term_months, bool) or not isinstance(term_months, int) or term_months <= 0:
        raise ValueError("Term must be a positive whole number of months.")

    cent = Decimal("0.01")
    monthly_rate = annual_rate / Decimal(1200)
    if monthly_rate == 0:
        payment = principal / term_months
    else:
        payment = principal * monthly_rate / (1 - (1 + monthly_rate) ** (-term_months))
    monthly_payment = payment.quantize(cent, rounding=ROUND_HALF_UP)

    balance = principal
    for _ in range(term_months - 1):
        interest = (balance * monthly_rate).quantize(cent, rounding=ROUND_HALF_UP)
        balance = balance + interest - monthly_payment
    final_interest = (balance * monthly_rate).quantize(cent, rounding=ROUND_HALF_UP)
    final_payment = (balance + final_interest).quantize(cent, rounding=ROUND_HALF_UP)
    total_repayment = monthly_payment * (term_months - 1) + final_payment
    total_interest = (total_repayment - principal).quantize(cent, rounding=ROUND_HALF_UP)

    return {
        "term_months": term_months,
        "monthly_payment": float(monthly_payment),
        "final_payment": float(final_payment),
        "total_repayment": float(total_repayment),
        "total_interest": float(total_interest),
    }
