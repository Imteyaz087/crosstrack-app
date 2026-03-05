import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';

export function AICoachPage() {
  const { workouts } = useStore();
  
  const [trainingFrequency, setTrainingFrequency] = useState(0);
  const [prVelocity, setPRVelocity] = useState(0);
  const [rxRatio, setRxRatio] = useState({ rx: 0, scaled: 0 });
  const [wodBreakdown, setWodBreakdown] = useState<{ type: string; count: number; color: string }[]>([]);
  const [commonMovements, setCommonMovements] = useState<{ movement: string; count: number }[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState(0);

  useEffect(() => {
    analyzeWorkouts();
  }, [workouts]);

  const analyzeWorkouts = () => {
    if (!workouts || workouts.length === 0) {
      setInsights(['Start logging workouts to get personalized training insights!']);
      return;
    }

    // Training Frequency - workouts per week
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentWorkouts = workouts.filter(w => new Date(w.date) > thirtyDaysAgo);
    const frequency = Math.round((recentWorkouts.length / 4) * 10) / 10; // per week average
    setTrainingFrequency(frequency);

    // WOD Type Breakdown
    const wodMap = new Map<string, number>();
    const colors = ['#52C3A0', '#4B7FFF', '#FFB84D', '#FF7F50', '#FF5252', '#9D5CFF'];
    
    workouts.forEach(w => {
      const type = w.workoutType || 'Custom';
      wodMap.set(type, (wodMap.get(type) || 0) + 1);
    });

    const breakdown = Array.from(wodMap.entries()).map(([type, count], idx) => ({
      type,
      count,
      color: colors[idx % colors.length]
    }));
    setWodBreakdown(breakdown);

    // PR Velocity (PRs per month)
    const prsThisMonth = workouts.filter(w => {
      const date = new Date(w.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && w.prFlag;
    }).length;
    setPRVelocity(prsThisMonth);

    // RX vs Scaled Ratio
    const rxCount = workouts.filter(w => w.rxOrScaled === 'RX').length;
    const scaledCount = workouts.filter(w => w.rxOrScaled === 'Scaled').length;
    setRxRatio({ rx: rxCount, scaled: scaledCount });

    // Common Movements (from notes/description parsing)
    const movementMap = new Map<string, number>();
    const commonMoves = ['Deadlift', 'Squat', 'Bench Press', 'Pull-ups', 'Rope Climbs', 
                         'Double-Unders', 'Wall Balls', 'Thrusters', 'Snatches', 'Cleans'];
    
    workouts.forEach(w => {
      const notes = (w.notes || '').toLowerCase();
      commonMoves.forEach(move => {
        if (notes.includes(move.toLowerCase())) {
          movementMap.set(move, (movementMap.get(move) || 0) + 1);
        }
      });
    });

    const topMovements = Array.from(movementMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([movement, count]) => ({ movement, count }));
    setCommonMovements(topMovements);

    // Weekly Volume (workouts this week)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) > weekAgo);
    setWeeklyVolume(thisWeekWorkouts.length);

    // Consecutive Training Days
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let consecutive = 1;
    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const currentDate = new Date(sortedWorkouts[i].date);
      const nextDate = new Date(sortedWorkouts[i + 1].date);
      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutive++;
      } else {
        break;
      }
    }

    // Generate Insights
    const newInsights: string[] = [];
    
    if (frequency > 5) {
      newInsights.push('📈 Great volume! You\'re training consistently.');
    } else if (frequency < 2) {
      newInsights.push('💪 Increase training frequency for better results.');
    }

    if (prsThisMonth > 0) {
      newInsights.push(`🏆 ${prsThisMonth} PR${prsThisMonth > 1 ? 's' : ''} this month - excellent progress!`);
    }

    if (rxRatio.rx > 0 && rxRatio.rx / (rxRatio.rx + rxRatio.scaled) > 0.7) {
      newInsights.push('⚡ Strong RX percentage - keep pushing!');
    } else if (rxRatio.scaled > rxRatio.rx) {
      newInsights.push('🎯 Build your strength - scale strategically towards RX.');
    }

    if (consecutive >= 5) {
      newInsights.push(`⚠️ You've trained ${consecutive} days straight - consider a rest day for recovery.`);
    }

    if (topMovements.length > 0) {
      newInsights.push(`🔥 Your most trained movement: ${topMovements[0].movement}.`);
    }

    if (newInsights.length === 0) {
      newInsights.push('📊 Log more workouts to unlock personalized insights.');
    }

    setInsights(newInsights);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Training Insights</h1>
        <p className="page-subtitle">AI-Powered Analysis of Your Workouts</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="glass-card metric-card stagger-1">
          <div className="metric-icon">📊</div>
          <div className="metric-label">Weekly Volume</div>
          <div className="metric-value">{weeklyVolume}</div>
          <div className="metric-unit">workouts</div>
        </div>

        <div className="glass-card metric-card stagger-2">
          <div className="metric-icon">⚡</div>
          <div className="metric-label">Avg Frequency</div>
          <div className="metric-value">{trainingFrequency.toFixed(1)}</div>
          <div className="metric-unit">per week</div>
        </div>

        <div className="glass-card metric-card stagger-3">
          <div className="metric-icon">🏆</div>
          <div className="metric-label">PRs This Month</div>
          <div className="metric-value">{prVelocity}</div>
          <div className="metric-unit">new records</div>
        </div>

        <div className="glass-card metric-card stagger-4">
          <div className="metric-icon">💯</div>
          <div className="metric-label">RX Ratio</div>
          <div className="metric-value">{rxRatio.rx}</div>
          <div className="metric-unit">RX workouts</div>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="insights-section stagger-5 page-enter">
        <h2 className="section-title">Your Insights</h2>
        <div className="insights-grid">
          {insights.map((insight, idx) => (
            <div key={idx} className="glass-card insight-card">
              <p className="insight-text">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* WOD Type Breakdown */}
      {wodBreakdown.length > 0 && (
        <div className="glass-card section-card stagger-6 page-enter">
          <h2 className="section-title">Workout Type Distribution</h2>
          <div className="chart-container">
            <div className="pie-chart">
              {wodBreakdown.map((wod, idx) => {
                const totalWods = wodBreakdown.reduce((sum, w) => sum + w.count, 0);
                const percentage = (wod.count / totalWods) * 100;
                return (
                  <div key={idx} className="pie-segment-wrapper">
                    <div
                      className="pie-segment"
                      style={{
                        backgroundColor: wod.color,
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {percentage.toFixed(0)}%
                    </div>
                    <div className="pie-label">
                      <span style={{ color: wod.color }}>●</span> {wod.type} ({wod.count})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Common Movements */}
      {commonMovements.length > 0 && (
        <div className="glass-card section-card page-enter">
          <h2 className="section-title">Most Trained Movements</h2>
          <div className="movements-list">
            {commonMovements.map((movement, idx) => (
              <div key={idx} className="movement-item">
                <div className="movement-name">{movement.movement}</div>
                <div className="movement-progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(movement.count / Math.max(...commonMovements.map(m => m.count))) * 100}%`,
                      backgroundColor: 'var(--volt)'
                    }}
                  />
                </div>
                <div className="movement-count">{movement.count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RX vs Scaled */}
      {(rxRatio.rx > 0 || rxRatio.scaled > 0) && (
        <div className="glass-card section-card page-enter">
          <h2 className="section-title">RX vs Scaled</h2>
          <div className="rx-breakdown">
            <div className="rx-stat">
              <div className="rx-label">RX Workouts</div>
              <div className="rx-value">{rxRatio.rx}</div>
              <div className="rx-percentage">
                {Math.round((rxRatio.rx / (rxRatio.rx + rxRatio.scaled)) * 100)}%
              </div>
            </div>
            <div className="scaled-stat">
              <div className="scaled-label">Scaled Workouts</div>
              <div className="scaled-value">{rxRatio.scaled}</div>
              <div className="scaled-percentage">
                {Math.round((rxRatio.scaled / (rxRatio.rx + rxRatio.scaled)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <div className="glass-card section-card empty-state">
          <div className="empty-icon">📈</div>
          <h3 className="empty-title">No Workouts Yet</h3>
          <p className="empty-text">Start logging workouts to unlock personalized training insights and analysis.</p>
        </div>
      )}
    </div>
  );
}
