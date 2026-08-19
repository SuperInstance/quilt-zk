# quilt-zk

> Zero-knowledge proofs over Quilt cell state. Prove statements about cells without revealing the cells.

A sketch. The real implementation will use a real ZK library (Halo2, Plonky2, Noir, circom).

## The thesis

Today, proving things about your data means showing your data. To prove
"my bank balance is at least $50,000," you show your bank statement. To
prove "I'm over 18," you show your ID. To prove "I voted," you show a
ballot receipt. **This is the bug.** The verifier learns not just
whether the statement is true, but the underlying data.

Zero-knowledge proofs fix this. You prove "balance ≥ $50,000" without
revealing the balance. You prove "age ≥ 18" without revealing your
birthday. You prove "I voted" without revealing how. The verifier learns
only the truth of the statement, not the underlying data.

**Quilt cells are the natural unit for ZK.** A cell is a value; a proof
is also a value. A Quilt cell whose value is a proof is just another
cell in the graph — formulas, listeners, and other cells can react to
it. The ZK machinery is invisible.

## The cell shape

A ZK cell is a value cell whose value is a `Proof`. The cell's
`circuit` says what the proof is about. The cell's `witness` is the
private input (kept off-chain, on the prover's device). The cell's
`publicInputs` are the public inputs (shared with the verifier).

```yaml
id: proof-of-solvency
cells:
  - id: bank.balance
    kind: value
    value: 75000  # private, on user's device

  - id: proof.balance-over-50k
    kind: zk
    circuit: value_at_least
    witness:
      value: bank.balance
    public:
      threshold: 50000

  - id: proof.can-afford-loan
    kind: listener
    watch: proof.balance-over-50k
    condition: "proof.balance-over-50k.holds"
    action: "console.log('Approved')"
```

The verifier (the bank) checks the proof. They learn "this person has
≥ $50,000" — they don't learn the actual balance.

## Pre-built circuits

| Circuit | Public | Private | Proves |
| --- | --- | --- | --- |
| `value_at_least` | threshold | value | value ≥ threshold |
| `value_at_most` | threshold | value | value ≤ threshold |
| `value_in_set` | set hash | value, set | value is in the set |
| `sum_equals` | total | values | sum of values equals total |
| `group_membership` | group root | member id, merkle path | prover is in the group |
| `credential_present` | claim | credential | prover has a credential with the claim |

## Use

```js
import { CIRCUITS, ZKCell } from 'quilt-zk';

// Prove "my bank balance is at least $50,000" without revealing the actual value.
const cell = new ZKCell(
  'proof.balance',
  CIRCUITS.VALUE_AT_LEAST,
  { value: 75_000 },  // private
  { threshold: 50_000 }  // public
);

console.log(cell.verify());  // → true

// Prove "I voted" without revealing who I voted for.
const myVote = 'candidate-A';
const candidates = ['candidate-A', 'candidate-B', 'candidate-C'];
let setHash = 0;
const setStr = JSON.stringify([...candidates].sort());
for (const c of setStr) setHash = (setHash * 31 + c.charCodeAt(0)) >>> 0;

const voteProof = CIRCUITS.VALUE_IN_SET.prove(
  { value: myVote, set: candidates },
  { setHash }
);
console.log(voteProof.holds);  // → true

// Prove "this budget balances" without revealing the line items.
const lineItems = [120, 50, 30, 200];  // private
const sumProof = CIRCUITS.SUM_EQUALS.prove(
  { values: lineItems },
  { total: 400 }
);
console.log(sumProof.holds);  // → true
```

## Use cases

### Finance

- **Proof of solvency.** Prove "I have ≥ $X" without revealing the
  exact balance. Useful for loan applications, rentals, KYC.
- **Proof of income.** Prove "I earn ≥ $X/year" without revealing
  the actual income.
- **Audit compliance.** Prove "our total reserves cover our total
  liabilities" without revealing the reserves.
- **Tax.** Prove "I owe ≤ $X in taxes" without revealing the
  breakdown.

### Identity

- **Age verification.** Prove "I am ≥ 18" without revealing the
  birthday.
- **Citizenship.** Prove "I am a citizen of country X" without
  revealing the passport number.
- **Group membership.** Prove "I am an employee of company X"
  without revealing my identity.
- **Reputation.** Prove "I have ≥ 100 reputation points" without
  revealing the source.

### Voting

- **Eligibility.** Prove "I am eligible to vote" without revealing
  my identity.
- **Receipt-free voting.** Prove "I voted" without revealing how
  (this requires more sophisticated circuits).

### Web3 / blockchain

- **Private DeFi.** Prove "I can afford this loan" without
  revealing the collateral.
- **Anonymous credentials.** Prove "I have a valid token" without
  revealing which one.
- **Compliance.** Prove "I am not on a sanctions list" without
  revealing who I am.

### General

- **Source code audit.** Prove "this binary is built from this
  source" without revealing the source.
- **ML inference.** Prove "this model produced this output" without
  revealing the model weights.
- **File integrity.** Prove "I have a file with hash H" without
  revealing the file.

## Why this matters

A personal data mesh needs verifiable claims. The current generation
of personal-data tools can't make them without revealing the data.
ZK changes that. The proof is the new API for personal data.

This unlocks new applications:

- **Undercollateralized loans.** Prove you can afford the loan
  without revealing your finances.
- **Anonymous but verifiable credentials.** Prove you're a citizen
  without revealing your passport.
- **Compliance without surveillance.** Prove you're compliant
  without revealing the data.
- **Audits that preserve privacy.** Prove the books balance
  without revealing the entries.

## Status

Sketch only. The `Predicate` interface is a sketch. The real
implementation will:

1. **Use a real ZK backend.** Noir is the leading candidate
   (TypeScript-friendly, Rust backend, well-documented).
2. **Compile circuits from Quilt cells.** A cell with a
   `circuit: value_at_least` field automatically compiles to a
   Noir program.
3. **Generate proofs in the browser.** Use the browser's
   WebAssembly runtime (noir-js, snarkjs, etc.) to prove
   locally.
4. **Verify proofs anywhere.** A small verifier can run in
   any language; the proof itself is just bytes.
5. **Aggregate proofs.** Many small proofs can be combined
   into one (proof recursion).

## Related

- [Quilt (TypeScript)](https://github.com/SuperInstance/quilt) — the
  reactive runtime.
- [Quilt (Rust)](https://github.com/SuperInstance/quilt-rust) — the
  desktop runtime.
- [Quilt Live](https://github.com/SuperInstance/quilt-live) — the
  single-file browser runtime.
- [Quilt Time](https://github.com/SuperInstance/quilt-time) —
  time-travel for cells.
- [Quilt Vault](https://github.com/SuperInstance/quilt-vault) —
  encrypted cells.
- [Quilt 5-year roadmap](https://github.com/SuperInstance/quilt/blob/main/quilt-roadmap-2026.md).

## License

MIT.
