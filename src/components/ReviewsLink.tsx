import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonText } from '@ionic/react';
import { chevronForwardOutline, starOutline } from 'ionicons/icons';
import { getReviews } from '../lib/api';

interface Props {
  itemType: 'house' | 'car' | 'tour';
  itemId: number;
  rating?: number;
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const ReviewsLink: React.FC<Props> = ({ itemType, itemId, rating: _ }) => {
  const history = useHistory();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getReviews(itemType, itemId).then((r) => setCount(r.length)).catch(() => setCount(0));
  }, [itemType, itemId]);

  if (count === null) return null;

  const label = `Отзывы (${count})`;

  return (
    <div
      className="reviews-link-row"
      onClick={() => history.push(`/reviews/${itemType}/${itemId}`)}
    >
      <div className="reviews-link-left">
        <IonIcon icon={starOutline} style={{ fontSize: 18, color: '#f59e0b' }} />
        <IonText>
          <span className="reviews-link-label">{label}</span>
        </IonText>
      </div>
      <IonIcon icon={chevronForwardOutline} color="medium" style={{ fontSize: 18 }} />
    </div>
  );
};

export default ReviewsLink;
