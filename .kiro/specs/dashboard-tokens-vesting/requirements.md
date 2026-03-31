# Requirements Document

## Introduction

This feature adds fully functional "My Tokens" and "Vesting" tabs to the MicroLeague dashboard
(`microleague-gateway-main`). Both tabs surface on-chain presale data to the connected user.

"My Tokens" shows the user's total MLC allocation, purchase history, and a breakdown of claimed
vs. locked tokens.

"Vesting" shows each vesting schedule created by the presale contract, including cliff dates,
unlock progress, and a one-click claim flow.

Supporting changes are required across two backend services:

- `microleague_listner` indexes blockchain events and writes presale data to the shared
  `microleague_be` database. It does **not** expose public REST APIs for the frontend.
- `microleague_be` owns and exposes **all** REST API endpoints for token and vesting data.
  The presale-related Prisma models (`User` presale fields, `PresaleTxs`, `VestingSchedule`,
  `ListenerState`, `FailedEvent`) must be added to the `microleague_be` Prisma schema so both
  services share a single database.

The frontend (`microleague-gateway-main`) calls `microleague_be` APIs only — it never calls the
listener directly.

## Glossary

- **Dashboard**: The React SPA served by `microleague-gateway-main`.
- **BE_Service**: The NestJS/Express backend `microleague_be` that owns all presale REST APIs and
  the shared PostgreSQL database. The listener writes presale data to this same database.
- **Listener**: The NestJS service `microleague_listner` that indexes blockchain events and writes
  records to the shared BE_Service database. It does not expose public REST APIs for the frontend.
- **Presale_Contract**: The `TokenPresale` smart contract deployed on-chain (address from `VITE_PRESALE_ADDRESS`).
- **MLC**: The sale token distributed through the presale.
- **Vesting_Schedule**: A per-buyer, per-stage record created by the Presale_Contract encoding `totalAmount`, `cliff`, `duration`, `releaseInterval`, `startTime`, and `claimed`.
- **Wallet_Address**: The lowercase hex Ethereum address of the connected user.
- **Token_Summary**: An aggregate record containing `tokensPurchased`, `claimed`, `unclaimed`, and `amountSpent` for a given Wallet_Address.
- **My_Tokens_Tab**: The dashboard tab with id `"tokens"`.
- **Vesting_Tab**: The dashboard tab with id `"vesting"`.
- **Tokens_Service**: The frontend module `src/services/tokens.ts` responsible for calling BE_Service APIs using the `VITE_BE_API_URL` environment variable.


## Requirements

### Requirement 1: My Tokens Tab — Token Summary Cards

**User Story:** As a presale participant, I want to see my total MLC holdings at a glance, so that I know how many tokens I own, how many are locked, and how many I have already claimed.

#### Acceptance Criteria

1. WHEN a user navigates to the My_Tokens_Tab with a connected wallet, THE Dashboard SHALL display four summary cards: Total MLC Allocated, Total Claimed, Currently Claimable, and Locked Tokens.
2. THE Dashboard SHALL derive Total MLC Allocated from the `totalAllocated(address)` view on the Presale_Contract.
3. THE Dashboard SHALL derive Total Claimed from the `totalClaimed(address)` view on the Presale_Contract.
4. THE Dashboard SHALL derive Currently Claimable from the `claimableAmount(address)` view on the Presale_Contract.
5. THE Dashboard SHALL compute Locked Tokens as `max(0, totalAllocated - totalClaimed - claimableAmount)`.
6. FOR ALL connected wallets, the invariant `totalAllocated >= totalClaimed + claimableAmount` SHALL hold in the displayed values (Locked Tokens is never negative).
7. WHILE the contract data is loading, THE Dashboard SHALL display skeleton placeholder cards in place of the summary cards.
8. IF the wallet is not connected, THEN THE My_Tokens_Tab SHALL display a "Connect your wallet to view your token holdings" prompt instead of the summary cards.

### Requirement 2: My Tokens Tab — Purchase Transaction History

**User Story:** As a presale participant, I want to see a list of all my token purchases, so that I can verify each transaction and track my investment history.

#### Acceptance Criteria

