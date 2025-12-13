# Plan: Bot Metrics Integration & Delete Functionality

The backend **already has** the necessary API endpoints documented in [API_ENDPOINTS.md](AlgoAgent/monolithic_agent/docs/api/API_ENDPOINTS.md). The frontend needs to integrate with these existing endpoints rather than creating new ones.

**Existing Backend Endpoints Available:**
- `GET /strategies/{id}/execution_history/` — Returns last backtest metrics (return_pct, num_trades, win_rate, sharpe_ratio, max_drawdown)
- `DELETE /strategies/{id}/` — Deletes strategy and associated files
- `POST /strategies/{id}/execute/` — Runs backtest and returns metrics

## Steps

1. **Add execution history endpoint to frontend API config** in [Algo/src/lib/api.ts](Algo/src/lib/api.ts) — Add `executionHistory: (id: number) => \`${API_BASE_URL}/strategies/strategies/${id}/execution_history/\`` to the strategies section.

2. **Create `getExecutionHistory` service method** in [Algo/src/lib/services.ts](Algo/src/lib/services.ts) — Add a method to `strategyService` that fetches the execution history and extracts the latest metrics (return_pct, win_rate, num_trades, etc.).

3. **Update Strategy.tsx to fetch and display real metrics** in [Algo/src/pages/Strategy.tsx](Algo/src/pages/Strategy.tsx) — Replace hardcoded 0% values with data from `getExecutionHistory()`, mapping `return_pct` → Performance, `win_rate` → Win Rate, etc.

4. **Add delete button with confirmation** in [Algo/src/pages/Strategy.tsx](Algo/src/pages/Strategy.tsx) — Add a Trash2 icon button that calls existing `strategyService.delete(id)` and refreshes the list on success.

5. **Verify backend delete cleans up files** — Confirm the Django `DELETE /strategies/{id}/` endpoint removes the strategy file from `Backtest/codes/` and entries from `execution_history.db`. If not, this needs backend modification.

## Further Considerations

1. **Backend file cleanup verification** — Does the existing DELETE endpoint also remove temp files (`Backtest/codes/*.py`, `results/*.json`, SQLite records)? Need to check backend implementation or add cleanup logic.

2. **Loading states for metrics** — Should we show skeleton loaders while fetching execution history, or prefetch on page load?

3. **Empty state handling** — What should display when a bot has never been executed (no execution history)? Current 0/0%/0 or "Not tested yet"?
