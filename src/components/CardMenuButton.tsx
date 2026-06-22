import React from 'react';
import { IonButton, IonIcon, useIonActionSheet, useIonAlert } from '@ionic/react';
import {
  ellipsisVertical,
  settingsOutline,
  eyeOffOutline,
  eyeOutline,
  trashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './CardMenuButton.css';

interface CardMenuButtonProps {
  editHref: string;
  active?: boolean;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

const CardMenuButton: React.FC<CardMenuButtonProps> = ({
  editHref,
  active,
  onToggleActive,
  onDelete,
}) => {
  const history = useHistory();
  const [presentSheet] = useIonActionSheet();
  const [presentAlert] = useIonAlert();

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    presentSheet({
      buttons: [
        {
          text: 'Редактировать',
          icon: settingsOutline,
          cssClass: 'action-btn-edit',
          handler: () => { history.push(editHref); },
        },
        {
          text: active === false ? 'Показать объявление' : 'Скрыть объявление',
          icon: active === false ? eyeOutline : eyeOffOutline,
          cssClass: active === false ? 'action-btn-show' : 'action-btn-hide',
          handler: () => { onToggleActive?.(); },
        },
        {
          text: 'Удалить',
          icon: trashOutline,
          role: 'destructive',
          cssClass: 'action-btn-delete',
          handler: () => {
            setTimeout(() => {
              presentAlert({
                header: 'Удалить объявление?',
                message: 'Это действие нельзя отменить.',
                buttons: [
                  { text: 'Отмена', role: 'cancel' },
                  { text: 'Удалить', role: 'destructive', handler: () => { onDelete?.(); } },
                ],
              });
            }, 300);
          },
        },
        {
          text: 'Отмена',
          role: 'cancel',
        },
      ],
    });
  };

  return (
    <IonButton
      fill="clear"
      size="small"
      className="card-menu-btn"
      onClick={openMenu}
    >
      <IonIcon slot="icon-only" icon={ellipsisVertical} />
    </IonButton>
  );
};

export default CardMenuButton;
