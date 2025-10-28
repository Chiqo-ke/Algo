# Frontend-Backend AI Chat Integration Guide

## Overview
The Dashboard component now integrates with the Django backend AI validation API, enabling real-time strategy validation and creation using Gemini AI.

## Features Implemented

### 1. **Dynamic AI Chat Interface**
- Real-time communication with Django API endpoints
- Support for both strategy creation and editing modes
- Loading states with visual indicators
- Error handling with toast notifications
- Rich metadata display (confidence, warnings, recommendations)

### 2. **API Integration**
The Dashboard connects to three main endpoints:

#### **Validate Strategy (Validation Mode)**
- **Endpoint**: `POST /api/strategies/api/validate_strategy_with_ai/`
- **Use Case**: Analyze strategy without creating DB record
- **Payload**:
```json
{
  "strategy_text": "User's strategy description",
  "input_type": "freetext",
  "use_gemini": true,
  "strict_mode": false
}
```

#### **Create Strategy (Edit Mode - First Message)**
- **Endpoint**: `POST /api/strategies/api/create_strategy_with_ai/`
- **Use Case**: Create new strategy with AI validation
- **Payload**:
```json
{
  "strategy_text": "User's strategy description",
  "input_type": "freetext",
  "name": "Strategy Name",
  "description": "Strategy created via chat",
  "tags": ["ai-generated", "chat-created"],
  "use_gemini": true,
  "strict_mode": false,
  "save_to_backtest": true
}
```

#### **Update Strategy (Edit Mode - Subsequent Messages)**
- **Endpoint**: `PUT /api/strategies/api/{id}/update_strategy_with_ai/`
- **Use Case**: Update existing strategy with AI re-validation
- **Payload**:
```json
{
  "strategy_text": "Updated strategy description",
  "input_type": "freetext",
  "use_gemini": true,
  "strict_mode": false,
  "update_description": "User requested: ..."
}
```

### 3. **Response Handling**
The frontend processes and displays:
- **Classification**: Strategy type, risk tier
- **Confidence Level**: High/Medium/Low
- **Canonicalized Steps**: Structured strategy logic
- **Warnings**: Potential issues or missing components
- **Recommendations**: AI-suggested improvements with priority
- **Next Actions**: Suggested follow-up steps

### 4. **Visual Feedback**
- **Loading Spinner**: Shows when API call is in progress
- **Confidence Badge**: Green checkmark with confidence level
- **Warning Alerts**: Amber alert icon with warning count
- **Rich Formatting**: Markdown-style response with bold headers, bullet points

## Setup Instructions

### Frontend Configuration

1. **Environment Variables** (`.env`):
```bash
VITE_API_URL=http://localhost:8000
```

2. **Install Dependencies** (if not already installed):
```bash
npm install
```

3. **Start Frontend Dev Server**:
```bash
npm run dev
```

### Backend Configuration

1. **Navigate to Backend**:
```bash
cd c:\Users\nyaga\Documents\AlgoAgent
```

2. **Activate Python Environment**:
```bash
.venv\Scripts\activate
```

3. **Install Required Packages**:
```bash
pip install jsonschema google-generativeai python-dotenv
```

4. **Configure Environment Variables**:
Create/update `.env` in `AlgoAgent/` directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
```

5. **Run Django Server**:
```bash
python manage.py runserver
```

## Usage Flow

### Creating New Strategy

1. Navigate to Dashboard from home
2. Type strategy description in natural language:
   - "Create a momentum strategy using RSI and MACD"
   - "Build a mean reversion bot with Bollinger Bands"
3. AI analyzes and returns:
   - Canonicalized steps
   - Classification (type, risk)
   - Warnings about missing components
   - Recommendations for improvement
4. Strategy is saved to database with auto-generated template

### Editing Existing Strategy

1. Navigate to Dashboard with `editMode=true` and `strategyName`
2. First message creates/loads strategy
3. Subsequent messages update the strategy:
   - "Add a trailing stop loss"
   - "Optimize position sizing"
4. Each update re-validates with AI and tracks changes

## Error Handling

The integration includes comprehensive error handling:

### Connection Errors
- **Display**: Error message in chat + toast notification
- **Info**: Server URL, suggestion to check Django server status

### Validation Errors
- **Display**: AI returns error message with status="error"
- **Info**: Specific validation issues (syntax, logic, missing fields)

### API Errors
- **Display**: HTTP status code and error response
- **Info**: Helps debug backend issues

## Testing

### Quick Test Steps

1. **Start Both Servers**:
   - Backend: `python manage.py runserver` (Port 8000)
   - Frontend: `npm run dev` (Port 5173 by default)

2. **Navigate to Dashboard**:
   - Go to `http://localhost:5173/dashboard`

