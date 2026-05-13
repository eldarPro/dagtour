import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonSkeletonText,
} from '@ionic/react';
import './CardSkeletons.css';

export const TourCardSkeleton: React.FC = () => (
  <IonCard className="tour-card skeleton-card">
    <div className="skeleton-img" />
    <IonCardHeader>
      <IonSkeletonText animated style={{ width: '65%', height: '20px', borderRadius: '4px' }} />
      <IonSkeletonText animated style={{ width: '90%', height: '14px', marginTop: '6px', borderRadius: '4px' }} />
    </IonCardHeader>
    <IonCardContent>
      <div className="skeleton-chips">
        <IonSkeletonText animated className="skeleton-chip" />
        <IonSkeletonText animated className="skeleton-chip" />
      </div>
      <div className="skeleton-footer">
        <IonSkeletonText animated style={{ width: '35%', height: '18px', borderRadius: '4px' }} />
      </div>
    </IonCardContent>
  </IonCard>
);

export const HouseCardSkeleton: React.FC = () => (
  <IonCard className="house-card skeleton-card">
    <div className="skeleton-img" />
    <IonCardHeader>
      <IonSkeletonText animated style={{ width: '60%', height: '20px', borderRadius: '4px' }} />
      <IonSkeletonText animated style={{ width: '45%', height: '14px', marginTop: '6px', borderRadius: '4px' }} />
    </IonCardHeader>
    <IonCardContent>
      <div className="skeleton-chips">
        <IonSkeletonText animated className="skeleton-chip" />
        <IonSkeletonText animated className="skeleton-chip" />
      </div>
      <div className="skeleton-footer">
        <IonSkeletonText animated style={{ width: '35%', height: '18px', borderRadius: '4px' }} />
      </div>
    </IonCardContent>
  </IonCard>
);

export const CarCardSkeleton: React.FC = () => (
  <IonCard className="car-card skeleton-card">
    <div className="skeleton-img" />
    <IonCardHeader>
      <IonSkeletonText animated style={{ width: '55%', height: '20px', borderRadius: '4px' }} />
    </IonCardHeader>
    <IonCardContent>
      <div className="skeleton-chips">
        <IonSkeletonText animated className="skeleton-chip" />
        <IonSkeletonText animated className="skeleton-chip" />
      </div>
      <div className="skeleton-footer">
        <IonSkeletonText animated style={{ width: '35%', height: '18px', borderRadius: '4px' }} />
      </div>
    </IonCardContent>
  </IonCard>
);
