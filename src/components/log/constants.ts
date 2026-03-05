export const COMMON_MOVEMENTS = [
  'Back Squat', 'Front Squat', 'Overhead Squat', 'Deadlift', 'Sumo Deadlift HP',
  'Clean', 'Power Clean', 'Squat Clean', 'Block Clean', 'Muscle Clean',
  'Clean & Jerk', 'Snatch', 'Power Snatch', 'Squat Snatch',
  'Push Press', 'Push Jerk', 'Split Jerk', 'Strict Press', 'Bench Press',
  'Thruster', 'Front Rack Reverse Lunge', 'Barbell Good Morning', 'STOH', 'Barbell Row',
  'DB Shoulder Press', 'DB Devil Press', 'DDB Devil Press', 'DB Floor Press',
  'DB Front Squat', 'DB Deadlift', 'KB Swings',
  'Pull-ups', 'Chest-to-Bar', 'Strict Pull-up', 'Ring Muscle-Up', 'Bar Muscle-Up',
  'Toes-to-Bar', 'Knee Raise', 'HSPU', 'Strict HSPU', 'Double Unders',
  'Single Unders', 'Pistols', 'Ring Row', 'Ring Dip', 'Kip Swing', 'Hollow Rock',
  'Box Jumps', 'Burpees', 'Burpee Over Bar', 'Wall Balls', 'Sit-Ups',
  'Mountain Climbers', 'Jumping Squat', 'Jumping Lunge',
  'Row (Cal)', 'Bike (Cal)', 'Run (m)', 'Rope Climbs',
  'Lunges', 'Walking Lunge', 'Farmer Carry', 'OH Walking Lunge',
  'Front Rack Walking Lunge', 'Push-Ups',
  'Lu Raises', 'Bus Drivers', 'Banded Press', 'PVC Passthrough',
]

export interface MovementEntry {
  name: string
  weight: string
  detail: string
}