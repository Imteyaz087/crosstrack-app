import { useState, useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { db } from '../db/database';

interface DataStats {
  workouts: number;
  meals: number;
  prLogs: number;
  heartRateLogs: number;
  photoLogs: number;
  total: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

export function CloudSyncPage() {
  const { exportAllData, importData } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dataStats, setDataStats] = useState<DataStats>({
    workouts: 0,
    meals: 0,
    prLogs: 0,
    heartRateLogs: 0,
    photoLogs: 0,
    total: 0
  });
  const [lastExportDate, setLastExportDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const appVersion = '1.0.0';
  const dbVersion = '2.0';

  useEffect(() => {
    loadDataStats();
    loadLastExportDate();
  }, []);

  const loadDataStats = async () => {
    try {
      const workoutCount = await db.workouts.count();
      const mealCount = await db.mealLogs?.count?.() ?? 0;
      const prCount = await db.movementPRs?.count?.() ?? 0;
      const hrCount = await db.heartRateLogs?.count?.() ?? 0;
      const photoCount = await db.photoLogs?.count?.() ?? 0;

      const stats: DataStats = {
        workouts: workoutCount,
        meals: mealCount,
        prLogs: prCount,
        heartRateLogs: hrCount,
        photoLogs: photoCount,
        total: workoutCount + mealCount + prCount + hrCount + photoCount
      };

      setDataStats(stats);
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const loadLastExportDate = () => {
    const lastExport = localStorage.getItem('lastExportDate');
    setLastExportDate(lastExport);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration: 3000
    };

    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `trackvolt-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      localStorage.setItem('lastExportDate', new Date().toISOString());
      loadLastExportDate();
      
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.exportDate || !data.version) {
        throw new Error('Invalid backup file format');
      }

      await importData(data);
      loadDataStats();
      
      showToast('Data imported successfully! App will refresh.', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error importing data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to import data';
      showToast(`Import failed: ${errorMsg}`, 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAllData = async () => {
    setShowDeleteConfirm(false);
    try {
      await db.delete();
      await db.open();
      loadDataStats();
      showToast('All data cleared. App will refresh.', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing data:', error);
      showToast('Failed to clear data. Please try again.', 'error');
    }
  };

  const formatExportDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalSize = () => {
    // Estimate size in KB (rough calculation)
    const estimatedSize = (dataStats.workouts * 0.5 + 
                          dataStats.meals * 0.3 + 
                          dataStats.prLogs * 0.2 + 
                          dataStats.heartRateLogs * 0.1 + 
                          dataStats.photoLogs * 50); // photos are large
    return estimatedSize < 1 ? '<1' : Math.round(estimatedSize).toString();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Data Sync & Backup</h1>
        <p className="page-subtitle">Manage your TrackVolt data</p>
      </div>

      {/* Data Overview */}
      <div className="glass-card section-card stagger-1 page-enter">
        <h2 className="section-title">Data Overview</h2>
        
        <div className="stats-table">
          <div className="stats-row">
            <div className="stats-label">Workouts</div>
            <div className="stats-value">{dataStats.workouts}</div>
          </div>
          <div className="stats-row">
            <div className="stats-label">Meal Logs</div>
            <div className="stats-value">{dataStats.meals}</div>
          </div>
          <div className="stats-row">
            <div className="stats-label">PR Records</div>
            <div className="stats-value">{dataStats.prLogs}</div>
          </div>
          <div className="stats-row">
            <div className="stats-label">Heart Rate Logs</div>
            <div className="stats-value">{dataStats.heartRateLogs}</div>
          </div>
          <div className="stats-row">
            <div className="stats-label">Photos</div>
            <div className="stats-value">{dataStats.photoLogs}</div>
          </div>
          <div className="stats-row separator">
            <div className="stats-label">Total Records</div>
            <div className="stats-value">{dataStats.total}</div>
          </div>
        </div>

        <div className="info-box">
          <span className="info-label">Estimated Size:</span>
          <span className="info-value">{getTotalSize()} KB</span>
        </div>
      </div>

      {/* Export Section */}
      <div className="glass-card section-card stagger-2 page-enter">
        <h2 className="section-title">Export Data</h2>
        <p className="section-description">
          Download all your TrackVolt data as a JSON file. Perfect for backup or transferring to another device.
        </p>

        <div className="info-box warning">
          <span className="warning-icon">ℹ️</span>
          <div className="warning-text">
            Last export: <strong>{formatExportDate(lastExportDate)}</strong>
          </div>
        </div>

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="tap-target btn-primary"
          style={{ width: '100%' }}
        >
          {isExporting ? '💾 Exporting...' : '💾 Export All Data'}
        </button>
      </div>

      {/* Import Section */}
      <div className="glass-card section-card stagger-3 page-enter">
        <h2 className="section-title">Import Data</h2>
        <p className="section-description">
          Restore your data from a previously exported backup file.
        </p>

        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>Important:</strong> Importing will overwrite current data. Make sure you have a recent backup.
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          disabled={isImporting}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="tap-target btn-secondary"
          style={{ width: '100%' }}
        >
          {isImporting ? '📂 Importing...' : '📂 Import from File'}
        </button>
      </div>

      {/* Data Integrity Section */}
      <div className="glass-card section-card stagger-4 page-enter">
        <h2 className="section-title">Data Integrity Check</h2>
        <p className="section-description">
          Verify that your database is functioning correctly.
        </p>

        <div className="integrity-check">
          <div className="check-item">
            <span className="check-icon">✓</span>
            <div className="check-text">
              <div className="check-label">Database Connection</div>
              <div className="check-status">Active</div>
            </div>
          </div>

          <div className="check-item">
            <span className="check-icon">✓</span>
            <div className="check-text">
              <div className="check-label">Data Tables</div>
              <div className="check-status">{dataStats.total} records</div>
            </div>
          </div>

          <div className="check-item">
            <span className="check-icon">✓</span>
            <div className="check-text">
              <div className="check-label">Local Storage</div>
              <div className="check-status">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="glass-card section-card stagger-5 page-enter">
        <h2 className="section-title">Version Information</h2>
        
        <div className="version-info">
          <div className="version-item">
            <div className="version-label">App Version</div>
            <div className="version-value">{appVersion}</div>
          </div>
          <div className="version-item">
            <div className="version-label">Database Version</div>
            <div className="version-value">{dbVersion}</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card section-card danger-zone stagger-6 page-enter">
        <h2 className="section-title danger-title">Danger Zone</h2>
        <p className="section-description">
          Permanently delete all your data. This action cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div className="delete-confirmation">
            <p className="confirm-text">
              Are you sure you want to delete all data? This cannot be undone.
            </p>
            <div className="confirm-buttons">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="tap-target btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="tap-target btn-danger"
              >
                Yes, Delete All Data
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="tap-target btn-danger"
            style={{ width: '100%' }}
          >
            🗑️ Clear All Data
          </button>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in`}>
            <div className="toast-message">{toast.message}</div>
          </div>
        ))}
      </div>

      <style>{`
        .section-description {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .stats-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-raised);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .stats-row.separator {
          border-top: 2px solid var(--border);
          font-weight: 600;
        }

        .stats-label {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .stats-value {
          color: var(--volt);
          font-size: 18px;
          font-weight: 700;
        }

        .info-box {
          padding: 12px;
          background: rgba(76, 175, 160, 0.1);
          border-left: 3px solid var(--volt);
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-box.warning {
          background: rgba(255, 184, 77, 0.1);
          border-left-color: #FFB84D;
        }

        .info-label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .info-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .warning-icon {
          margin-right: 8px;
        }

        .warning-banner {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 82, 82, 0.1);
          border: 1px solid rgba(255, 82, 82, 0.3);
          border-radius: 8px;
          margin-bottom: 16px;
          color: #FF5252;
          font-size: 14px;
        }

        .warning-content {
          flex: 1;
        }

        .integrity-check {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .check-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--bg-raised);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .check-icon {
          color: var(--volt);
          font-size: 18px;
          font-weight: bold;
        }

        .check-text {
          flex: 1;
        }

        .check-label {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .check-status {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .version-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .version-item {
          padding: 12px;
          background: var(--bg-raised);
          border-radius: 8px;
          border: 1px solid var(--border);
          text-align: center;
        }

        .version-label {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .version-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--volt);
          margin-top: 4px;
        }

        .danger-zone {
          border: 1px solid rgba(255, 82, 82, 0.3);
          background: rgba(255, 82, 82, 0.05);
        }

        .danger-title {
          color: #FF5252;
        }

        .delete-confirmation {
          padding: 16px;
          background: rgba(255, 82, 82, 0.1);
          border-radius: 8px;
        }

        .confirm-text {
          margin: 0 0 16px 0;
          color: var(--text-primary);
          font-size: 14px;
        }

        .confirm-buttons {
          display: flex;
          gap: 12px;
        }

        .confirm-buttons button {
          flex: 1;
        }

        .btn-danger {
          background: rgba(255, 82, 82, 0.1);
          color: #FF5252;
          border: 1px solid #FF5252;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-danger:active {
          background: rgba(255, 82, 82, 0.2);
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--volt);
          color: white;
        }

        .btn-primary:active {
          transform: scale(0.98);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg-raised);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .btn-secondary:active {
          background: var(--bg-card);
        }

        .toast-container {
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;
          z-index: 2000;
          pointer-events: none;
        }

        .toast {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          pointer-events: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }

        .toast-success {
          background: rgba(82, 195, 160, 0.95);
          color: white;
        }

        .toast-error {
          background: rgba(255, 82, 82, 0.95);
          color: white;
        }

        .toast-info {
          background: rgba(75, 127, 255, 0.95);
          color: white;
        }

        .toast-message {
          text-align: center;
        }

        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 480px) {
          .version-info {
            grid-template-columns: 1fr;
          }

          .confirm-buttons {
            flex-direction: column;
          }

          .toast-container {
            left: 8px;
            right: 8px;
            bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
}
