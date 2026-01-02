# AI Fallback System - When Gemini API is Unavailable

## Overview

JetShifter's AI assistant now has a **smart fallback system** that keeps working even when the Gemini API is unavailable due to:
- ❌ API quota/rate limits exceeded
- ❌ API key expiration
- ❌ Network issues
- ❌ Service outages

Instead of showing errors, the system **automatically switches to pre-written responses** based on keyword matching.

## How It Works

### 1. Primary Mode: Gemini API (AI-Powered)
When the API is available:
- Full conversational AI
- Context-aware responses
- Natural language understanding
- Unlimited topics

**Response format:**
```json
{
  "reply": "AI-generated response...",
  "model": "gemini-2.5-flash",
  "timestamp": "2025-01-02T..."
}
```

### 2. Fallback Mode: Keyword Matching (Offline)
When API fails or quota exceeded:
- Keyword-based matching
- Pre-written expert responses
- Still covers all major topics
- No API costs

**Response format:**
```json
{
  "reply": "Pre-written fallback response...",
  "model": "fallback",
  "timestamp": "2025-01-02T..."
}
```

## What Users Can Still Ask

### ✅ Fully Covered Topics (No API Needed)

Even in fallback mode, users can ask about:

#### **App Navigation (7 topics)**
1. "How do I search for my flight?"
2. "How do I calculate my light schedule?"
3. "How do I schedule notifications?"
4. "How do I add to my calendar?"
5. "How do I save a flight?"
6. "How do melatonin/caffeine interventions work?"
7. "I can't find my flight, what should I do?"

#### **Jet Lag Science (5 topics)**
1. "What is jet lag?"
2. "What is a circadian rhythm?"
3. "How does light exposure help?"
4. "What is chronotype?"
5. "Should I use melatonin?"

#### **Travel Tips (3 topics)**
1. "What should I do on the plane?"
2. "When should I sleep?"
3. "How do I prepare before my trip?"

#### **Troubleshooting (3 topics)**
1. "Flight search not working"
2. "Notifications not appearing"
3. "Calendar not syncing"

### Total: **18 Pre-Written Expert Responses**

## Keyword Matching System

The fallback system uses smart keyword matching:

```typescript
// Example: User asks "How do I add schedule to calendar?"

Keywords detected: ["calendar", "add", "schedule"]

Match found: Calendar Integration response
↓
Returns detailed step-by-step instructions
```

### Matching Algorithm
1. Convert user message to lowercase
2. Check each response's keywords
3. Count keyword matches
4. Return response with most matches
5. If no matches, return general help message

## Example Responses

### User: "How do I search for my flight?"
**Fallback Response:**
```
To search for flights in JetShifter:

1️⃣ **By Route**: On the home screen, select departure and
arrival airports, pick a date, then search

2️⃣ **By Flight Number**: Tap "Flight Number" tab, enter your
flight code (like "AA100"), pick the date

After finding your flight, tap it to view details and calculate
your light schedule! ✈️
```

### User: "What is jet lag?"
**Fallback Response:**
```
Jet lag happens when you cross time zones faster than your body
can adjust! ✈️

**Causes:**
• Your internal clock (circadian rhythm) is still on home time
• Mismatch between your body's schedule and the local time
• Takes about 1 day per time zone to naturally adjust

**Symptoms:**
• Fatigue and sleepiness at wrong times
• Difficulty falling asleep or waking up
• Poor concentration and mood changes
• Digestive issues

JetShifter helps by calculating optimal light exposure to speed
up your adjustment!
```

### User: "Random question not covered"
**Default Response:**
```
I'm currently in offline mode, but I can still help! 🤖

Try asking about:
• **How to use the app**: "How do I search flights?"
  "How do I add to calendar?"
• **Jet lag science**: "What is jet lag?"
  "How does light exposure work?"
• **Features**: "How do notifications work?"
  "What are interventions?"

Or check out the suggested questions below for common topics!
```

## API Error Handling Flow

```
User sends message
       ↓
Try Gemini API
       ↓
    Success? ────Yes────> Return AI response
       │
       No
       ↓
 Check error type
       ↓
Rate Limit / Quota / API Key / 404?
       │
      Yes
       ↓
Find fallback response (keyword matching)
       ↓
  Match found? ────Yes────> Return fallback response
       │
       No
       ↓
Return default help message
```

## Monitoring Fallback Usage

Check server logs for fallback activations:

```
[ChatService] ⚠️ API rate limit/quota exceeded, using fallback responses
[ChatService] ❌ API key error, using fallback
[ChatService] Model not found, using fallback
```

When you see these, you know:
1. API is having issues
2. Users are still getting helpful responses
3. No revenue lost from failed requests

