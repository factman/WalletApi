# WalletApi

Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

## Database Entity Relationship Diagram

> Click on the Image below to view the diagram in details

[![Database Entity Relationship Diagram](https://mermaid.ink/img/pako:eNrFWG1v4jgQ_itWPi06qAhvbfkWIKvjrtCK0j1phVSZZAgWic3ZTrts1f9-44SX0uZNe6tdvpBEz0zGM88zY-fF8oQPVt9qNBoLrpkOoU9GEAnyDw1D0GRENV1SBWROlyGoBfcEX7Ggv-AEf3oNERqELFjr9IlP5WaCLvtkRUMFC544BjliNJA0SkEPCqQiL-mN-Q3_dGaf2r0aYT7Zbuok3pCFNb2dk-nDzQ15eBiPFtYJ_cWZJQatbrdGIKIsPDfIxDZrZLsWHHJw7vRhQpSmOlZvX20ef1qG1NuETGnw68QHTIu5ULHaAvfN5RNItmLmKuaH61pGFGRLlXoW0i8L1ixMswi-5wc8uL29cZ0pYWpwCq8U65psfdmHWIr-e-dVxt7tlzYDBXoG_8ZMVrCaP4vP1NNCutzwK89g5Mzd-XjikpAqfSMCxg3wHcgA7ufO5I7EW59iNhyd4-6E9CRURO7rniLfoF4XPL24B6WY4P-D10d0jPoY-2T1wWLmfnZn7nTophK6YH4Wy4y5EwDXxTQj1PMw5rnYAC_L-xuo-22LpVWOrkJiH56YB-PSukJFpx30ybaO7yNYVWdXCYsPCZGwQr_rooxkQcsykkSOZdWHcIbYIDMIfMzGGfDMe6nFYaWZ8B_hfZGWXt8x32407H1z7yP8FpuXFgT_jEGKvZNixXCQ_H6VsIgGWVU44--KSaWnNIIqZDfNqSo2Yr4fwgGdg8RFBmbEyCoezfAqcEboSTRZ_LTtGlk-8SpvQthjOnYLstdMcceZmxMVYiagKXKMFvQI4ovlT-zlFTh95GkFTqdbpd9P6bQ62KpFzIuImNa7eYLG0RI5lruHGrnD8cS5QYo8trCqNKTcgzJs02BDBnxQiE-XXiNeLCVwb1fe0yXlClsdNpw7xu-hsOl2sOme4TOYeHKNznD_G-HgdNLE5Hs_V957uxxZH_P-0SCtQL6czq0GlG9yZkjRPtZk4QnqZBkKb2N2q4ynj2q_QFAHkVTQ05sS_1RRVRfU0fY5ibrAer-sTPukZsloRAfl6koUQyPDh0rQFUAlwXqhUIwHg2q6TUwEnmxKTSpKN2Gkt6acQ_jxaIVMfkwkugJZ36e7lrnFOdF_lD3oiqjviWi7P7etcHCZf3N4wzXWPrjQuy18dICnGabN8W_JzgP86_52SqI3Myx3xxjh2fgXTLEz2Z1pyf4jU3wTyneHV2TgD8rNsLDqViCZb_WTw37dikDivgDvrUS2CyukOxHrhWVsfRrIROWvaLal_KsQkdXXMkZDKeJgfXSTrmz_yeAISXZCQyMPq2-37MtW4sXqv1jf8EHv8qLTbbWve_aV3bab3au6tbP6jdaVfWG3L3uXzc41Nuvm1Wvd-p682L5o966ur5vdTrPb7HS63V7dMjUWcpJ-Ekm-jLz-B6pE2XY?type=png)](https://mermaid.live/edit#pako:eNrFWG1v4jgQ_itWPi06qAhvbfkWIKvjrtCK0j1phVSZZAgWic3ZTrts1f9-44SX0uZNe6tdvpBEz0zGM88zY-fF8oQPVt9qNBoLrpkOoU9GEAnyDw1D0GRENV1SBWROlyGoBfcEX7Ggv-AEf3oNERqELFjr9IlP5WaCLvtkRUMFC544BjliNJA0SkEPCqQiL-mN-Q3_dGaf2r0aYT7Zbuok3pCFNb2dk-nDzQ15eBiPFtYJ_cWZJQatbrdGIKIsPDfIxDZrZLsWHHJw7vRhQpSmOlZvX20ef1qG1NuETGnw68QHTIu5ULHaAvfN5RNItmLmKuaH61pGFGRLlXoW0i8L1ixMswi-5wc8uL29cZ0pYWpwCq8U65psfdmHWIr-e-dVxt7tlzYDBXoG_8ZMVrCaP4vP1NNCutzwK89g5Mzd-XjikpAqfSMCxg3wHcgA7ufO5I7EW59iNhyd4-6E9CRURO7rniLfoF4XPL24B6WY4P-D10d0jPoY-2T1wWLmfnZn7nTophK6YH4Wy4y5EwDXxTQj1PMw5rnYAC_L-xuo-22LpVWOrkJiH56YB-PSukJFpx30ybaO7yNYVWdXCYsPCZGwQr_rooxkQcsykkSOZdWHcIbYIDMIfMzGGfDMe6nFYaWZ8B_hfZGWXt8x32407H1z7yP8FpuXFgT_jEGKvZNixXCQ_H6VsIgGWVU44--KSaWnNIIqZDfNqSo2Yr4fwgGdg8RFBmbEyCoezfAqcEboSTRZ_LTtGlk-8SpvQthjOnYLstdMcceZmxMVYiagKXKMFvQI4ovlT-zlFTh95GkFTqdbpd9P6bQ62KpFzIuImNa7eYLG0RI5lruHGrnD8cS5QYo8trCqNKTcgzJs02BDBnxQiE-XXiNeLCVwb1fe0yXlClsdNpw7xu-hsOl2sOme4TOYeHKNznD_G-HgdNLE5Hs_V957uxxZH_P-0SCtQL6czq0GlG9yZkjRPtZk4QnqZBkKb2N2q4ynj2q_QFAHkVTQ05sS_1RRVRfU0fY5ibrAer-sTPukZsloRAfl6koUQyPDh0rQFUAlwXqhUIwHg2q6TUwEnmxKTSpKN2Gkt6acQ_jxaIVMfkwkugJZ36e7lrnFOdF_lD3oiqjviWi7P7etcHCZf3N4wzXWPrjQuy18dICnGabN8W_JzgP86_52SqI3Myx3xxjh2fgXTLEz2Z1pyf4jU3wTyneHV2TgD8rNsLDqViCZb_WTw37dikDivgDvrUS2CyukOxHrhWVsfRrIROWvaLal_KsQkdXXMkZDKeJgfXSTrmz_yeAISXZCQyMPq2-37MtW4sXqv1jf8EHv8qLTbbWve_aV3bab3au6tbP6jdaVfWG3L3uXzc41Nuvm1Wvd-p682L5o966ur5vdTrPb7HS63V7dMjUWcpJ-Ekm-jLz-B6pE2XY)

### Tables

- **users**
  Stores user account information such as email, phone, password, status, and verification flags.

- **profiles**
  Contains personal profile details for users, including name, address, BVN, date of birth, gender, and profile image. Each profile is linked to a user via `userId`.

- **wallets**
  Represents user wallets, holding balances, account numbers, currency, and settlement account details. Each wallet is linked to a user via `userId`.

- **sessions**
  Tracks user sessions for authentication, including tokens, device info, IP address, and two-factor verification status. Each session is linked to a user via `userId`.

- **transactions**
  Records all wallet transactions, including amounts, balances, fees, type (credit/debit), status, and references to the session, user, and wallet involved.

### Views

- **authenticatedUsers**
  A view that joins user and session data to provide a combined representation of an authenticated user, including session and user status fields.

- **usersProfiles**
  A view that joins user and profile data to provide a comprehensive user profile, combining account and personal information.

### Relationships

- Each **profile** references a **user** via `userId`.
- Each **wallet** references a **user** via `userId`.
- Each **session** references a **user** via `userId`.
- Each **transaction** references a **user** (`userId`) and a **wallet** (`walletId`).

#### Entity Relationship Summary

- **users** ←→ **profiles**: One-to-one (each user has one profile)
- **users** ←→ **wallets**: One-to-one (each user has one wallet)
- **users** ←→ **sessions**: One-to-one (each user has one sessions)
- **users** ←→ **transactions**: One-to-many (each user can have multiple transactions)
- **wallets** ←→ **transactions**: One-to-many (each wallet can have multiple transactions)
