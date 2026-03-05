const fs = require('fs');
const path = require('path');

// All methods/properties available in the store
const storeAPI = new Set([
  'activeTab', 'setActiveTab',
  'profile', 'loadProfile', 'saveProfile', 'isOnboarded',
  'todayLog', 'loadTodayLog', 'saveDailyLog',
  'todayWorkout', 'workouts', 'loadTodayWorkout', 'loadWorkouts', 'saveWorkout',
  'todayMeals', 'todayMacros', 'loadTodayMeals', 'saveMealLog', 'deleteMealLog', 'addMealFromTemplate',
  'foods', 'loadFoods',
  'templates', 'loadTemplates',
  'groceryItems', 'loadGrocery', 'toggleGroceryItem', 'resetGrocery',
  'movementPRs', 'loadMovementPRs', 'saveMovementPR',
  'benchmarkWods', 'loadBenchmarkWods',
  'timerPresets', 'loadTimerPresets',
  'prs', 'loadPRs',
  'allDailyLogs', 'loadAllDailyLogs',
  'exportAllData', 'importData',
]);

// Check each page file
const pages = fs.readdirSync('src/pages').filter(f => f.endsWith('.tsx'));
const errors = [];
const warnings = [];

pages.forEach(file => {
  const content = fs.readFileSync(path.join('src/pages', file), 'utf8');
  
  // Find useStore destructuring
  const storeMatch = content.match(/const\s*\{([^}]+)\}\s*=\s*useStore\(\)/);
  if (!storeMatch) return; // No store usage
  
  const usedProps = storeMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  usedProps.forEach(prop => {
    if (!storeAPI.has(prop)) {
      errors.push(`${file}: uses "${prop}" but it doesn't exist in the store!`);
    }
  });
  
  // Check for old references
  if (content.includes('settings') && !content.includes('Settings')) {
    warnings.push(`${file}: still references 'settings' (should be 'profile')`);
  }
  if (content.includes('loadSettings')) {
    errors.push(`${file}: still uses 'loadSettings' (removed in v2)`);
  }
  if (content.includes('getCurrentWeek')) {
    errors.push(`${file}: still uses 'getCurrentWeek' (removed in v2)`);
  }
  if (content.includes('todayProgram')) {
    errors.push(`${file}: still uses 'todayProgram' (removed in v2)`);
  }
  if (content.includes('updateSettings')) {
    errors.push(`${file}: still uses 'updateSettings' (removed in v2)`);
  }
});

// Check App.tsx too
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('OnboardingPage')) errors.push('App.tsx: missing OnboardingPage import');
if (!appContent.includes('onboardingComplete')) errors.push('App.tsx: missing onboarding gate');

console.log('=== STORE USAGE VERIFICATION ===');
if (errors.length === 0 && warnings.length === 0) {
  console.log('ALL PAGES USE CORRECT STORE API');
} else {
  if (errors.length > 0) {
    console.log('\nERRORS:');
    errors.forEach(e => console.log('  ✗', e));
  }
  if (warnings.length > 0) {
    console.log('\nWARNINGS:');
    warnings.forEach(w => console.log('  ⚠', w));
  }
}

// Verify all page files exist that are imported
const requiredPages = [
  'TodayPage.tsx', 'LogPage.tsx', 'TrainingPage.tsx', 'NutritionPage.tsx',
  'MorePage.tsx', 'SettingsPage.tsx', 'GroceryPage.tsx', 'ProgressPage.tsx',
  'OnboardingPage.tsx', 'TimerPage.tsx', 'CalcPage.tsx', 'BenchmarkPage.tsx',
  'MovementPRPage.tsx'
];

console.log('\n=== PAGE FILES ===');
requiredPages.forEach(p => {
  const exists = fs.existsSync(path.join('src/pages', p));
  console.log(exists ? ` ✓ ${p}` : ` ✗ ${p} MISSING!`);
});

// Verify components
console.log('\n=== COMPONENT FILES ===');
['TabBar.tsx', 'MacroBar.tsx'].forEach(c => {
  const exists = fs.existsSync(path.join('src/components', c));
  console.log(exists ? ` ✓ ${c}` : ` ✗ ${c} MISSING!`);
});

// Verify utils, db, types, i18n
console.log('\n=== CORE FILES ===');
['types/index.ts', 'db/database.ts', 'stores/useStore.ts', 'utils/macros.ts', 'i18n/index.ts', 'i18n/en.ts', 'i18n/zh-TW.ts'].forEach(f => {
  const exists = fs.existsSync(path.join('src', f));
  console.log(exists ? ` ✓ ${f}` : ` ✗ ${f} MISSING!`);
});
