// Gemini API Service for TRACKVOLT
// Supports text generation and vision (image analysis)

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function getApiKey(): string | null {
  try {
    return localStorage.getItem('trackvolt_gemini_key') || null
  } catch { return null }
}

export function setApiKey(key: string) {
  localStorage.setItem('trackvolt_gemini_key', key)
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

export function clearApiKey() {
  localStorage.removeItem('trackvolt_gemini_key')
}

interface GeminiResponse {
  candidates?: { content: { parts: { text: string }[] } }[]
  error?: { message: string }
}

export async function generateText(prompt: string): Promise<string> {
  const key = getApiKey()
  if (!key) throw new Error('No Gemini API key configured. Add it in Settings.')

  const res = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  })

  const data: GeminiResponse = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
}

export async function analyzeImage(imageBase64: string, prompt: string): Promise<string> {
  const key = getApiKey()
  if (!key) throw new Error('No Gemini API key configured. Add it in Settings.')

  // Strip data:image/jpeg;base64, prefix if present
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

  const res = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        ],
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  })

  const data: GeminiResponse = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze image.'
}

// Build a training insights prompt from user data
export function buildInsightsPrompt(data: {
  profile: { name: string; goal: string; experience: string; trainingDays: number }
  recentWorkouts: { date: string; name: string; type: string; score?: string }[]
  todayMetrics: { sleep?: number; water?: number; energy?: number; weight?: number }
  macros: { calories: number; protein: number; carbs: number; fat: number }
  targets: { calories: number; protein: number; carbs: number; fat: number; water: number }
  streak: number
  prsThisMonth: number
}): string {
  return `You are a CrossFit and HYROX coach analyzing an athlete's data. Be concise, specific, and actionable. Use a motivating but honest tone.

ATHLETE PROFILE:
- Name: ${data.profile.name}
- Goal: ${data.profile.goal}
- Experience: ${data.profile.experience}
- Target: ${data.profile.trainingDays} training days/week

RECENT WORKOUTS (last 7 days):
${data.recentWorkouts.length > 0 ? data.recentWorkouts.map(w => `- ${w.date}: ${w.name} (${w.type})${w.score ? ' -> ' + w.score : ''}`).join('\n') : '- No workouts logged this week'}

TODAY'S METRICS:
- Sleep: ${data.todayMetrics.sleep ? data.todayMetrics.sleep + ' hrs' : 'Not logged'}
- Water: ${data.todayMetrics.water ? data.todayMetrics.water + ' ml' : 'Not logged'}
- Energy: ${data.todayMetrics.energy ? data.todayMetrics.energy + '/5' : 'Not logged'}
- Weight: ${data.todayMetrics.weight ? data.todayMetrics.weight + ' kg' : 'Not logged'}

TODAY'S NUTRITION vs TARGETS:
- Calories: ${data.macros.calories}/${data.targets.calories}
- Protein: ${data.macros.protein}g/${data.targets.protein}g
- Carbs: ${data.macros.carbs}g/${data.targets.carbs}g
- Fat: ${data.macros.fat}g/${data.targets.fat}g

STREAKS & MILESTONES:
- Current streak: ${data.streak} days
- PRs this month: ${data.prsThisMonth}

Please provide:
1. A brief overall assessment (1-2 sentences)
2. Today's training recommendation (what type of workout and why)
3. One nutrition tip based on current intake vs targets
4. One recovery observation or tip

Format as 4 short paragraphs. No headers, no bullet points, no emojis. Keep each paragraph 2-3 sentences max.`
}

// Build a whiteboard OCR prompt
export const WHITEBOARD_PROMPT = `Analyze this whiteboard photo from a CrossFit gym. Extract the workout of the day (WOD) information.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "wodName": "name of the workout or 'Daily WOD'",
  "wodType": "AMRAP" or "ForTime" or "EMOM" or "Tabata" or "Strength" or "Chipper" or "Other",
  "movements": [
    {"name": "movement name", "reps": "rep scheme like '21-15-9' or '10' or '5x5'"}
  ],
  "timeCapOrDuration": "time in minutes if mentioned, or empty string",
  "notes": "any additional notes like weight recommendations"
}

If you cannot read the whiteboard clearly, return:
{"error": "Could not read whiteboard clearly"}

Important: Only return the JSON, nothing else.`

