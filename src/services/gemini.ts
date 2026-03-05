// Stub for Gemini AI service - install @google/generative-ai to enable
export const WOD_SCAN_PROMPT = 'Extract WOD name and description from this workout whiteboard image.'
export const EVENT_SCAN_PROMPT = 'Extract event details from this image.'

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
