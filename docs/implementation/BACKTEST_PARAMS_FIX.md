# Backtest Parameters Fix - Variable Name Conflict Resolution

## Issue
The `Backtesting.tsx` file had a naming conflict between:
- URL parameters from `useParams()` hook (stored in variable `params`)
- Backtest configuration parameters (state variable also named `params`)

This caused TypeScript errors and potential runtime issues where URL params and backtest params were being mixed up.

## Solution
Renamed all backtest configuration references from `params`/`setParams` to `backtestParams`/`setBacktestParams` throughout the file.

### Changes Made

#### 1. State Variable Declaration (Line ~82)
Already correctly named as `backtestParams`, but all usages were incorrectly using `params`.

#### 2. Updated All References
- **Form inputs**: Symbol, Period, Timeframe, Lot Size, Initial Balance, Commission, Slippage
- **Validation logic**: Required field checks, real money validation
- **Backtest execution**: Payload construction for API call
- **Results display**: Profit formatting (dollars vs pips)
- **Streaming chart**: Configuration props
- **Custom date handling**: Date range selection
- **Error logging**: Debug information

#### 3. Type Safety Improvements
Added type assertion for validation API response to fix TypeScript errors:
```typescript
const validationData = data as { 
  valid: boolean; 
  trades_executed?: number; 
  errors?: string[]; 
  warnings?: string[] 
};
```

### Affected Sections
1. ✅ handlePeriodChange function
2. ✅ handleRunBacktest function  
3. ✅ Form inputs (symbol, period, timeframe)
4. ✅ Simulation mode (useRealMoney checkbox)
5. ✅ Real money parameters (lotSize, initialBalance)
6. ✅ Advanced parameters (commission, slippage)
7. ✅ Results display sections
8. ✅ Streaming chart configuration
9. ✅ Custom date dialog
10. ✅ Error logging

### URL Parameters Still Using `params`
These remain unchanged (correct usage):
- `params.strategyId` - Extracted from URL via useParams()

### Testing Checklist
- [x] TypeScript compilation passes (0 errors)
- [ ] Form inputs update correctly
- [ ] Backtest execution uses correct parameters
- [ ] Results display shows correct units ($ vs pips)
- [ ] Streaming chart receives correct configuration
- [ ] Custom date selection works
- [ ] URL navigation with strategyId works

## Impact
- **Fixed**: All parameter confusion between URL params and backtest config
- **Improved**: Type safety with validation response typing
- **Maintained**: Correct usage of URL params for strategyId
- **Result**: Clean separation of concerns between routing and configuration

## Related Files
- `src/pages/Backtesting.tsx` - Main file with all fixes
- `src/pages/Strategy.tsx` - Passes strategyId correctly in navigation state

## Next Steps
1. Test backtest execution with Algo9999999888877 bot
2. Verify browser console logs show correct strategyId
3. Confirm all form inputs work as expected
4. Check results display formatting
