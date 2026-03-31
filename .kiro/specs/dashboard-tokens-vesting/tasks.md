# Implementation Plan: Dashboard Tokens & Vesting

## Overview

Implement the My Tokens and Vesting tabs across three services in the following order:
1. `microleague_be` — Prisma schema additions and migration
2. `microleague_be` — New REST controllers and services
3. `microleague_listner` — Reconfigure to shared DB + new event handlers
4. `microleague-gateway-main` — Frontend service module and UI components

All property-based tests use [fast-check](https://github.com/dubzzz/fast-check).

---

## Tasks

- [x] 1. Add presale models to microleague_be Prisma schema
  - In `microleague_be/prisma/schema.prisma`, add the `PresaleTxType` enum and the following models: `PresaleUser`, `PresaleTx`, `VestingSchedule`, `ListenerState`, `FailedEvent`
  - Use the exact model definitions from the design document (table names: `presale_users`, `presale_txs`, `vesting_schedules`, `listener_state`, `failed_events`)
  - `PresaleTx` has a `@@index([address])` and `@@index([type])`; `VestingSchedule` has `@@unique([walletAddress, scheduleId, contract])` and `@@index([walletAddress])`
  - Run `npx prisma migrate dev --name add-presale-models` inside `microleague_be` to generate and apply the migration
  - _Requirements: 3.1, 6.2, 6.4_

- [x] 2. Write one-time data migration script for listener → BE database
  - Create `microleague_be/scripts/migrate-listener-data.ts` that reads all `User` (presale fields) and `PresaleTxs` records from the listener's PostgreSQL instance and upserts them into `presale_users` and `presale_txs` in the BE database
  - Script accepts `LISTENER_DATABASE_URL` and `DATABASE_URL` as env vars; logs counts of migrated records
  - _Requirements: 6.8 (migration strategy from design)_

- [x] 3. Implement presaleUserService and its controller in microleague_be
  - Create `microleague_be/src/services/presaleUserService.ts` with:
    - `getByWalletAddress(walletAddress: string)` — normalizes address to lowercase, queries `PresaleUser`, throws 404 if not found
  - Create `microleague_be/src/controllers/presaleUser.ts` with a handler for `GET /user/wallet/:walletAddress` returning `PresaleUserDto`; return HTTP 400 for invalid address format, HTTP 404 for unknown address
  - Register the route in `microleague_be/src/router.ts`: `router.get('/user/wallet/:walletAddress', getPresaleUser)`
  - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.1 Write property test for wallet address normalization (P6)
    - **Property 6: Wallet address normalization**
    - **Validates: Requirements 3.3**
    - Use `fc.string()` as mixed-case address input; assert service normalizes to `input.toLowerCase()` before querying

  - [ ]* 3.2 Write property test for PresaleUser response shape (P5)
    - **Property 5: PresaleUser response shape**
    - **Validates: Requirements 3.1**
    - Use `fc.hexaString()` as walletAddress; assert response contains all required fields: `walletAddress`, `tokensPurchased`, `claimed`, `unclaimed`, `amountSpent`, `joinDate`, `lastActivity`

  - [ ]* 3.3 Write property test for token summary non-negativity invariant (P7)
    - **Property 7: Token summary non-negativity invariant**
    - **Validates: Requirements 3.4**
    - Use `fc.record({ tokensPurchased: fc.float({min:0}), claimed: fc.float({min:0}), unclaimed: fc.float({min:0}) })` with constraint `tokensPurchased >= claimed + unclaimed`; assert all values `>= 0`

- [x] 4. Implement transactionsService and its controller in microleague_be
  - Create `microleague_be/src/services/transactionsService.ts` with:
    - `findByAddress(walletAddress: string, type?: string, page?: number, limit?: number)` — normalizes address to lowercase, queries `PresaleTx` with optional `type` filter, returns paginated `TransactionPageDto`
  - Create `microleague_be/src/controllers/transactions.ts` with a handler for `GET /transactions/address/:walletAddress` accepting `type`, `page`, `limit` query params
  - Register the route in `microleague_be/src/router.ts`: `router.get('/transactions/address/:walletAddress', getTransactionsByAddress)`
  - _Requirements: 2.1, 2.7_

  - [ ]* 4.1 Write property test for transaction address filtering (P4)
    - **Property 4: Transaction address filtering**
    - **Validates: Requirements 2.7**
    - Use `fc.hexaString()` as address; assert all returned transactions have `address === input.toLowerCase()`

- [x] 5. Implement vestingService and its controller in microleague_be
  - Create `microleague_be/src/services/vestingService.ts` with:
    - `getSchedulesByAddress(walletAddress: string)` — returns all `VestingSchedule` records for the address
    - `getSummaryByAddress(walletAddress: string)` — returns `{ totalAllocated, totalClaimed, totalUnclaimed, scheduleCount }` aggregated via Prisma `_sum` and `_count`
  - Create `microleague_be/src/controllers/vesting.ts` with handlers for:
    - `GET /vesting/:walletAddress` → `VestingScheduleDto[]`
    - `GET /vesting/:walletAddress/summary` → `VestingSummaryDto`
  - Register both routes in `microleague_be/src/router.ts`
  - _Requirements: 6.4, 6.5_

  - [ ]* 5.1 Write property test for vesting schedule query round-trip (P14)
    - **Property 14: Vesting schedule query round-trip**
    - **Validates: Requirements 6.4**
    - Use `fc.array(fc.record(vestingScheduleShape))` — insert N records, call `getSchedulesByAddress`, assert exactly N records returned

  - [ ]* 5.2 Write property test for vesting summary aggregation correctness (P15)
    - **Property 15: Vesting summary aggregation correctness**
    - **Validates: Requirements 6.5**
    - Use `fc.array(fc.record({ totalAmount: fc.float({min:0}), claimed: fc.float({min:0}) }))` — assert `totalAllocated = sum(totalAmount)`, `totalClaimed = sum(claimed)`, `totalUnclaimed = sum(totalAmount - claimed)`, `scheduleCount = count`

- [x] 6. Checkpoint — Ensure all microleague_be tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Reconfigure microleague_listner to use shared microleague_be database
  - Update `microleague_listner/.env` (and `.env.example` if present): set `DATABASE_URL` to point at the `microleague_be` PostgreSQL instance
  - In `microleague_listner/prisma/schema.prisma`, remove the presale-specific models (`User`, `PresaleTxs`, `ListenerState`, `FailedEvent`) — keep only `Admin` and `BankTransfer`
  - Run `npx prisma migrate dev --name remove-presale-models` inside `microleague_listner` to apply the schema change against the listener's own DB (if it still has its own DB for Admin/BankTransfer), OR update the datasource `url` to point at the shared DB and regenerate the client
  - Regenerate the Prisma client in `microleague_listner` so it references the shared schema types (`PresaleUser`, `PresaleTx`, `VestingSchedule`, `ListenerState`, `FailedEvent`)
  - Update `microleague_listner/src/prisma/prisma.service.ts` if needed to ensure it connects via the updated `DATABASE_URL`
  - _Requirements: 6.8_

- [x] 8. Implement VestingScheduleCreatedHandler in microleague_listner
  - Create `microleague_listner/src/modules/listener/handlers/vesting-schedule-created.handler.ts` following the same pattern as `presale-buy.handler.ts`
  - `getEventName()` returns `"VestingScheduleCreated"`
  - In `handle()`: extract `(buyer, scheduleId, amount, startTime, cliff, duration)` from `event.args`; call `saveProcessingState`; upsert a `VestingSchedule` record in the shared DB with `walletAddress = buyer.toLowerCase()`, `scheduleId = Number(scheduleId)`, `totalAmount` (converted from wei via `formatEther`), `startTime`, `cliff`, `duration`, `releaseInterval` (read from contract stage config or default), `claimed = 0`, `contract = contractConfig.contractAddress.toLowerCase()`
  - Use upsert on `@@unique([walletAddress, scheduleId, contract])` to ensure idempotency
  - Register `VestingScheduleCreatedHandler` in `listener.module.ts` providers and exports
  - _Requirements: 6.1, 6.2, 6.7_

  - [ ]* 8.1 Write property test for VestingScheduleCreated event round-trip (P12)
    - **Property 12: VestingScheduleCreated event round-trip**
    - **Validates: Requirements 6.2, 6.6**
    - Use `fc.record({ buyer: fc.hexaString(), scheduleId: fc.nat(), amount: fc.bigInt({min:0n}), startTime: fc.nat(), cliff: fc.nat(), duration: fc.nat() })` — mock Prisma, run handler, assert DB record matches event args after wei conversion

  - [ ]* 8.2 Write property test for event processing idempotency (P16)
    - **Property 16: Event processing idempotency**
    - **Validates: Requirements 6.7**
    - Process the same `VestingScheduleCreated` event twice with mocked Prisma; assert DB state is identical to processing it once (upsert semantics)

- [x] 9. Implement ClaimedHandler in microleague_listner
  - Create `microleague_listner/src/modules/listener/handlers/claimed.handler.ts`
  - `getEventName()` returns `"Claimed"`
  - In `handle()`: extract `(buyer, amount, schedulesClaimed)` from `event.args`; call `saveProcessingState`; update `claimed` field on all `VestingSchedule` records for `buyer.toLowerCase()` — distribute the claimed amount proportionally across schedules or update each schedule's `claimed` field by querying the contract's `getVestingSchedule` for each index and syncing the `claimed` value
  - Register `ClaimedHandler` in `listener.module.ts` providers and exports
  - _Requirements: 6.3_

  - [ ]* 9.1 Write property test for Claimed event updates claimed field (P13)
    - **Property 13: Claimed event updates claimed field**
    - **Validates: Requirements 6.3**
    - Use `fc.record({ buyer: fc.hexaString(), amount: fc.bigInt({min:0n}), schedulesClaimed: fc.nat() })` — mock Prisma with existing schedules, run handler, assert sum of `claimed` across all schedules for buyer increases by the event amount

- [x] 10. Checkpoint — Ensure all microleague_listner tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create tokens.ts service module in microleague-gateway-main
  - Create `microleague-gateway-main/src/services/tokens.ts` exporting:
    - `getTokenSummary(walletAddress: string): Promise<TokenSummary>`
    - `getTokenTransactions(walletAddress: string, page: number, limit: number): Promise<TransactionPage>`
    - `getVestingSchedules(walletAddress: string): Promise<VestingScheduleRecord[]>`
    - `getVestingSummary(walletAddress: string): Promise<VestingSummary>`
  - Define and export TypeScript interfaces: `TokenSummary`, `TransactionPage`, `PresaleTxDto`, `VestingScheduleRecord`, `VestingSummary`
  - Read base URL from `import.meta.env.VITE_BE_API_URL` with fallback to `http://localhost:3000/api/v1`
  - Each function throws a typed error on non-2xx responses
  - `getTokenTransactions` appends `?type=Buy&page=N&limit=N` query params
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 11.1 Write property test for tokens service function return shapes (P17)
    - **Property 17: Tokens service function return shapes**
    - **Validates: Requirements 7.2, 7.4, 7.5**
    - Use `fc.hexaString()` as address; mock `fetch` to return valid shaped responses; assert `getTokenSummary`, `getVestingSchedules`, `getVestingSummary` return objects satisfying their TypeScript interfaces

- [x] 12. Implement MyTokensTab component
  - Create `microleague-gateway-main/src/components/dashboard/MyTokensTab.tsx`
  - Accept props: `address: string | undefined`, `isConnected: boolean`, `isOnCorrectChain: boolean`, `saleTokenDecimals: number | undefined`, `userTotalAllocated: bigint | undefined`, `userTotalClaimed: bigint | undefined`, `userClaimableAmount: bigint | undefined`
  - If `!isConnected`: render "Connect your wallet to view your token holdings" prompt
  - If `isConnected && !isOnCorrectChain`: render "Wrong Network" banner with "Switch Network" button (reuse the existing banner pattern from `UserDashboard`)
  - Four summary cards: Total MLC Allocated, Total Claimed, Currently Claimable, Locked Tokens — show skeleton placeholders while `userTotalAllocated === undefined`
  - Compute `lockedTokens = Math.max(0, totalAllocatedMLC - totalClaimedMLC - claimableMLC)` using `formatUnits`
  - Fetch purchase history via `getTokenTransactions(address, page, 10)` using `useEffect`; display table with columns: date, stage, MLC amount, USD value, payment token, truncated tx hash linking to block explorer
  - Implement pagination (page size 10); show "No purchase history found" empty state; show error state with retry button on API failure; show loading skeleton while fetching
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1, 8.3_

  - [ ]* 12.1 Write property test for locked tokens never negative (P2)
    - **Property 2: Locked tokens are never negative**
    - **Validates: Requirements 1.5, 1.6**
    - Use `fc.float({min:0})` × 3 for `(totalAllocated, totalClaimed, claimableAmount)`; assert `Math.max(0, totalAllocated - totalClaimed - claimableAmount) >= 0` always

  - [ ]* 12.2 Write property test for contract value derivation is lossless (P1)
    - **Property 1: Contract value derivation is lossless**
    - **Validates: Requirements 1.2, 1.3, 1.4**
    - Use `fc.bigInt({min:0n})` × `fc.integer({min:0,max:18})`; assert `Number(formatUnits(value, decimals))` is finite and non-negative and equals `Number(value) / 10 ** decimals` within floating-point tolerance

  - [ ]* 12.3 Write property test for transaction rows contain all required fields (P3)
    - **Property 3: Transaction rows contain all required fields**
    - **Validates: Requirements 2.2**
    - Use `fc.record({ txHash: fc.hexaString(), stage: fc.nat(), tokens: fc.float({min:0}), usdAmount: fc.float({min:0}), quote: fc.hexaString(), timestamp: fc.nat() })`; render the row and assert it contains formatted date, stage, MLC amount, USD value, payment token, and truncated tx hash

- [x] 13. Implement VestingClaimModal component
  - Create `microleague-gateway-main/src/components/dashboard/VestingClaimModal.tsx`
  - Props: `isOpen: boolean`, `onClose: () => void`, `claimableAmount: number`, `onConfirm: () => void`, `step: "confirm" | "processing" | "done"`, `errorMessage?: string`
  - "confirm" step: show claimable amount and Confirm/Cancel buttons
  - "processing" step: show "Processing..." spinner, disable all interactions
  - "done" step: show success message and Close button
  - If `errorMessage` is set: show error notification and restore to "confirm" step
  - _Requirements: 5.3, 5.5, 5.6, 5.7_

- [x] 14. Implement VestingTab component
  - Create `microleague-gateway-main/src/components/dashboard/VestingTab.tsx`
  - Accept props: `address: string | undefined`, `isConnected: boolean`, `isOnCorrectChain: boolean`, `saleTokenDecimals: number | undefined`
  - If `!isConnected`: render "Connect your wallet to view your vesting schedules" prompt
  - If `isConnected && !isOnCorrectChain`: render "Wrong Network" banner
  - Read `claimEnabled()` from the presale contract via `useReadContract`
  - If claiming not enabled: display "Claiming not yet enabled" notice instead of claim buttons
  - Read `getVestingSchedulesCount(address)` via `useReadContract`; if count is 0, show "No vesting schedules found. Purchase MLC tokens to create a vesting schedule."
  - For each schedule index 0..count-1, call `getVestingSchedule(address, index)` via `useReadContract`; display a card with: total amount, claimed amount, vested-so-far, claimable amount, start time, cliff end date, duration end date, release interval
  - Each card has a progress bar: `Math.min(100, (vested / totalAmount) * 100)`
  - Each card has a status label: `"Cliff Period"` if `now < startTime + cliff`, `"Fully Vested"` if `now >= startTime + duration`, otherwise `"Vesting"`
  - "Claim Tokens" button: enabled if `claimable > 0 && claimEnabled`; disabled with tooltip showing next unlock date otherwise
  - On click: open `VestingClaimModal`; on confirm: call `claim()` via wagmi `writeContract`; on success: refetch schedules and show success notification; on failure: show error notification with revert reason
  - Show skeleton cards while loading
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.1, 8.2, 8.3_

  - [ ]* 14.1 Write property test for vesting schedule rendering completeness (P8)
    - **Property 8: Vesting schedule rendering completeness**
    - **Validates: Requirements 4.2**
    - Use `fc.record({ totalAmount, claimed, vested, claimable, startTime, cliff, duration, releaseInterval })` — render the schedule card and assert all 8 fields are present in the output

  - [ ]* 14.2 Write property test for vesting progress percentage (P9)
    - **Property 9: Vesting progress percentage**
    - **Validates: Requirements 4.3**
    - Use `fc.record({ vested: fc.float({min:0}), totalAmount: fc.float({min:0.001}) })`; assert `Math.min(100, (vested / totalAmount) * 100)` is always in `[0, 100]`

  - [ ]* 14.3 Write property test for vesting status classification (P10)
    - **Property 10: Vesting status classification**
    - **Validates: Requirements 4.4**
    - Use `fc.record({ now: fc.nat(), startTime: fc.nat(), cliff: fc.nat(), duration: fc.nat() })`; assert status is exactly one of `"Cliff Period"`, `"Vesting"`, `"Fully Vested"` and the three cases are mutually exclusive

  - [ ]* 14.4 Write property test for claim button state (P11)
    - **Property 11: Claim button state matches claimable amount**
    - **Validates: Requirements 5.1, 5.2, 5.8**
    - Use `fc.record({ claimable: fc.float({min:0}), claimEnabled: fc.boolean() })`; assert button is enabled iff `claimable > 0 && claimEnabled`

- [x] 15. Wire MyTokensTab and VestingTab into UserDashboard
  - In `microleague-gateway-main/src/components/dashboard/UserDashboard.tsx`:
    - Import `MyTokensTab` and `VestingTab`
    - In the `{activeTab === "tokens"}` branch, replace the existing inline tokens content with `<MyTokensTab ... />` passing the already-computed wagmi values (`address`, `isConnected`, `isOnCorrectChain`, `saleTokenDecimalsNum`, `userTotalAllocated`, `userTotalClaimed`, `userClaimableAmount`)
    - In the `{activeTab === "vesting"}` branch, replace the existing inline vesting content with `<VestingTab ... />` passing `address`, `isConnected`, `isOnCorrectChain`, `saleTokenDecimalsNum`
  - Remove the now-redundant inline `vestingData`, `vestingSchedule`, and `handleVestingClaim` mock data/handlers from `UserDashboard` once the new components are wired in
  - _Requirements: 1.1, 4.1, 8.1, 8.2, 8.3_

  - [ ]* 15.1 Write property test for wrong network banner visibility (P18)
    - **Property 18: Wrong network banner visibility**
    - **Validates: Requirements 8.1**
    - Use `fc.integer()` as `chainId` where `chainId !== APP_CHAIN.id`; render `MyTokensTab` and `VestingTab` with that chainId; assert the "Wrong Network" banner is visible in both

- [x] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property; each test file includes a comment `// Feature: dashboard-tokens-vesting, Property N: <property_text>`
- The listener's `Admin` and `BankTransfer` models remain in the listener's own schema; only presale-related models move to the shared BE database
- The frontend never calls the listener directly — all API calls go through `microleague_be`
- The `claim()` contract write and all live contract reads (vesting schedules, claimable amounts) are done via wagmi in the frontend; the BE serves historical/aggregate data only
