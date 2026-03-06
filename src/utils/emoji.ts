/**
 * Build-safe emoji helper.
 *
 * Vercel's build pipeline corrupts literal Unicode emoji characters and
 * escape sequences (\uD83D\uDD25).  String.fromCodePoint() generates
 * emojis at *runtime*, so it survives any build encoding.
 *
 * Usage:
 *   import { E } from '../utils/emoji'
 *   E.fire   // 🔥
 *   E.trophy // 🏆
 */

function cp(...codes: number[]): string {
  return String.fromCodePoint(...codes)
}

export const E = {
  // Circles
  red_circle:    cp(0x1F534),
  green_circle:  cp(0x1F7E2),
  yellow_circle: cp(0x1F7E1),
  blue_circle:   cp(0x1F535),

  // Fitness
  fire:      cp(0x1F525),
  muscle:    cp(0x1F4AA),
  runner:    cp(0x1F3C3),
  swimmer:   cp(0x1F3CA),
  cyclist:   cp(0x1F6B4),
  rower:     cp(0x1F6A3),
  skier:     cp(0x26F7, 0xFE0F),
  boot:      cp(0x1F97E),

  // Awards
  trophy:    cp(0x1F3C6),
  medal:     cp(0x1F3C5),
  target:    cp(0x1F3AF),

  // Food / Drink
  sunrise:   cp(0x1F305),
  apple:     cp(0x1F34E),
  sun:       cp(0x2600, 0xFE0F),
  cup_straw: cp(0x1F964),
  moon:      cp(0x1F319),
  glass:     cp(0x1F95B),
  tumbler:   cp(0x1F943),

  // Water
  droplet:   cp(0x1F4A7),
  splash:    cp(0x1F4A6),
  wave:      cp(0x1F30A),
  party:     cp(0x1F389),

  // Faces / Mood
  face_happy:   cp(0x1F60A),
  face_chill:   cp(0x1F60C),
  face_neutral: cp(0x1F610),
  face_sad:     cp(0x1F614),
  face_angry:   cp(0x1F624),

  // Movement categories
  weightlifter: cp(0x1F3CB, 0xFE0F),
  gymnast:      cp(0x1F938),
  bell:         cp(0x1F514),
  yoga:         cp(0x1F9D8),
  rock:         cp(0x1FAA8),
  white_circle: cp(0x26AA),

  // Misc
  timer:     cp(0x23F1, 0xFE0F),
  boom:      cp(0x1F4A5),
  chill:     cp(0x1F60C),
  refresh:   cp(0x1F504),
  chart:     cp(0x1F4CA),
  warning:   cp(0x26A0, 0xFE0F),
} as const