// Build an event scan prompt for CrossFit event posters, screenshots, whiteboards
export const EVENT_SCAN_PROMPT = `Analyze this image of a CrossFit event workout. It could be:
- An official CrossFit Open poster
- An Instagram/social media screenshot of a workout announcement
- A gym whiteboard photo
- A handwritten workout note
- A scoreboard screenshot

Extract ALL structured event data. Be thorough and precise.

Return ONLY valid JSON (no markdown, no code fences, just raw JSON):
{
  "eventTitle": "Full event name (e.g., 'CrossFit Open 26.1', 'Murph', 'Fran')",
  "eventType": "open" or "hero" or "girl" or "custom",
  "wodType": "ForTime" or "AMRAP" or "EMOM" or "Chipper" or "Tabata" or "Other",
  "eventYear": 2026 or null,
  "eventNumber": "26.1" or null,
  "workoutLines": [
    "First movement line exactly as written (with reps/sets/weight)",
    "Second movement line",
    "..."
  ],
  "timeCapMinutes": 12 or null,
  "rxStandard": "RX weights/standards if visible, otherwise null",
  "scaledStandard": "Scaled standards if visible, otherwise null",
  "score": "Score if visible on image (time, rounds+reps, etc.), otherwise null",
  "confidenceScores": {
    "title": 0.95,
    "wodType": 0.90,
    "workoutLines": 0.85,
    "timeCap": 0.80,
    "rxStandard": 0.70
  },
  "warnings": ["Any text that was hard to read", "Ambiguous movements"]
}

Rules:
- "workoutLines" should be individual movement lines, not grouped
- Bold rep counts should be captured (e.g., "21 pull-ups" not "pull-ups")
- If it's clearly an Open workout, set eventType to "open"
- If it references a fallen soldier/first responder, it's a "hero" WOD
- Known Girl WODs (Fran, Cindy, Grace, etc.) should be "girl"
- Confidence scores: 0.0 to 1.0 (how confident you are in each extracted field)
- Include warnings for any illegible or ambiguous text

If the image is completely unreadable, return:
{"error": "Could not read event poster clearly", "confidence": 0.2}`

// WOD scan prompt  -  for daily whiteboard / WOD screenshots (simpler than events)
export const WOD_SCAN_PROMPT = `Analyze this image of a CrossFit WOD (Workout of the Day). It could be:
- A gym whiteboard photo
- A screenshot from an app or social media
- A handwritten workout note
- A workout poster or card

Extract the workout details. Return ONLY valid JSON (no markdown, no code fences):
{
  "wodName": "WOD name if visible (e.g. 'Fran', 'Cindy') or null",
  "wodType": "ForTime" or "AMRAP" or "EMOM" or "Tabata" or "Chipper" or "Other",
  "description": "Full workout description in one line (e.g. '21-15-9: Thrusters & Pull-ups')",
  "movements": ["movement1", "movement2"],
  "repScheme": "21-15-9" or "5 rounds" or "20 min" or null,
  "timeCapMinutes": 12 or null,
  "rxWeights": "M: 95lb / F: 65lb" or null,
  "isBenchmark": true or false,
  "confidenceScores": {
    "wodName": 0.95,
    "wodType": 0.90,
    "description": 0.85,
    "movements": 0.80
  },
  "warnings": ["Any hard to read text"]
}

Rules:
- If you recognize a known benchmark (Fran, Cindy, Grace, Helen, etc.), set isBenchmark to true
- "description" should be a concise summary of the workout
- "movements" should be clean movement names only (no reps/weights)
- Capture the rep scheme separately from movements
- Confidence scores: 0.0 to 1.0
- Include warnings for illegible or ambiguous text

If unreadable, return: {"error": "Could not read workout clearly"}`
