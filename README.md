# Double-Entry Ledger API

A backend service implementing a **double-entry accounting ledger**.

## Prerequisites

- Node.js ≥ 20

  ```
  nvm use
  ```

## Installation

Install dependencies:

```
npm install
```

## Running the Application

To run the API on port 5000:

```
npm run start:dev
```

## Running Tests

```
npm run test
```

---

### Assumptions:

- Account names are not unique.
- Transaction name are not unique.
- Account balances can go into the negative.

### Considerations:

- In a production setup, the transaction create process would be wrapped in a database transaction for atomicity, i.e. creating the transaction and entry records and recalculating the account balances. This has been marked (commented) in the Transaction Service.
- In a production setup, entry records would be append-only and records should be immutable.
- Considering the assumption that account balances can go into the negative and the fact that we're replaying historical entries to derive the balance, row locking (accounts) is not necessary.

### Notes:

- Storage/persistence is encapsulated in a dedicated module to allow swapping the in-memory implementation for a real database without affecting ledger logic.
- Transaction validity is enforced by requiring the sum of debit entry amounts to exactly equal the sum of credit entry amounts, amongst account and transaction checks.
- The account balance is derived by replaying all entries, and not stored as mutable state.
