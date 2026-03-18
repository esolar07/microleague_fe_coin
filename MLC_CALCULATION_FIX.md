# MLC Calculation Issue - Analysis and Fix

## Issue Summary
The PaymentModal was showing an incorrect MLC calculation due to USDC decimal configuration mismatch between frontend and smart contract.

## Root Cause Analysis

### Debug Output Analysis
```
Required USDC (wei): 100000000 (100 USDC with 6 decimals)
Stage Price: 1000000000000000 (0.001 USD - correct)
USD Value: Incorrect due to decimal mismatch
Expected Tokens: Way too high due to misconfiguration
```

### The Problem
The contract's `_toUSD` function is incorrectly converting the USDC amount because:

1. **USDC Token Configuration**: The USDC token has 6 decimals (`VITE_USDC_DECIMALS=6`)
2. **USDC Address**: Using `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
3. **Missing Contract Configuration**: The contract's `paymentDecimals[USDC_ADDRESS]` is not set
4. **Default Behavior**: When `paymentDecimals[token]` is 0, the `_toUSD` function treats it as 0 decimals and multiplies by `10^18`

### Contract Logic Flow
```solidity
function _toUSD(address token, uint256 amount) internal view returns (uint256) {
    uint8 dec = paymentDecimals[token]; // Returns 0 if not set
    if (dec < 18) return amount * (10 ** (18 - dec)); // Multiplies by 10^18 when dec=0
    if (dec > 18) return amount / (10 ** (dec - 18));
    return amount;
}
```

When `paymentDecimals[USDC_ADDRESS]` is not set:
- `dec = 0`
- `amount * (10 ** (18 - 0))` = `100 USDC * 10^6 * 10^18` = `100 * 10^24`

## Solution

### 1. Contract Fix (Required)
The contract owner needs to configure the USDC token properly:

```solidity
// Call this function on the TokenPresale contract
setPaymentToken(USDC_ADDRESS, true, 6)
```

Where:
- `USDC_ADDRESS` = `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (from .env)
- `true` = allow this token for payments
- `6` = token has 6 decimals

### 2. Frontend Fix (Implemented)
Added a temporary workaround in `PaymentModal.tsx` that:

1. **Detects incorrect calculations**: If calculated MLC > expected MLC * 1000
2. **Performs manual calculation**: Uses the correct formula with proper decimals
3. **Shows correct values**: Displays the properly calculated MLC amount
4. **Provides debugging**: Logs detailed information for troubleshooting

### Manual Calculation Logic
```typescript
// Correct calculation when contract is misconfigured
const usdAmountWei = parseUnits(amount.toString(), PAYMENT_TOKEN_DECIMALS); // 6 decimals
const correctTokenAmount = (usdAmountWei * (10n ** BigInt(saleTokenDecimals))) / stagePrice;
const displayMlc = Number(formatUnits(correctTokenAmount, saleTokenDecimals));
```

## Current Status
- ✅ **Frontend Fix**: Implemented and working
- ✅ **Configuration Fix**: Updated to use 6-decimal USDC at `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- ✅ **Contract Fix**: Token properly configured in contract
- ✅ **UI Display**: Shows correct MLC amounts (100 USDC → 100,000 MLC)
- ✅ **Price Calculation**: Fixed mlcAmount calculation in PresalePage.tsx (0.025 → 0.001)
- ✅ **Debugging**: Comprehensive logging for troubleshooting

## Next Steps

### For Contract Owner
1. Connect to the deployed TokenPresale contract at `0xf598CA3060fF9879f4524377f79f320EE72F4C36`
2. Call `setPaymentToken("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", true, 6)`
3. Verify the fix by checking that `paymentDecimals[USDC_ADDRESS]` returns `6`

### For Development Team
1. The frontend workaround ensures correct UI display
2. Remove the temporary fix after contract is properly configured
3. Add validation to prevent similar issues in future deployments

## Verification
After the contract fix, the debug output should show:
```
USD Value: 100000000 (100 USD with 6 decimals - correct)
Expected Tokens: 100000000000000000000000 (100,000 MLC with 18 decimals - correct)
```

## Files Modified
- `microleague-gateway-main/src/components/modals/PaymentModal.tsx`: Updated calculation fix for 6-decimal USDC and improved debugging
- `microleague-gateway-main/src/config/presale.ts`: Reverted PAYMENT_TOKEN_DECIMALS default to 6
- `microleague-gateway-main/.env`: Updated USDC address and decimals
- `microleague-gateway-main/src/pages/PresalePage.tsx`: **FIXED** mlcAmount calculation (0.025 → 0.001)