# WalletApi

Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

## Database Entity Relationship Diagram

> Click on the Image below to view the diagram in details

[![Database Entity Relationship Diagram](https://mermaid.ink/img/pako:eNrdWW1v4jgQ_itWPi06iqAFtss3Clld7wqtKO1JJ6TKJAYsEptznHbZqv_9xg6EvMfVbk-r6xdS-3nGk_G8eJxXy-EusQbW2dnZgkkqPTJAY-Jz9Bf2PCLRGEu8xAFBc7z0SLBgDmcruh4sGII_uSE-EFwsttGAepqAxAGSIiQJ0CMWVEs4MNWfRxkZcY-LAXrZUAlwrQURY4rXAvsR8iEgInjSy6PXE3n0-3D26aLfQNRFu20ThVu0sKa3czR9uLlBDw_X44V1Qj8OZ5pw3us1EPEx9dKEQmy7gXYbzkg51J4-TFAgsQyD5Opq-NPSw87Wo4EkbhO5BIypHoIw2BHmqsdnIuiKqqeQHZ8bBYqgHQ6CFy7cOn3Vu0nqk-9K52Ls1e3tjT2cIhpcndSrxdrKYI8HFWvRf-4dY-zd4dVmJCByRv4JqTBgzV_4V-xILmym3KKMMB7O7fn1xEYeDuQNX1OmgGWgcOdiMMZQ1klzBDEDHjY9AiZAbwsWPdyTIKCc_bB3x-gQYuXaRascY2Z_tWf2dGQnw6lF3SJ3U0KGa8Jktb8h7Dig_5xvCauzRAJqf9vBHgdDaeLNLnmmDrmu3WBiKLQLMulu6LoADszdrMadjwYRZAVyN1UWKYLWWURrDpsrj-qMIMFWeXIKmJJeyzi-aTXcOAKqYuqtMAY6Z2edVMofAPUW8pnkCH4UOeLdCb6iUE9-rdihPl4X7U3Kq1dUBHKKfWISAip3mWJ96roeOaJLkPCqa1WBhIlEVdsqhCF8CqUir-10Gmj5zExWAthTVJgrrNeOcFFVzuP-uL-dKsCESAyOhyvcE7l8-dMSvYGbZ9zV2M2jY9iv5eXRhkFO5yGr8s3IBdonaOgvwe1KT1Nje3Q9Gd6A1zydw0ZjDzOHGGE9SthVJT4yQAM5oRCEOfv65C8wCyAnQm66o-yeVGbnLmTnFL7AOU-iQRics32osMPIMOXS08GY5ZVEemz3PCHagfIIS7OuMNuWFJuqk6-ywjNpoqXHna0631IWDTU-PMzS4WIcZYnN_oBQe2-YxRJe9NtUyEi9bqEUvZ-6woIYw8jDvvIVI-iKmAWo4_GAsvXVO2KaQ59USzEMa-2tzgYzRrx8owZe_qTDd0VE82D0Ylc9hca4uC5WhYXD_d2hC1xBnVO_qhWEd2zkRMj9juQFQG9EpWomlzStoC58fqLqlR47fWjQP7zupUKyILY6v1UE5gSz_XG1Um46zgvYEX8Yyg1sFnWUmtF6j5S8JIO7rN9In0tbx5maS4WFlQxrPWbSh2QWi6dMWvdUHknOmfXyaXpq1qS9T9MTc-_r99NiClHGVwFZY-YwtXcESW3i8eorojRJj5VkEK1csivL6Bv3soUl4ZTM8y_qlmeipHLRoMkNUpJ1HK67McgoFU9VlcjM_ruZol4Wxbq8Z_rHfIWvlWByQFCY-AhfkkISzVD6tN_C-WjOtEcZAgyWNCwZIAz-nIyUa0wzC8VTdS1lhheNV7XKGYIe_t_lvYI0lZbwgTkqc4uQsfdxxuxSIUM-zf1QdozzwS4Sr1NC1i_c2kuKDEMP_9cp8Z2pLZFXjDNSOS9zyZCnWk1rLahrDVbYC0jT8okAx4f_LZ3OFpaH9zyEXK2oLl4LYDWjGf0V5zghtkraG4jbYfY35741UN97mpbg4XoTi4_Oh4evOTFEZ4SRajGsQefiS7-jpViDV-sbDPQvW70vvW73_LL9-aLXb_ea1t4a9C9alxdfzju9Xqfb7V_2-m9N67tet926_AwYdTLmYhJ9zNLftN7-Bas296Y?type=png)](https://mermaid.live/edit#pako:eNrdWW1v4jgQ_itWPi06iqAFtss3Clld7wqtKO1JJ6TKJAYsEptznHbZqv_9xg6EvMfVbk-r6xdS-3nGk_G8eJxXy-EusQbW2dnZgkkqPTJAY-Jz9Bf2PCLRGEu8xAFBc7z0SLBgDmcruh4sGII_uSE-EFwsttGAepqAxAGSIiQJ0CMWVEs4MNWfRxkZcY-LAXrZUAlwrQURY4rXAvsR8iEgInjSy6PXE3n0-3D26aLfQNRFu20ThVu0sKa3czR9uLlBDw_X44V1Qj8OZ5pw3us1EPEx9dKEQmy7gXYbzkg51J4-TFAgsQyD5Opq-NPSw87Wo4EkbhO5BIypHoIw2BHmqsdnIuiKqqeQHZ8bBYqgHQ6CFy7cOn3Vu0nqk-9K52Ls1e3tjT2cIhpcndSrxdrKYI8HFWvRf-4dY-zd4dVmJCByRv4JqTBgzV_4V-xILmym3KKMMB7O7fn1xEYeDuQNX1OmgGWgcOdiMMZQ1klzBDEDHjY9AiZAbwsWPdyTIKCc_bB3x-gQYuXaRascY2Z_tWf2dGQnw6lF3SJ3U0KGa8Jktb8h7Dig_5xvCauzRAJqf9vBHgdDaeLNLnmmDrmu3WBiKLQLMulu6LoADszdrMadjwYRZAVyN1UWKYLWWURrDpsrj-qMIMFWeXIKmJJeyzi-aTXcOAKqYuqtMAY6Z2edVMofAPUW8pnkCH4UOeLdCb6iUE9-rdihPl4X7U3Kq1dUBHKKfWISAip3mWJ96roeOaJLkPCqa1WBhIlEVdsqhCF8CqUir-10Gmj5zExWAthTVJgrrNeOcFFVzuP-uL-dKsCESAyOhyvcE7l8-dMSvYGbZ9zV2M2jY9iv5eXRhkFO5yGr8s3IBdonaOgvwe1KT1Nje3Q9Gd6A1zydw0ZjDzOHGGE9SthVJT4yQAM5oRCEOfv65C8wCyAnQm66o-yeVGbnLmTnFL7AOU-iQRics32osMPIMOXS08GY5ZVEemz3PCHagfIIS7OuMNuWFJuqk6-ywjNpoqXHna0631IWDTU-PMzS4WIcZYnN_oBQe2-YxRJe9NtUyEi9bqEUvZ-6woIYw8jDvvIVI-iKmAWo4_GAsvXVO2KaQ59USzEMa-2tzgYzRrx8owZe_qTDd0VE82D0Ylc9hca4uC5WhYXD_d2hC1xBnVO_qhWEd2zkRMj9juQFQG9EpWomlzStoC58fqLqlR47fWjQP7zupUKyILY6v1UE5gSz_XG1Um46zgvYEX8Yyg1sFnWUmtF6j5S8JIO7rN9In0tbx5maS4WFlQxrPWbSh2QWi6dMWvdUHknOmfXyaXpq1qS9T9MTc-_r99NiClHGVwFZY-YwtXcESW3i8eorojRJj5VkEK1csivL6Bv3soUl4ZTM8y_qlmeipHLRoMkNUpJ1HK67McgoFU9VlcjM_ruZol4Wxbq8Z_rHfIWvlWByQFCY-AhfkkISzVD6tN_C-WjOtEcZAgyWNCwZIAz-nIyUa0wzC8VTdS1lhheNV7XKGYIe_t_lvYI0lZbwgTkqc4uQsfdxxuxSIUM-zf1QdozzwS4Sr1NC1i_c2kuKDEMP_9cp8Z2pLZFXjDNSOS9zyZCnWk1rLahrDVbYC0jT8okAx4f_LZ3OFpaH9zyEXK2oLl4LYDWjGf0V5zghtkraG4jbYfY35741UN97mpbg4XoTi4_Oh4evOTFEZ4SRajGsQefiS7-jpViDV-sbDPQvW70vvW73_LL9-aLXb_ea1t4a9C9alxdfzju9Xqfb7V_2-m9N67tet926_AwYdTLmYhJ9zNLftN7-Bas296Y)

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
