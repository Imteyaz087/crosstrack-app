import { useState, useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { db } from '../db/database';

interface PhotoLog {
  id?: number;
  date: string;
  workoutId?: number;
  blobRef?: string;
}

interface PhotoEntry {
  photo: PhotoLog;
  workoutDate?: string;
}

export function PhotoLogPage() {
  const { workouts } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupedPhotos, setGroupedPhotos] = useState<{ month: string; photos: PhotoEntry[] }[]>([]);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const allPhotos = await db.photoLogs.toArray();
      
      // Enhance photos with workout info
      const enhancedPhotos = allPhotos.map(photo => ({
        photo,
        workoutDate: photo.workoutId 
          ? workouts?.find(w => w.id === photo.workoutId)?.date 
          : undefined
      }));

      // Sort by date descending
      enhancedPhotos.sort((a, b) => new Date(b.photo.date).getTime() - new Date(a.photo.date).getTime());
      
      setPhotos(enhancedPhotos);

      // Group by month
      const grouped = new Map<string, PhotoEntry[]>();
      enhancedPhotos.forEach(entry => {
        const date = new Date(entry.photo.date);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        if (!grouped.has(monthKey)) {
          grouped.set(monthKey, []);
        }
        grouped.get(monthKey)!.push(entry);
      });

      const groupedArray = Array.from(grouped.entries()).map(([month, photos]) => ({
        month,
        photos
      }));

      setGroupedPhotos(groupedArray);

      // Calculate stats
      const now = new Date();
      const thisMonthPhotos = enhancedPhotos.filter(entry => {
        const photoDate = new Date(entry.photo.date);
        return photoDate.getMonth() === now.getMonth() && 
               photoDate.getFullYear() === now.getFullYear();
      });

      setStats({
        total: allPhotos.length,
        thisMonth: thisMonthPhotos.length
      });
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const blobRef = event.target?.result as string; // base64 data URL

        const today = new Date().toISOString().split('T')[0];
        await db.photoLogs.add({
          date: today,
          blobRef
        });

        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        loadPhotos();
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Delete this photo? This action cannot be undone.')) return;

    try {
      await db.photoLogs.delete(id);
      loadPhotos();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openPhotoModal = (photoEntry: PhotoEntry) => {
    setSelectedPhoto(photoEntry);
    setIsModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Workout Photo Log</h1>
        <p className="page-subtitle">Track your progress with photos</p>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="glass-card stagger-1">
          <div className="stat-label">Total Photos</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-unit">captured</div>
        </div>
        <div className="glass-card stagger-2">
          <div className="stat-label">This Month</div>
          <div className="stat-value">{stats.thisMonth}</div>
          <div className="stat-unit">photos</div>
        </div>
      </div>

      {/* Capture Button */}
      <div className="capture-section stagger-3 page-enter">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          style={{ display: 'none' }}
          disabled={isLoading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="tap-target btn-primary capture-btn"
        >
          {isLoading ? '📸 Uploading...' : '📸 Capture Photo'}
        </button>
        <p className="capture-hint">Tap to capture from camera or gallery</p>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="glass-card section-card empty-state stagger-4 page-enter">
          <div className="empty-icon">📷</div>
          <h3 className="empty-title">No Photos Yet</h3>
          <p className="empty-text">Capture your first workout photo to start building your progress gallery.</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tap-target btn-secondary"
            style={{ marginTop: '16px' }}
          >
            Take First Photo
          </button>
        </div>
      ) : (
        <div className="photos-section stagger-5 page-enter">
          {groupedPhotos.map((group, groupIdx) => (
            <div key={groupIdx} className="photo-group">
              <h3 className="group-title">{group.month}</h3>
              <div className="photo-grid">
                {group.photos.map((entry, photoIdx) => (
                  <div
                    key={entry.photo.id || photoIdx}
                    className="photo-card glass-card tap-target"
                    onClick={() => openPhotoModal(entry)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="photo-preview">
                      {entry.photo.blobRef ? (
                        <img
                          src={entry.photo.blobRef}
                          alt={`Photo ${entry.photo.date}`}
                          className="photo-image"
                        />
                      ) : (
                        <div className="photo-placeholder">
                          <span className="placeholder-icon">📷</span>
                        </div>
                      )}
                    </div>
                    <div className="photo-meta">
                      <div className="photo-date">{formatDate(entry.photo.date)}</div>
                      {entry.workoutDate && (
                        <div className="photo-workout">Workout Log</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {isModalOpen && selectedPhoto && (
        <div className="modal-overlay" onClick={closePhotoModal}>
          <div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close tap-target"
              onClick={closePhotoModal}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="modal-body">
              {selectedPhoto.photo.blobRef ? (
                <img
                  src={selectedPhoto.photo.blobRef}
                  alt={`Photo ${selectedPhoto.photo.date}`}
                  className="modal-image"
                />
              ) : (
                <div className="modal-placeholder">
                  <span>📷</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="modal-info">
                <p className="modal-date">{formatDate(selectedPhoto.photo.date)}</p>
                {selectedPhoto.workoutDate && (
                  <p className="modal-workout">
                    Associated with workout on {formatDate(selectedPhoto.workoutDate)}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeletePhoto(selectedPhoto.photo.id)}
                className="tap-target btn-danger"
              >
                🗑️ Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .capture-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          text-align: center;
        }

        .capture-btn {
          width: 100%;
          max-width: 300px;
          padding: 16px;
          font-size: 16px;
        }

        .capture-hint {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .photos-section {
          padding: 16px 0;
        }

        .photo-group {
          margin-bottom: 32px;
        }

        .group-title {
          padding: 0 16px;
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          padding: 0 16px;
        }

        .photo-card {
          overflow: hidden;
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .photo-card:active {
          transform: scale(0.95);
        }

        .photo-preview {
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--bg-raised);
        }

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-card), var(--bg-raised));
          font-size: 32px;
        }

        .placeholder-icon {
          opacity: 0.5;
        }

        .photo-meta {
          padding: 8px 12px;
          background: var(--bg-raised);
        }

        .photo-date {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .photo-workout {
          font-size: 11px;
          color: var(--volt);
          margin-top: 4px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.3);
          color: white;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .modal-body {
          padding: 24px 16px;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-image {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          border-radius: 8px;
        }

        .modal-placeholder {
          font-size: 64px;
          opacity: 0.3;
        }

        .modal-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .modal-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .modal-date {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-workout {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }

        .btn-danger {
          background: rgba(255, 82, 82, 0.1);
          color: #FF5252;
          border: 1px solid #FF5252;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-danger:active {
          background: rgba(255, 82, 82, 0.2);
        }

        @media (max-width: 480px) {
          .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
