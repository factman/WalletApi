# WalletApi

Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

## Database Entity Relationship Diagram

> Click on the Image below to view the diagram in details

[![Database Entity Relationship Diagram](https://mermaid.ink/img/pako:eNrFWG1v4jgQ_itWPi06qAgFSvMthayud4VWFHrSCakyyQAWic3ZTrts1f9-44TXNm-6W-32C270zGQ88zwzdt4sXwRgOVaj0ZhxzXQIDhlAJMhfNAxBkwHVdE4VkAmdh6Bm3Bd8wZbOjBP80yuI0CCgcp0-MKshenSIljGcgJ6oZImHnaX5CxmHvgiFdMjrimmEJ1GAHDC6lDRKkVMFUpG3o1n_d3f85bJbIywgm3WdxGsys0b3EzKa3t2R6fR2MLOO6Cd3nBi0Op0agYiy8NwgE9uskc1KcMjBeaPpkChNdaxOX20ef5mH1F-HTGkI6iQAzKFZqFhtgAdm-QKSLZhZxXy_rmVEQTZUqVchg7JgzcY0i-B7fsA39_d3njsiTN0cwyvFeiZbT7sQS9F_bv3K2Ifd1sagQI_hn5jJClaTV_GV-lpIjxsq5RkM3Ik3uR16JKRK34kl4wb4AWQAjxN3-EDiTUAxG67OcXdE-hIqInd1T5EnqPcZTxePoBQT_H_w-oCOUR-3AVl8shh7X72xN-p7qYQuWJDFMmPuLoHrYpoR6vsY80SsgZfl_QTqfdtgaZWrq5A4gBfmw21pXaGi0zb6ZBs3CBCsqrOrhMX7hEhYoN9VUUayoGUZSSLHsup9OH1spxkEPmTjDHjmvdRiv9NM-H_hfZGW3j8w32407F1zdxB-j81LC4I_xiDFPkixYDgzfr1KWESXWVU44--CSaVHNIIqZDfNqSo2YkEQwh6dg8RNLs2IkVU8muFV4IzQo2iy-GnbNTJ_4VXehLDndOwWZK-Z4g4zNycqxAxBU-QYLegRJBDzH9jLK3D6wNMKnE7PVb-e0ml1sFWLmBcRMa138wiNozlyLPcMNfD6t0P3Diny3MKq0pByH8qwTYMNGfCbQny69RrxYymB-9vyni4pV9jqsOE8MP4IhU23jU33DJ_BxKNrdIaH5QgHp5smJt_7ufI-2uXI-pD3zwZpBfLldG51Q_k6Z4YUnWNNFl6gTuah8NfmtMp4-qj2EwS1F0kFPZ2U-IeKqrqgDravSdQF1rttZdonNUtGIzooV1eiGBoZPlSCLgAqCdYPhWJ8eVNNt4mJwJtNqUlF6SaM9FeUcwg_X62Qyc-JRBcg67t01zKPOEf6D7IHXRH1fRFtdve2BQ4u82sub7jH2icXeruBzw7wNsO0uf7N2XmAfzzej0h0MsNyT4wR3qR_whQ7k92ZluzfMsU3pHy7f0UGfq_cDAurbi0lCyxnQUMFdSsCiecC_N9KZDuzQroVsZ5ZxjagS5mo_B3NNpT_LURkOeajQt2SIl6uDm7Sne0-GRwgyUmob-RhOXar1WonXiznzfqGD7pXF-1O6_K6a_fsS7vZ6dWtreU0Wj37wr686l4129fYrJu997r1PXmxfXHZ7V1fNzvtZqfZbnc63bplaizkMP1-knxGef8XNcHnzw?type=png)](https://mermaid.live/edit#pako:eNrFWG1v4jgQ_itWPi06qAgFSvMthayud4VWFHrSCakyyQAWic3ZTrts1f9-44TXNm-6W-32C270zGQ88zwzdt4sXwRgOVaj0ZhxzXQIDhlAJMhfNAxBkwHVdE4VkAmdh6Bm3Bd8wZbOjBP80yuI0CCgcp0-MKshenSIljGcgJ6oZImHnaX5CxmHvgiFdMjrimmEJ1GAHDC6lDRKkVMFUpG3o1n_d3f85bJbIywgm3WdxGsys0b3EzKa3t2R6fR2MLOO6Cd3nBi0Op0agYiy8NwgE9uskc1KcMjBeaPpkChNdaxOX20ef5mH1F-HTGkI6iQAzKFZqFhtgAdm-QKSLZhZxXy_rmVEQTZUqVchg7JgzcY0i-B7fsA39_d3njsiTN0cwyvFeiZbT7sQS9F_bv3K2Ifd1sagQI_hn5jJClaTV_GV-lpIjxsq5RkM3Ik3uR16JKRK34kl4wb4AWQAjxN3-EDiTUAxG67OcXdE-hIqInd1T5EnqPcZTxePoBQT_H_w-oCOUR-3AVl8shh7X72xN-p7qYQuWJDFMmPuLoHrYpoR6vsY80SsgZfl_QTqfdtgaZWrq5A4gBfmw21pXaGi0zb6ZBs3CBCsqrOrhMX7hEhYoN9VUUayoGUZSSLHsup9OH1spxkEPmTjDHjmvdRiv9NM-H_hfZGW3j8w32407F1zdxB-j81LC4I_xiDFPkixYDgzfr1KWESXWVU44--CSaVHNIIqZDfNqSo2YkEQwh6dg8RNLs2IkVU8muFV4IzQo2iy-GnbNTJ_4VXehLDndOwWZK-Z4g4zNycqxAxBU-QYLegRJBDzH9jLK3D6wNMKnE7PVb-e0ml1sFWLmBcRMa138wiNozlyLPcMNfD6t0P3Diny3MKq0pByH8qwTYMNGfCbQny69RrxYymB-9vyni4pV9jqsOE8MP4IhU23jU33DJ_BxKNrdIaH5QgHp5smJt_7ufI-2uXI-pD3zwZpBfLldG51Q_k6Z4YUnWNNFl6gTuah8NfmtMp4-qj2EwS1F0kFPZ2U-IeKqrqgDravSdQF1rttZdonNUtGIzooV1eiGBoZPlSCLgAqCdYPhWJ8eVNNt4mJwJtNqUlF6SaM9FeUcwg_X62Qyc-JRBcg67t01zKPOEf6D7IHXRH1fRFtdve2BQ4u82sub7jH2icXeruBzw7wNsO0uf7N2XmAfzzej0h0MsNyT4wR3qR_whQ7k92ZluzfMsU3pHy7f0UGfq_cDAurbi0lCyxnQUMFdSsCiecC_N9KZDuzQroVsZ5ZxjagS5mo_B3NNpT_LURkOeajQt2SIl6uDm7Sne0-GRwgyUmob-RhOXar1WonXiznzfqGD7pXF-1O6_K6a_fsS7vZ6dWtreU0Wj37wr686l4129fYrJu997r1PXmxfXHZ7V1fNzvtZqfZbnc63bplaizkMP1-knxGef8XNcHnzw)

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
