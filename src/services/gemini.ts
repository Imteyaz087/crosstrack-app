// Stub for Gemini AI service - install @google/generative-ai to enable
export const WOD_SCAN_PROMPT = 'Extract WOD name and description from this workout whiteboard image.'
export const EVENT_SCAN_PROMPT = 'Extract event details from this image.'
export const WHITEBOARD_PROMPT = 'Extract workout details (wodName, wodType, movements, notes) from this whiteboard image. Return JSON.'

export function setApiKey(_key: string): void {
  // Stub: would store in localStorage
}

export function clearApiKey(): void {
  // Stub: would clear from localStorage
}

export function hasApiKey(): boolean {
  return false
}

export async function analyzeImage(_base64: string, _prompt: string): Promise<string | null> {
  return null
}

export async function parseWodFromImage(_base64: string): Promise<{ name: string; description: string } | null> {
  return null
}

export async function analyzeWodImage(_base64: string): Promise<string | null> {
  return null
}