3. **Test Validation**:
   - Type: "Create RSI strategy"
   - Should see AI response with analysis

4. **Test Creation** (Edit Mode):
   - Navigate with edit mode enabled
   - Type strategy description
   - Should see strategy created with ID

### Backend Health Check
Test the API directly:
```bash
curl http://localhost:8000/api/strategies/api/health/
```

Expected response:
```json
{
  "status": "healthy",
  "validator_available": true,
  "gemini_configured": true
}
```

## Troubleshooting

### Issue: "Failed to fetch"
- **Cause**: Backend not running or wrong URL
- **Fix**: Check Django server is running on port 8000
- **Verify**: `VITE_API_URL` in `.env` matches backend URL

### Issue: "No module named 'canonical_schema'"
- **Cause**: Strategy module import error
- **Fix**: Already fixed with `Strategy/__init__.py`
- **Verify**: Run `python test_strategy_import.py`

### Issue: "No module named 'jsonschema'"
- **Cause**: Missing dependency
- **Fix**: `pip install jsonschema`
- **Verify**: `pip list | findstr jsonschema`

### Issue: "No module named 'google.generativeai'"
- **Cause**: Gemini package not installed
- **Fix**: `pip install google-generativeai`
- **Verify**: `pip list | findstr google-generativeai`

### Issue: AI returns generic responses
- **Cause**: GEMINI_API_KEY not configured
- **Fix**: Add valid API key to `.env`
- **Verify**: Check `health` endpoint shows `gemini_configured: true`

## Code Structure

### Frontend Files Modified
- `src/pages/Dashboard.tsx`: Main integration logic
  - `handleSendMessage()`: API call orchestration
  - `formatAIResponse()`: Response formatting
  - Message metadata rendering

### Backend Files (Reference)
- `strategy_api/views.py`: API endpoints
- `strategy_api/serializers.py`: Request/response schemas
- `Strategy/strategy_validator.py`: AI validation logic
- `Strategy/gemini_integration.py`: Gemini AI integration

## Next Steps

### Recommended Enhancements
1. **Save to File**: Add button to save canonicalized strategy to `.py` file
2. **Chat History**: Persist chat history in localStorage
3. **Strategy Templates**: Quick-start templates for common strategies
4. **Visual Strategy Builder**: Drag-and-drop interface for steps
5. **Backtest Integration**: One-click backtest from chat interface

### Performance Optimizations
1. **Debouncing**: Add input debouncing for long messages
2. **Caching**: Cache API responses for similar queries
3. **Streaming**: Implement streaming responses for long AI outputs
4. **Pagination**: Limit message history length

## API Response Examples

### Success Response (Validation)
```json
{
  "status": "success",
  "confidence": "high",
  "classification_detail": {
    "type": "Momentum",
    "risk_tier": "Medium"
  },
  "canonicalized_steps": [
    "Calculate RSI with period 14",
    "Enter LONG when RSI < 30",
    "Exit when RSI > 70"
  ],
  "warnings": ["Missing stop loss", "No position sizing specified"],
  "recommendations_list": [
    {
      "title": "Add Stop Loss",
      "priority": "high",
      "rationale": "Protect against large losses"
    }
  ],
  "next_actions": [
    "Define risk parameters",
    "Add position sizing rules"
  ]
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Could not parse strategy text",
  "error": "Invalid JSON format"
}
```

## Support
- **Documentation**: See `STRATEGY_AI_VALIDATION_API.md` for backend API details
- **Testing**: Use `test_ai_strategy_api.py` for API testing
- **Postman**: Import `Quick_AI_Strategy_Validation.json` for manual testing
