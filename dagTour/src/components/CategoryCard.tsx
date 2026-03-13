import React from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import './CategoryCard.css';

interface CategoryCardProps {
  title: string;
  icon: string;
  count: number;
  href: string;
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon, count, href, color }) => {
  return (
    <IonCard className="category-card" routerLink={href}>
      <IonCardContent className="category-card-content">
        <div className="category-icon" style={{ backgroundColor: color }}>
          <IonIcon icon={icon} />
        </div>
        <h3>{title}</h3>
        <p>{count} предложений</p>
      </IonCardContent>
    </IonCard>
  );
};

export default CategoryCard;