1. WHEN a user navigates to the My_Tokens_Tab with a connected wallet, THE Dashboard SHALL fetch purchase transactions from the BE_Service endpoint `GET /transactions/address/:walletAddress` with `type=Buy`.
2. THE Dashboard SHALL display each transaction as a table row showing: date, stage, MLC amount, USD value, payment token, and a truncated tx hash that links to the block explorer.
3. THE Dashboard SHALL support pagination with a page size of 10 transactions per page.
4. WHEN the BE_Service API returns an empty array, THE Dashboard SHALL display a "No purchase history found" empty state.
5. IF the BE_Service API call fails, THEN THE Dashboard SHALL display an error message and a retry button.
6. WHILE the transaction list is loading, THE Dashboard SHALL display a loading skeleton in place of the table.
7. THE BE_Service SHALL expose `GET /transactions/address/:walletAddress` without requiring authentication, filtering results to only the records matching the given Wallet_Address.

### Requirement 3: My Tokens Tab — Backend Token Summary Endpoint

**User Story:** As a frontend developer, I want a single API endpoint that returns a user's aggregated token data, so that the dashboard can display accurate off-chain totals without multiple round-trips.

#### Acceptance Criteria

1. THE BE_Service SHALL expose `GET /user/wallet/:walletAddress` returning a JSON object with fields: `walletAddress`, `tokensPurchased`, `claimed`, `unclaimed`, `amountSpent`, `joinDate`, and `lastActivity`.
2. WHEN a Wallet_Address has no records in the database, THE BE_Service SHALL return HTTP 404 with a descriptive error message.
3. THE BE_Service SHALL normalize the Wallet_Address to lowercase before querying the database.
4. FOR ALL Wallet_Addresses, the invariant `tokensPurchased >= claimed + unclaimed` SHALL hold in the returned Token_Summary (values are never negative).

### Requirement 4: Vesting Tab — Vesting Schedule Display

**User Story:** As a presale participant, I want to see all my vesting schedules with unlock dates and progress, so that I know when my tokens will become available.

#### Acceptance Criteria

1. WHEN a user navigates to the Vesting_Tab with a connected wallet, THE Dashboard SHALL read `getVestingSchedulesCount(address)` from the Presale_Contract to determine the number of schedules.
2. FOR EACH schedule index from 0 to count-1, THE Dashboard SHALL call `getVestingSchedule(address, index)` and display: total amount, claimed amount, vested-so-far amount, claimable amount, start time, cliff end date, duration end date, and release interval.
3. THE Dashboard SHALL display a visual progress bar for each schedule showing the percentage of tokens vested so far relative to the total amount.
4. THE Dashboard SHALL label each schedule's status as one of: "Cliff Period" (before cliff end), "Vesting" (after cliff, before fully vested), or "Fully Vested" (all tokens vested).
5. WHILE the vesting schedule data is loading, THE Dashboard SHALL display skeleton cards in place of the schedule list.
6. IF the wallet is not connected, THEN THE Vesting_Tab SHALL display a "Connect your wallet to view your vesting schedules" prompt.
7. WHEN `getVestingSchedulesCount` returns 0, THE Dashboard SHALL display a "No vesting schedules found. Purchase MLC tokens to create a vesting schedule." message.

### Requirement 5: Vesting Tab — Claim Flow

**User Story:** As a presale participant, I want to claim my vested MLC tokens directly from the dashboard, so that I can receive my tokens without using a separate tool.

#### Acceptance Criteria

1. WHEN a schedule has a claimable amount greater than 0, THE Dashboard SHALL display an active "Claim Tokens" button for that schedule.
2. WHEN a schedule has a claimable amount of 0, THE Dashboard SHALL display a disabled "Claim Tokens" button with a tooltip showing the next unlock date.
3. WHEN the user clicks "Claim Tokens", THE Dashboard SHALL display a confirmation modal showing the claimable amount before submitting the transaction.
4. WHEN the user confirms the claim, THE Dashboard SHALL call the `claim()` function on the Presale_Contract via wagmi `writeContract`.
5. WHILE the claim transaction is pending, THE Dashboard SHALL display a "Processing..." state on the button and disable further interactions.
6. WHEN the claim transaction is confirmed on-chain, THE Dashboard SHALL refresh the vesting schedule data and display a success notification.
7. IF the claim transaction fails, THEN THE Dashboard SHALL display an error notification with the failure reason and restore the button to its active state.
8. THE Dashboard SHALL check `claimEnabled()` on the Presale_Contract before showing the claim button; IF claiming is not enabled, THEN THE Dashboard SHALL display a "Claiming not yet enabled" notice instead of the claim button.


