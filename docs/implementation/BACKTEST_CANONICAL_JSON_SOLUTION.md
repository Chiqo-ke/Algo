# Backtest Canonical JSON Format Solution

## Current Issue
The backend's `/api/backtests/api/quick_run/` endpoint returns **HTTP 501 "Direct Python code execution not yet implemented"** because:

1. ✅ Strategy ID 37 exists in database
2. ✅ Strategy has Python code in `strategy_code` field
3. ❌ Backend requires `strategy_code` to be in **canonical JSON format**, not Python code

**Backend logs show**: `⚠️ Strategy code is not JSON, skipping backtest execution`

## Solution Options

### Option 1: Convert Python to Canonical JSON (Recommended)
Update the strategy's `strategy_code` to canonical JSON format that the backend can execute.

**Canonical JSON Format Example**:
```json
{
  "strategy_name": "Algo9999999888877",
  "entry_conditions": {
    "operator": "and",
    "conditions": [
      {
        "indicator": "RSI",
        "period": 14,
        "operator": "<",
        "threshold": 30
      },
      {
        "indicator": "price",
        "operator": ">",
        "comparison": "EMA",
        "ema_period": 20
      }
    ]
  },
  "exit_conditions": {
    "operator": "or",
    "conditions": [
      {
        "indicator": "RSI",
        "period": 14,
        "operator": ">",
        "threshold": 70
      },
      {
        "type": "stop_loss",
        "percentage": 2.0
      }
    ]
  },
  "position_sizing": {
    "method": "fixed_percentage",
    "value": 10.0
  },
  "risk_management": {
    "stop_loss_percentage": 2.0,
    "take_profit_percentage": 5.0
  }
}
```

**Implementation Steps**:
1. Parse the Python code in `algo9999999888877.py`
2. Extract indicators (RSI, EMA) and logic
3. Convert to canonical JSON format
4. Update Strategy ID 37's `strategy_code` field via API

### Option 2: Implement Python Code Execution (Backend Change)
Modify the backend to execute Python code directly.

**Required Changes**:
```python
# In backtest_api/views.py quick_run method
else:
    # Execute Python code
    import tempfile
    import sys
    
    # Create temp file with Python code
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(strategy_code)
        strategy_file = f.name
    
    try:
        # Load strategy class from file
        spec = importlib.util.spec_from_file_location("strategy_module", strategy_file)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Find Strategy class
        strategy_class = getattr(module, 'Strategy', None)
        if not strategy_class:
            raise ValueError("No Strategy class found in code")
        
        # Run backtest...
        
    finally:
        os.unlink(strategy_file)
```

### Option 3: Use Alternative Endpoint
Check if there's a different endpoint that accepts Python code.

**Backend Endpoints to Check**:
- `/api/backtests/create_config/` - Creates backtest config
- `/api/backtests/run/` - Runs configured backtest
- WebSocket streaming endpoint (already attempted)

## Recommended Action Plan

### Step 1: Extract Strategy Logic from Python Code
```python
# Run this script to analyze algo9999999888877.py
import ast
import json

# Parse Python code to extract:
# - Indicator definitions (RSI, EMA parameters)
# - Entry/exit conditions
# - Position sizing rules
# - Risk management parameters
```

### Step 2: Create Canonical JSON
Use the extracted logic to create canonical JSON format.

### Step 3: Update Strategy via API
```python
import requests

strategy_id = 37
canonical_json = { ... }  # Your canonical JSON

response = requests.patch(
    f"http://localhost:8000/api/strategies/strategies/{strategy_id}/",
    json={"strategy_code": json.dumps(canonical_json)},
    headers={"Authorization": f"Bearer {access_token}"}
)
```

### Step 4: Test Backtest Execution
With canonical JSON in place, the quick_run endpoint should work:
- ✅ Validation passes (already working)
- ✅ Strategy loads (already working)
- ✅ Backtest executes (will work with canonical JSON)

## Quick Fix for Testing
If you need to test immediately, you can:

1. **Use a pre-existing canonical JSON strategy** from the database
2. **Manually craft a simple canonical JSON** for testing:
   ```json
   {
     "strategy_name": "Simple RSI",
     "entry_conditions": {
       "operator": "and",
       "conditions": [{"indicator": "RSI", "period": 14, "operator": "<", "threshold": 30}]
     },
     "exit_conditions": {
       "operator": "or",
       "conditions": [{"indicator": "RSI", "period": 14, "operator": ">", "threshold": 70}]
     }
   }
   ```

3. **Update strategy 37** with this simple JSON to test the flow

## Next Steps
Choose one of the following:

**A. Convert to Canonical JSON** (Recommended, ~30 mins):
   - Parse `algo9999999888877.py`
   - Create canonical JSON
   - Update database
   - Test backtest

**B. Implement Python Execution** (Backend change, ~1-2 hours):
   - Modify `backtest_api/views.py`
   - Add Python code execution logic
   - Test and deploy

**C. Create Simple Test Strategy** (Quick test, ~5 mins):
   - Create minimal canonical JSON
   - Test backtest flow
   - Verify everything works end-to-end

Would you like me to:
1. Create a Python script to convert the algo9999999888877 strategy to canonical JSON?
2. Implement Python code execution in the backend?
3. Create a simple test canonical JSON to verify the flow works?