## Gemini API Free Tier Limits

### Current Limits (as of 2025)
- **Free Tier**: 60 requests per minute (RPM)
- **Paid Tier**: Much higher limits

### When You'll Hit Limits
- **Low traffic app**: Unlikely to hit limits
- **Medium traffic**: ~1+ users/sec = need to upgrade
- **High traffic**: Definitely need paid plan

### Cost After Free Tier
- **Gemini 2.5 Flash**: $0.00001875 per 1k input chars
- **Example**: 1000 conversations = ~$0.50-$2.00

## Upgrading Strategy

### Option 1: Stay Free (Use Fallback)
**Pros:**
✅ Zero cost
✅ Still functional for common questions
✅ Good for MVP/testing

**Cons:**
❌ Limited conversational ability
❌ Can't handle unique questions
❌ Less impressive user experience

### Option 2: Paid Gemini API
**Pros:**
✅ Full AI capabilities
✅ Handle any question
✅ Better user experience
✅ Very affordable ($1-10/month for most apps)

**Cons:**
❌ Recurring cost
❌ Need billing setup

### Recommended Approach
1. **Start**: Use free tier + fallback
2. **Monitor**: Check how often you hit limits
3. **Decide**: Upgrade when user base grows
4. **Hybrid**: Keep fallback as backup even with paid plan

## Adding New Fallback Responses

To add more topics to fallback mode:

### 1. Edit `fallback-responses.ts`
```typescript
export const FALLBACK_RESPONSES: FallbackResponse[] = [
  // ... existing responses
  {
    keywords: ['your', 'new', 'keywords'],
    category: 'Your Category',
    response: `Your helpful response here...`
  }
];
```

### 2. Use Multi-Line Formatting
```typescript
response: `Title

**Section 1:**
• Bullet point 1
• Bullet point 2

**Section 2:**
Step-by-step instructions...`
```

### 3. Include Emojis
Makes responses friendly and engaging:
- ✈️ for flights
- ☀️ for light
- 🌙 for dark
- 💊 for melatonin
- ☕ for caffeine

## Testing Fallback System

### Test Without API Key
```bash
# Temporarily remove/invalidate API key
GEMINI_API_KEY=invalid_key

# Send test request
curl -X POST http://localhost:3000/chat/jetlag \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I search for flights?"}'

# Should return fallback response
```

### Test Specific Keywords
```bash
# Test calendar integration
curl -X POST http://localhost:3000/chat/jetlag \
  -d '{"message": "calendar"}'

# Test jet lag science
curl -X POST http://localhost:3000/chat/jetlag \
  -d '{"message": "what is jet lag"}'

# Test notifications
curl -X POST http://localhost:3000/chat/jetlag \
  -d '{"message": "how do notifications work"}'
```

## Mobile App Integration

The mobile app doesn't need changes! It automatically handles both modes:

```typescript
// Mobile app code (already works)
const response = await axios.post(`${API}/chat/jetlag`, {
  message: userMessage
});

// response.data.reply works for both:
// - AI responses (model: "gemini-2.5-flash")
// - Fallback responses (model: "fallback")

// Optional: Show indicator based on model
if (response.data.model === 'fallback') {
  showOfflineIndicator(); // "Offline mode"
}
```

## Best Practices

### 1. Keep Fallback Responses Updated
When you add new app features, add fallback responses:
- New feature launched → Add fallback explanation
- UI changes → Update step-by-step instructions
- New integrations → Document in fallback

### 2. Make Responses Comprehensive
Each fallback should:
- Answer the question completely
- Provide step-by-step instructions
- Include relevant emojis
- Link to related features
- Be 2-4 paragraphs

### 3. Test Regularly
- Check fallback responses monthly
- Ensure they're still accurate
- Update for app changes
- Test keyword matching

### 4. Monitor Logs
Watch for:
- High fallback usage (might need API upgrade)
- Unmatched queries (need new fallback responses)
- Error patterns

## Summary

### ✅ What This Solves
- **API quota limits**: App keeps working
- **Cost concerns**: Can run free tier indefinitely
- **User experience**: No "service unavailable" errors
- **Reliability**: Graceful degradation

### 📊 Coverage
- **18 pre-written responses** covering major topics
- **Keyword matching** for intelligent routing
- **Default help message** for unknown queries
- **No user-facing errors** even when API fails

### 🚀 Future Enhancements
1. Add more fallback responses
2. Improve keyword matching (fuzzy matching)
3. Track which topics need more responses
4. A/B test AI vs fallback quality
5. Add conversation context to fallback

---

Your AI assistant now has a safety net that ensures users always get help, even when the Gemini API isn't available! 🛡️
