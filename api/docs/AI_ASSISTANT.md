# JetShifter AI Assistant - Enhanced Context System

## Overview

The JetShifter AI assistant (powered by Google Gemini 2.5 Flash) now has comprehensive knowledge about the app's features, navigation, and jet lag science. This allows users to ask questions about both using the app AND understanding jet lag management.

## What the AI Knows

### 1. App Navigation & Features

The AI can guide users through:

- **Flight Search**: How to find flights by route or flight number
- **Schedule Calculation**: How to use the "Calculate Light Schedule" button
- **Notifications**: Setting up and managing notification reminders
- **Calendar Integration**: Adding switching times to device calendar
- **Interventions**: Using melatonin and caffeine features
- **Saved Flights**: Saving and accessing favorite flights
- **Profile Settings**: Managing sleep schedule and chronotype

### 2. Jet Lag Science

The AI can explain:

- Circadian rhythm biology and how it relates to jet lag
- Why light exposure timing matters
- The Forger 1999 optimal control algorithm (what the app uses)
- Melatonin and caffeine pharmacology
- Sleep hygiene for travelers
- Chronotype considerations

### 3. Troubleshooting

The AI can help with:

- Permission issues (notifications, calendar)
- Flight search problems
- Understanding calculation results
- App feature questions

## API Endpoints

### Send Message
```
POST /chat/jetlag
```

**Request Body:**
```json
{
  "message": "How do I add my schedule to my calendar?",
  "conversationHistory": [
    {
      "id": "1",
      "text": "Previous user message",
      "isUser": true
    },
    {
      "id": "2",
      "text": "Previous AI response",
      "isUser": false
    }
  ]
}
```

**Response:**
```json
{
  "reply": "Great question! After calculating your light schedule...",
  "timestamp": "2025-01-02T10:30:00.000Z",
  "model": "gemini-2.5-flash"
}
```

### Get Suggested Prompts
```
GET /chat/suggested-prompts
```

**Response:**
```json
[
  {
    "category": "Getting Started",
    "prompts": [
      "How do I search for my flight?",
      "How do I calculate my light schedule?",
      "How do I add the schedule to my calendar?",
      "What are the notification reminders?"
    ]
  },
  {
    "category": "Jet Lag Science",
    "prompts": [
      "What causes jet lag?",
      "How does light exposure help with jet lag?",
      "Should I use melatonin for jet lag?",
      "What is a circadian rhythm?"
    ]
  }
  // ... more categories
]
```

### Health Check
```
GET /chat/health
```

**Response:**
```json
{
  "status": "ok",
  "model": "gemini-2.5-flash"
}
```

## System Prompt Structure

The AI's system prompt includes:

1. **Role Definition**: JetShifter's AI assistant for jet lag and navigation
2. **Expertise Areas**:
   - Jet lag science and wellness
   - App features and navigation (8 main sections)
3. **Guidance Rules**: How to respond to different question types
4. **Response Style**: Concise, friendly, practical with emojis
5. **Example Responses**: Shows the AI how to answer common questions

## Key Features

### Context-Aware Responses

The AI understands:
- Which screen the user might be on
- What features are available
- Specific button names and locations
- The relationship between features (e.g., calendar works alongside notifications)

### Scientific Accuracy

The AI references:
- Forger 1999 optimal control algorithm (the actual algorithm used in the app)
- Circadian rhythm biology
- Evidence-based recommendations
- Always suggests consulting doctors for medical advice

### Progressive Disclosure

The AI provides:
- Step-by-step instructions for navigation
- Explanations of why features work (connects science to features)
- Troubleshooting steps for common issues
- Links between concepts (e.g., "that's why the app shows dark periods")

## Example Conversations

### Navigation Help
```
User: "How do I get flight reminders?"
AI: "Easy! After calculating your light schedule, scroll down to find the '🔔 Schedule Notifications' button. Tap it, and the app will set up reminders for all your light/dark switching times. You'll get TWO notifications for each switch: one at the time, and a 15-minute advance warning so you're never caught off guard! Make sure you've granted notification permissions when prompted."
```

### Science Explanation
```
User: "Why should I avoid light at certain times?"
AI: "Great question! Your body's internal clock (circadian rhythm) responds to light. During 'dark' periods, avoiding bright light tells your brain it's nighttime in your destination timezone - this helps shift your sleep-wake cycle faster. Think of it like tricking your brain into thinking you're already in the new timezone! 🌙 The app calculates these optimal dark windows using the Forger 1999 algorithm, which is backed by circadian rhythm research."
```

### Feature Discovery
```
User: "What's new in the app?"
AI: "We recently added Calendar Integration! 📅 After calculating your schedule, you can now tap 'Add to Calendar' to sync all your light/dark switching times directly to your device calendar. Each event includes helpful reminders and detailed notes. It's perfect if you want to see your jet lag schedule alongside your other appointments. Works great with or without the push notifications!"
```

## Implementation Notes

### Conversation History
- The AI maintains context from the last 6 messages
- This allows follow-up questions and contextual responses
- Older messages are dropped to keep responses focused

### Token Limits
- Max output tokens: 500 (keeps responses concise)
- Temperature: 0.7 (balanced between creative and factual)

### Error Handling
- API key validation on initialization
- Graceful fallbacks for model availability issues
- User-friendly error messages

## Future Enhancements

Potential improvements:
1. **User Context**: Pass user's current screen/flight to make responses more specific
2. **Personalization**: Remember user preferences and past questions
3. **Proactive Tips**: Suggest features based on user's journey
4. **Multi-language**: Support for other languages
5. **Voice Integration**: Voice-based Q&A for hands-free use

## Testing the AI

### Test Cases

1. **Navigation Questions**:
   - "How do I find my flight?"
   - "Where is the calendar button?"
   - "How do I save a flight?"

2. **Science Questions**:
   - "What is jet lag?"
   - "How does the app reduce jet lag?"
   - "Should I take melatonin?"

3. **Feature Questions**:
   - "What does the light schedule do?"
   - "Can I use this without notifications?"
   - "How accurate is the calculation?"

4. **Troubleshooting**:
   - "My flight doesn't show up"
   - "The notifications aren't working"
   - "I need to change my sleep schedule"

### Expected Behavior

- Responses should be 2-4 paragraphs
- Should use app-specific terminology (button names, screen names)
- Should connect features to benefits
- Should prioritize user safety and health
- Should suggest doctor consultation for medical questions

## Configuration

Set your Gemini API key in the environment:

```env
GEMINI_API_KEY=your_api_key_here
```

Or in your config file:

```typescript
gemini_api_key: process.env.GEMINI_API_KEY
```

## Monitoring

The AI service logs:
- Message processing start/end
- Error details
- Model initialization status
- Health check results

Check logs for:
```
[ChatService] Processing message: ...
[ChatService] Message processed successfully
[ChatService] Gemini AI initialized successfully
```

## Conclusion

The enhanced AI assistant makes JetShifter more user-friendly by combining:
- Expert jet lag knowledge
- Detailed app navigation guidance
- Contextual troubleshooting
- Friendly, practical responses

This reduces the learning curve for new users and helps everyone get the most out of the app's features.
