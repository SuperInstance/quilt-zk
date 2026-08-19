# 🔮 quilt-zk

> **Zero-knowledge proofs over Quilt cell state. Prove statements about cells without revealing the cells.**

A sketch. The real implementation will use a real ZK library (Halo2, Plonky2, Noir, circom).

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-7%2F7-brightgreen)]()
[![Try it](https://img.shields.io/badge/try-live-7ec699)](https://superinstance.github.io/quilt/landing/quilt-zk.html)

**[→ Try ZK circuits live in your browser](https://superinstance.github.io/quilt/landing/quilt-zk.html)** — 4 interactive circuits, no install.

---

## ⚡ See it in 30 seconds

```yaml
id: balance-proof
title: "Prove my balance is above $50K"
version: 0.1.0
cells:
  - id: balance
    kind: value
    value: 75320
    private: true
    description: "Actual balance — kept secret"

  - id: threshold
    kind: value
    value: 50000
    description: "The minimum to prove"

  - id: proof
    kind: zk.prove
    circuit: range-proof
    witness: [balance, threshold]
    description: "Generate a ZK proof"

  - id: verified
    kind: zk.verify
    circuit: range-proof
    proof: proof
    description: "Verify the proof"
```

The output of `verified`: a single boolean — "yes, the balance is at least $50,000" — without revealing the balance.

---

## 🎬 The ZK pipeline, visualized

```
   ┌──────────────────────────────────────────────────────────────┐
   │                       quilt-zk                                │
   │                                                              │
   │   PRIVATE (you)                  PUBLIC (verifier)           │
   │   ─────────────                  ─────────────────           │
   │                                                              │
   │   ┌──────────────┐                ┌──────────────┐           │
   │   │  balance     │                │  threshold   │           │
   │   │  = 75320     │                │  = 50000     │           │
   │   │  (private)   │                │  (public)    │           │
   │   └──────┬───────┘                └──────┬───────┘           │
   │          │                               │                   │
   │          └───────────────┬───────────────┘                   │
   │                          ▼                                   │
   │                  ┌──────────────┐                            │
   │                  │  zk.prove    │                            │
   │                  │  (circuit)   │                            │
   │                  │              │                            │
   │                  │  witness:    │                            │
   │                  │   balance    │                            │
   │                  │   threshold  │                            │
   │                  └──────┬───────┘                            │
   │                         │                                    │
   │                         ▼                                    │
   │                  ┌──────────────┐                            │
   │                  │   proof      │─────── sent to verifier    │
   │                  │  (opaque)    │                            │
   │                  └──────────────┘                            │
   │                                                              │
   │   Verifier learns: "balance ≥ 50000" is true.                │
   │   Verifier does NOT learn: the actual balance.              │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

---

## 🎁 The 6 pre-built circuits

| Circuit | What it proves | Example use |
| --- | --- | --- |
| **`range-proof`** | `value >= min && value <= max` | "Balance ≥ $50K" |
| **`membership`** | `value ∈ set` | "I'm on the whitelist" |
| **`equality`** | `a == b` (without revealing either) | "Same person" |
| **`hash-preimage`** | `sha256(x) == h` | "I know the password" |
| **`signature`** | A signature is valid | "I have the key" |
| **`composite`** | Multiple statements, AND/OR | "Adult AND on whitelist" |

All 6 are sketched in the repo. The real implementation will use a real ZK library (Halo2, Plonky2, or Noir).

---

## 🏗️ Architecture

```
   ┌──────────────────────────────────────────────────────────────┐
   │                        quilt-zk                               │
   │                                                              │
   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
   │   │   Witness     │  │   Circuits   │  │   Proofs         │    │
   │   │              │  │              │  │                  │    │
   │   │   private:   │  │   range      │  │   opaque bytes   │    │
   │   │   public:    │  │   membership │─▶│   ~ 1 KB         │    │
   │   │   relation:  │  │   equality   │  │   ~ 100 ms prove │    │
   │   │              │  │   hash       │  │   ~ 10 ms verify │    │
   │   │              │  │   signature  │  │                  │    │
   │   │              │  │   composite  │  │                  │    │
   │   └──────────────┘  └──────────────┘  └──────────────────┘    │
   │            │                  │                    │        │
   │            └──────────────────┼────────────────────┘        │
   │                               ▼                             │
   │                      ┌──────────────────┐                    │
   │                      │   Cell API       │                    │
   │                      │   zk.prove       │                    │
   │                      │   zk.verify      │                    │
   │                      └──────────────────┘                    │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

Three structures, one cell surface:
- **Witness** — what's private, what's public
- **Circuits** — the relations to prove
- **Proofs** — the opaque output

---

## 💡 Use cases

| Use case | What you prove |
| --- | --- |
| **KYC without documents** | "I'm over 18, on the whitelist, and my SSN is valid" — without showing any of them |
| **Solvency** | "My assets exceed my liabilities by 200%" — without revealing the assets |
| **Voting** | "My vote is for candidate A, and I haven't voted before" |
| **Reputation** | "I have > 1000 reputation" — without revealing the exact number |
| **Age verification** | "I'm over 21" — without revealing the date of birth |
| **Audit** | "My accounts balance" — without showing every line item |
| **ZK-rollup** | "This batch of 1000 transactions is valid" — without revealing the transactions |

---

## 🛠️ Develop

```bash
git clone https://github.com/SuperInstance/quilt-zk
cd quilt-zk
node src/index.js test
```

7 tests, 0 failures. The 6 circuits are mocked — the API surface is real, the back-end is a sketch.

---

## 📚 API reference

```typescript
// zk.prove — generate a proof
interface ProveCell {
  kind: 'zk.prove';
  circuit: 'range-proof' | 'membership' | 'equality' | 'hash-preimage' | 'signature' | 'composite';
  witness: { private: any[]; public: any[] };
  output: { proof: Uint8Array; publicOutputs: any[] };
}

// zk.verify — verify a proof
interface VerifyCell {
  kind: 'zk.verify';
  circuit: string;
  proof: { proof: Uint8Array; publicOutputs: any[] };
  output: { valid: boolean };
}

// zk.circuit — define a custom circuit
interface CircuitCell {
  kind: 'zk.circuit';
  arithmetization: 'r1cs' | 'plonk' | 'stark';
  constraints: any[];  // the constraint system
}
```

---

## 🛣️ Roadmap

1. **Real circuit back-end** — Halo2 (Rust), Plonky2 (Rust), Noir (Rust) — pick one
2. **Trusted setup ceremony** — for the SNARKs that need it
3. **Recursive proofs** — proofs of proofs
4. **Universal circuits** — Plonky3 universal setup
5. **On-chain verifier** — Solidity contract for the verify cell
6. **WASM port** — run proofs in the browser
7. **GPU acceleration** — for batch proving

---

## 🔗 Related

- [Quilt (TypeScript)](https://github.com/SuperInstance/quilt) — the canonical reactive runtime
- [Quilt Vault](https://github.com/SuperInstance/quilt-vault) — encryption (ZK + encryption = provable privacy)
- [Quilt Mesh](https://github.com/SuperInstance/quilt-mesh) — peer-to-peer (ZK + mesh = anonymous peer-to-peer)
- [Quilt (Rust)](https://github.com/SuperInstance/quilt-rust) — the desktop runtime
- [Quilt Live](https://github.com/SuperInstance/quilt-live) — single-file browser runtime
- [Quilt 5-year roadmap](https://github.com/SuperInstance/quilt/blob/main/quilt-roadmap-2026.md)

## License

MIT.
