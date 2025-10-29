# Frontend Conversation Memory Integration

## Overview

The frontend now supports **conversation memory** allowing the AI to remember previous interactions within the same session. This creates a more natural, contextual dialogue when building and refining trading strategies.

## Features Integrated

### 1. **Session Management**
```typescript
const [sessionId, setSessionId] = useState<string | null>(null);
const [messageCount, setMessageCount] = useState(0);
const [useContext, setUseContext] = useState(true);
```

- **sessionId**: Unique identifier for the conversation session
- **messageCount**: Number of messages in the current conversation
- **useContext**: Toggle to enable/disable conversation history usage

### 2. **API Integration**

All strategy validation and creation requests now include conversation memory fields:

```typescript
{
  strategy_text: userInput,
  input_type: "freetext",
  use_gemini: true,
  session_id: sessionId || undefined,  // Continue existing conversation
  use_context: true                     // Use conversation history
}
```

### 3. **Visual Indicators**

When a conversation session is active, users see:

```tsx
<div className="mt-3 flex items-center justify-center gap-2">
  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
  <span>
    Conversation memory active • {messageCount} messages • 
    Session: {sessionId.substring(0, 12)}...
  </span>
</div>
```

### 4. **Context-Aware Responses**

AI responses now indicate when conversation context is being used:

```
🧠 *Using conversation context from previous 5 messages*
```

## How It Works

### Initial Message
1. User sends first message
2. Backend creates new session
3. Response includes `session_id` and `message_count`
4. Frontend stores these values

### Follow-up Messages
1. User sends another message
2. Frontend includes `session_id` in request
3. Backend retrieves conversation history
4. AI uses context to provide smarter responses
5. Message count increments

### Example Flow

```typescript
// User: "Create a momentum strategy using RSI"
POST /api/strategies/api/validate_strategy_with_ai/
{
  "strategy_text": "Create a momentum strategy using RSI",
  "use_context": true
}

// Response includes:
{
  "session_id": "chat_abc123456",
  "message_count": 2,
  "canonicalized_steps": [...],
  ...
}

// User: "Add a stop loss to the previous strategy"
POST /api/strategies/api/validate_strategy_with_ai/
{
  "strategy_text": "Add a stop loss to the previous strategy",
  "session_id": "chat_abc123456",  // Same session!
  "use_context": true
}

// AI remembers the RSI strategy and adds stop loss to it!
```

## Updated Components

### Dashboard.tsx

**New State Variables:**
- `sessionId`: Tracks conversation session
- `messageCount`: Tracks message count
- `useContext`: Controls context usage

**Updated Functions:**
- `handleSendMessage()`: Now includes session_id and use_context
- `formatAIResponse()`: Shows context indicator

**Visual Changes:**
- Green pulse indicator when session is active
- Session ID and message count display

## Benefits

### 1. **Natural Conversations**
```
User: "I want to create a momentum strategy"
AI: "Here's a momentum strategy..."

User: "Add a trailing stop loss"
AI: "I'll add trailing stop loss to your momentum strategy..."
        ↑ AI remembers the previous strategy!
```

### 2. **Iterative Refinement**
```
User: "Create an RSI strategy"
AI: Validates and creates strategy

User: "Add volume confirmation"
AI: Updates same strategy with volume filter

User: "What's the risk level now?"
AI: Analyzes updated strategy with all changes
```

### 3. **Contextual Understanding**
- AI remembers what indicators you're using
- References previous strategies discussed
- Understands "this strategy" or "the previous one"

## Testing

### Test Conversation Flow
1. Open Dashboard (`/`)
2. Send: "Create a strategy using RSI below 30"
3. Wait for response - note the session indicator appears
4. Send: "Add a stop loss to this strategy"
5. AI should reference the RSI strategy and add stop loss

### Verify Session Persistence
1. Check console for session logs:
   ```
   📝 Session chat_abc123 - Message count: 2
   ```
2. Session ID should remain same across messages
3. Message count should increment with each exchange

## Future Enhancements

### Planned Features:
- [ ] View full conversation history button
- [ ] Clear conversation / start new session button
- [ ] Export conversation to markdown
- [ ] Resume previous conversations
- [ ] Multi-strategy session management

### Optional Toggles:
```tsx
<Switch 
  checked={useContext}
  onCheckedChange={setUseContext}
  label="Use conversation memory"
/>
```

## Troubleshooting

### Session Not Created
**Problem**: No session ID in response
**Solution**: Check Django server logs, ensure conversation_manager is working

### Context Not Working
**Problem**: AI doesn't remember previous messages
**Solution**: Verify `use_context: true` is being sent, check backend session storage

### Message Count Mismatch
**Problem**: Frontend count doesn't match backend
**Solution**: Ensure you're updating `setMessageCount(data.message_count)` on each response

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/strategies/api/validate_strategy_with_ai/` | POST | Validate with memory |
| `/api/strategies/api/create_strategy_with_ai/` | POST | Create with memory |
| `/api/strategies/api/{id}/update_strategy_with_ai/` | PUT | Update with memory |

All endpoints now support:
- `session_id` (optional) - Continue existing conversation
- `use_context` (optional, default: true) - Use conversation history

## Example Request

```typescript
const response = await fetch(
  `${API_BASE_URL}/api/strategies/api/validate_strategy_with_ai/`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy_text: "Buy when RSI < 30, sell when RSI > 70",
      input_type: "freetext",
      use_gemini: true,
      session_id: sessionId,  // From state
      use_context: true
    }),
  }
);

const data = await response.json();

// Update session state
setSessionId(data.session_id);
setMessageCount(data.message_count);
```

## Summary

✅ Frontend now tracks conversation sessions  
✅ Session ID automatically included in requests  
✅ Visual indicator shows when memory is active  
✅ AI responses indicate context usage  
✅ Natural multi-turn conversations supported  

The integration is **fully backward compatible** - if session_id is not provided, the backend creates a new session automatically.
