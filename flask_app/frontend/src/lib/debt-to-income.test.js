import assert from "node:assert/strict"
import { test } from "node:test"
import { calculateDti } from "./debt-to-income.js"

test("converts annual income to monthly income for DTI", () => {
  assert.ok(Math.abs(calculateDti(550, 48000) - 13.75) < 1e-10)
  assert.equal(calculateDti(500, 60000), 10)
})

test("reacts to either debt or income changes", () => {
  assert.equal(calculateDti(1000, 60000), 20)
  assert.equal(calculateDti(500, 120000), 5)
})

test("accepts numeric strings and cents without premature rounding", () => {
  assert.ok(Math.abs(calculateDti("500.25", "60000") - 10.005) < 1e-10)
})

test("zero debt produces zero DTI", () => {
  assert.equal(calculateDti("0", "64000"), 0)
})

test("missing or invalid values do not produce a misleading ratio", () => {
  for (const [debt, income] of [
    ["", 60000], [500, ""], [" ", 60000], [null, 60000],
    [500, undefined], [-500, 60000], [500, 0], [500, -60000],
    ["bad input", 60000], [500, Infinity], [Infinity, 60000],
  ]) {
    assert.equal(calculateDti(debt, income), null)
  }
})

test("does not cap excessive debt at a valid-looking percentage", () => {
  assert.equal(calculateDti(6000, 60000), 120)
})
