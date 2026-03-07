const a="https://generativelanguage.googleapis.com/v1beta/models";function s(){try{return localStorage.getItem("trackvolt_gemini_key")||null}catch{return null}}function l(e){localStorage.setItem("trackvolt_gemini_key",e)}function c(){return!!s()}function u(){localStorage.removeItem("trackvolt_gemini_key")}async function m(e){const t=s();if(!t)throw new Error("No Gemini API key configured. Add it in Settings.");const o=await(await fetch(`${a}/gemini-2.0-flash:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":t},body:JSON.stringify({contents:[{parts:[{text:e}]}],generationConfig:{temperature:.7,maxOutputTokens:1024}})})).json();if(o.error)throw new Error(o.error.message);return o.candidates?.[0]?.content?.parts?.[0]?.text||"No response generated."}async function d(e,t){const r=s();if(!r)throw new Error("No Gemini API key configured. Add it in Settings.");const o=e.includes(",")?e.split(",")[1]:e,n=await(await fetch(`${a}/gemini-2.0-flash:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":r},body:JSON.stringify({contents:[{parts:[{text:t},{inlineData:{mimeType:"image/jpeg",data:o}}]}],generationConfig:{temperature:.3,maxOutputTokens:1024}})})).json();if(n.error)throw new Error(n.error.message);return n.candidates?.[0]?.content?.parts?.[0]?.text||"Could not analyze image."}function g(e){return`You are a CrossFit and HYROX coach analyzing an athlete's data. Be concise, specific, and actionable. Use a motivating but honest tone.

ATHLETE PROFILE:
- Name: ${e.profile.name}
- Goal: ${e.profile.goal}
- Experience: ${e.profile.experience}
- Target: ${e.profile.trainingDays} training days/week

RECENT WORKOUTS (last 7 days):
${e.recentWorkouts.length>0?e.recentWorkouts.map(t=>`- ${t.date}: ${t.name} (${t.type})${t.score?" -> "+t.score:""}`).join(`
`):"- No workouts logged this week"}

TODAY'S METRICS:
- Sleep: ${e.todayMetrics.sleep?e.todayMetrics.sleep+" hrs":"Not logged"}
- Water: ${e.todayMetrics.water?e.todayMetrics.water+" ml":"Not logged"}
- Energy: ${e.todayMetrics.energy?e.todayMetrics.energy+"/5":"Not logged"}
- Weight: ${e.todayMetrics.weight?e.todayMetrics.weight+" kg":"Not logged"}

TODAY'S NUTRITION vs TARGETS:
- Calories: ${e.macros.calories}/${e.targets.calories}
- Protein: ${e.macros.protein}g/${e.targets.protein}g
- Carbs: ${e.macros.carbs}g/${e.targets.carbs}g
- Fat: ${e.macros.fat}g/${e.targets.fat}g

STREAKS & MILESTONES:
- Current streak: ${e.streak} days
- PRs this month: ${e.prsThisMonth}

Please provide:
1. A brief overall assessment (1-2 sentences)
2. Today's training recommendation (what type of workout and why)
3. One nutrition tip based on current intake vs targets
4. One recovery observation or tip

Format as 4 short paragraphs. No headers, no bullet points, no emojis. Keep each paragraph 2-3 sentences max.`}const p=`Analyze this whiteboard photo from a CrossFit gym. Extract the workout of the day (WOD) information.

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

Important: Only return the JSON, nothing else.`,h=`Analyze this image of a CrossFit event workout. It could be:
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
{"error": "Could not read event poster clearly", "confidence": 0.2}`,y=`Analyze this image of a CrossFit WOD (Workout of the Day). It could be:
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

If unreadable, return: {"error": "Could not read workout clearly"}`;export{h as E,y as W,d as a,g as b,u as c,p as d,m as g,c as h,l as s};
