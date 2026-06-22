import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton,
  IonTitle, IonContent, IonText, IonSpinner, IonButton, IonIcon,
  IonTextarea, IonAvatar, IonModal,
} from '@ionic/react';
import { star, starOutline, trashOutline, chevronBackOutline, closeOutline } from 'ionicons/icons';
import { getReviews, createReview, deleteReview, Review } from '../lib/api';
import { useAuth } from '../lib/auth';
import './Reviews.css';

const BACK: Record<string, string> = { house: '/houses', car: '/cars', tour: '/tours' };

const Stars: React.FC<{ value: number; size?: number; onChange?: (v: number) => void }> = ({ value, size = 20, onChange }) => (
  <div className="stars-row">
    {[1, 2, 3, 4, 5].map((n) => (
      <IonIcon
        key={n}
        icon={n <= value ? star : starOutline}
        style={{ fontSize: size, color: '#f59e0b', cursor: onChange ? 'pointer' : 'default' }}
        onClick={() => onChange?.(n)}
      />
    ))}
  </div>
);

const ReviewsPage: React.FC = () => {
  const { itemType, itemId } = useParams<{ itemType: string; itemId: string }>();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviews(itemType, Number(itemId));
      setReviews(data);
    } finally {
      setLoading(false);
    }
  }, [itemType, itemId]);

  useEffect(() => { load(); }, [load]);

  const isOwner = !!user && user.id === ownerId;
  const hasReviewed = !!user && reviews.some((r) => r.userId === user.id);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Выберите оценку'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const review = await createReview(itemType, Number(itemId), rating, body.trim());
      setReviews((prev) => [review, ...prev]);
      setRating(0);
      setBody('');
      setFormOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { setFormOpen(false); setError(null); };

  const handleDelete = async (id: number) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const backHref = `${BACK[itemType] ?? '/home'}/${itemId}`;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={backHref} text="" icon={chevronBackOutline} />
          </IonButtons>
          <IonTitle>Отзывы</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div className="reviews-center"><IonSpinner name="crescent" /></div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <IonText color="medium">
              <p>Пока нет отзывов.</p>
              {user && !isOwner && <p>Будьте первым!</p>}
            </IonText>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <IonAvatar className="review-avatar">
                    {r.user.avatarUrl
                      ? <img src={r.user.avatarUrl} alt="" />
                      : <div className="review-avatar-placeholder">{(r.user.fullName ?? '?')[0].toUpperCase()}</div>
                    }
                  </IonAvatar>
                  <div className="review-meta">
                    <span className="review-name">{r.user.fullName ?? 'Пользователь'}</span>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <div className="review-right">
                    <span className="review-date">{formatDate(r.createdAt)}</span>
                    {user?.id === r.userId && (
                      <IonButton fill="clear" size="small" color="danger" className="review-delete" onClick={() => handleDelete(r.id)}>
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    )}
                  </div>
                </div>
                {r.body && <p className="review-body">{r.body}</p>}
              </div>
            ))}
          </div>
        )}

        {user && !isOwner && !hasReviewed && (
          <button className="reviews-fab-btn" onClick={() => setFormOpen(true)}>
            Оставить отзыв
          </button>
        )}

        {/* Bottom sheet */}
        <IonModal
          isOpen={formOpen}
          onDidDismiss={handleClose}
          breakpoints={[0, 1]}
          initialBreakpoint={1}
          className="reviews-sheet"
        >
          <div className="reviews-sheet-content">
            <div className="reviews-sheet-header">
              <span className="reviews-sheet-title">Оставить отзыв</span>
              <button className="reviews-sheet-close" onClick={handleClose}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <p className="reviews-sheet-label">Ваша оценка</p>
            <Stars value={rating} size={36} onChange={setRating} />

            <IonTextarea
              className="reviews-textarea"
              placeholder="Расскажите о своём опыте..."
              value={body}
              onIonInput={(e) => setBody(e.detail.value ?? '')}
              rows={4}
              autoGrow
            />

            {error && <IonText color="danger"><p className="reviews-error">{error}</p></IonText>}

            <IonButton expand="block" onClick={handleSubmit} disabled={submitting} className="reviews-submit-btn">
              {submitting ? <IonSpinner name="crescent" /> : 'Отправить'}
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default ReviewsPage;
