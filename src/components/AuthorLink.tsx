import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonText } from '@ionic/react';
import { chevronForwardOutline, personOutline } from 'ionicons/icons';
import { Author } from '../lib/api';

interface Props {
  author?: Author;
}

const AuthorLink: React.FC<Props> = ({ author }) => {
  const history = useHistory();

  if (!author) return null;

  return (
    <div
      className="reviews-link-row"
      onClick={() => history.push(`/users/${author.id}`)}
    >
      <div className="reviews-link-left">
        <IonIcon icon={personOutline} style={{ fontSize: 18, color: 'var(--ion-text-color)' }} />
        <IonText>
          <span className="reviews-link-label">{author.fullName ?? 'Автор'}</span>
        </IonText>
      </div>
      <IonIcon icon={chevronForwardOutline} color="medium" style={{ fontSize: 18 }} />
    </div>
  );
};

export default AuthorLink;
