# ADR 0002 — Money in integer minor units + double-entry ledger

- **Status:** Accepted
- **Context:** The spec mandates money as integer minor units + currency (never
  floats), itemized and reconcilable via a double-entry-style ledger (§6, §14).
  Supported currencies include **BHD**, which has **3** decimal places, not 2.
- **Decision:**
  - `Money = { amount: integer minor units, currency }`. All arithmetic
    (`add`, `multiply`, `percentOf`, …) operates on minor units in `money.ts`.
  - A per-currency exponent table drives both math and `Intl`-based formatting,
    so BHD renders 3 fraction digits and converts correctly.
  - The pricing pipeline computes in USD minor units (markup/fee/tax) then
    converts per line to the display currency, guaranteeing the shown line items
    sum exactly to the shown total.
  - Each captured payment emits a balanced **double-entry ledger**
    (customer / supplier-payable / tax-payable / revenue) summing to zero,
    surfaced per booking with a live Balanced check.
- **Consequences:** No floating-point drift; totals are auditable and
  reconcilable. FX rounding is absorbed at conversion time so every breakdown
  stays internally consistent.