### Requirement 6: Listener — VestingScheduleCreated Event Tracking

**User Story:** As a backend developer, I want the listener to index VestingScheduleCreated events and persist them to the shared database, so that the BE_Service API can serve vesting data without requiring the frontend to make multiple contract calls.

#### Acceptance Criteria

1. THE Listener SHALL handle the `VestingScheduleCreated(buyer, scheduleId, amount, startTime, cliff, duration)` event emitted by the Presale_Contract.
2. WHEN a `VestingScheduleCreated` event is processed, THE Listener SHALL upsert a `VestingSchedule` record in the BE_Service database with fields: `walletAddress`, `scheduleId`, `totalAmount`, `startTime`, `cliff`, `duration`, `releaseInterval`, `claimed` (default 0), `contract`.
3. WHEN a `Claimed` event is processed, THE Listener SHALL update the `claimed` field on the matching `VestingSchedule` records for that buyer in the BE_Service database.
4. THE BE_Service SHALL expose `GET /vesting/:walletAddress` returning an array of all `VestingSchedule` records for the given address.
5. THE BE_Service SHALL expose `GET /vesting/:walletAddress/summary` returning: `totalAllocated`, `totalClaimed`, `totalUnclaimed`, and `scheduleCount` aggregated across all schedules for the address.
6. FOR ALL processed `VestingScheduleCreated` events, the round-trip property SHALL hold: the data stored in the BE_Service database SHALL match the event arguments emitted by the Presale_Contract.
7. IF a `VestingScheduleCreated` event has already been processed (duplicate eventId), THEN THE Listener SHALL skip reprocessing without error.
8. THE Listener SHALL connect to the BE_Service database using the `DATABASE_URL` environment variable pointing to the shared `microleague_be` PostgreSQL instance.

### Requirement 7: Frontend — Tokens Service Module

**User Story:** As a frontend developer, I want a dedicated service module for token and vesting API calls, so that API logic is separated from UI components and can be reused across the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a `src/services/tokens.ts` module that exports functions: `getTokenSummary(walletAddress)`, `getTokenTransactions(walletAddress, page, limit)`, `getVestingSchedules(walletAddress)`, and `getVestingSummary(walletAddress)`.
2. THE `getTokenSummary` function SHALL call `GET /user/wallet/:walletAddress` on the BE_Service and return a typed `TokenSummary` object.
3. THE `getTokenTransactions` function SHALL call `GET /transactions/address/:walletAddress` with `type=Buy` query param on the BE_Service and return a typed `TransactionPage` object.
4. THE `getVestingSchedules` function SHALL call `GET /vesting/:walletAddress` on the BE_Service and return a typed array of `VestingScheduleRecord` objects.
5. THE `getVestingSummary` function SHALL call `GET /vesting/:walletAddress/summary` on the BE_Service and return a typed `VestingSummary` object.
6. THE Tokens_Service SHALL read the BE_Service base URL from the `VITE_BE_API_URL` environment variable, falling back to `http://localhost:3000/api/v1`.

### Requirement 8: Network and Chain Guard

**User Story:** As a user, I want the tokens and vesting tabs to warn me when I am on the wrong network, so that I do not see stale or incorrect data.

#### Acceptance Criteria

1. WHILE the connected wallet's chain ID does not match `APP_CHAIN.id`, THE My_Tokens_Tab and Vesting_Tab SHALL display a "Wrong Network" banner with a "Switch Network" button instead of token data.
2. WHEN the user switches to the correct network, THE Dashboard SHALL automatically reload the contract data for both tabs.
3. THE Dashboard SHALL reuse the existing `isOnCorrectChain` logic already present in `UserDashboard` for this guard.
