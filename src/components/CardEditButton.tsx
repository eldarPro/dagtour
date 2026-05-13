import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import './CardEditButton.css';

interface CardEditButtonProps {
  href: string;
}

const CardEditButton: React.FC<CardEditButtonProps> = ({ href }) => (
  <IonButton
    fill="clear"
    size="small"
    className="card-edit-btn"
    routerLink={href}
    routerDirection="forward"
    onClick={(e) => e.stopPropagation()}
  >
    <IonIcon slot="icon-only" icon={settingsOutline} />
  </IonButton>
);

export default CardEditButton;
