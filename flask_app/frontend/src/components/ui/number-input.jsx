import { useState } from "react"
import { Input } from "@/components/ui/input"

function validationMessage(input) {
  const { validity, min, max, step } = input
  const format = (value) => Number(value).toLocaleString("en-US")

  if (validity.badInput) return "Enter a valid number."
  if (validity.valueMissing) return "Enter a value."
  if (validity.rangeUnderflow || validity.rangeOverflow) {
    if (min !== "" && max !== "") return `Enter a value between ${format(min)} and ${format(max)}.`
    if (min !== "") return `Enter a value of ${format(min)} or more.`
    return `Enter a value of ${format(max)} or less.`
  }
  if (validity.stepMismatch) {
    return step === "1" ? "Enter a whole number." : `Use increments of ${format(step)}.`
  }
  return ""
}

export function NumberInput({ id, onChange, ...props }) {
  const [error, setError] = useState("")
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1">
      <Input
        {...props}
        id={id}
        type="number"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={error ? "border-destructive focus-visible:ring-destructive" : undefined}
        onChange={(event) => {
          setError(validationMessage(event.currentTarget))
          onChange?.(event)
        }}
        onBlur={(event) => setError(validationMessage(event.currentTarget))}
        onInvalid={(event) => {
          event.preventDefault()
          const input = event.currentTarget
          setError(validationMessage(input))
          if (input.form?.querySelector("input:invalid") === input) input.focus()
        }}
      />
      {error && <p id={errorId} role="alert" className="text-xs text-destructive leading-tight">{error}</p>}
    </div>
  )
}
