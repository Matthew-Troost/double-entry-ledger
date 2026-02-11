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

## Running the API

To run the API on port 5000:

```
npm run start:dev
```

#### Creating an account:

```bash
curl --location --request POST \
  --url localhost:5000/accounts \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "name": "Test Account 1",
    "direction": "debit",
    "id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd"
  }'
```

#### Getting an account:

```bash
curl --location --request GET \
  --url 'localhost:5000/accounts/71cde2aa-b9bc-496a-a6f1-34964d05e6fd' \
  --header 'Accept: application/json'
```

#### Creating a transaction:

```bash
curl --location --request POST \
     --url 'localhost:5000/transactions' \
     --header 'Content-Type: application/json' \
     --data-raw '{
       "name": "test",
       "entries": [
         {
           "direction": "debit",
           "account_id": "71cde2aa-b9bc-496a-a6f1-34964d05e6fd",
           "amount": 100
         },
         {
           "direction": "credit",
           "account_id": "dbf17d00-8701-4c4e-9fc5-6ae33c324309",
           "amount": 100
         }
       ]
     }'
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
- Only catering for USD and at most 2 decimal places. If other currencies need to be supported, especially crypto currencies, we'd need to ensure precision around decimal places.

### Considerations:

- In a production setup, the transaction create process would be wrapped in a database transaction for atomicity, i.e. creating the transaction and entry records and recalculating the account balances. This has been marked (commented) in the Transaction Service.
- In a production setup, entry records would be append-only and records should be immutable.
- Considering the assumption that account balances can go into the negative and the fact that we're replaying historical entries to derive the balance, row locking (accounts) is not necessary.

### Notes:

- Storage/persistence is encapsulated in a dedicated module to allow swapping the in-memory implementation for a real database without affecting ledger logic.
- Transaction validity is enforced by requiring the sum of debit entry amounts to exactly equal the sum of credit entry amounts, amongst account and transaction checks.
- The account balance is derived by replaying all entries, and not stored as mutable state.
