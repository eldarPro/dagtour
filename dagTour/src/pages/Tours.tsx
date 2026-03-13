import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
} from '@ionic/react';
import TourCard from '../components/TourCard';
import { tours } from '../data/mockData';
import './Tours.css';

const durations = ['Все', '1 день', '2 дня', '3 дня'];

const Tours: React.FC = () => {
  const [selectedDuration, setSelectedDuration] = useState('Все');

  const filtered = selectedDuration === 'Все'
    ? tours
    : tours.filter((t) => t.duration === selectedDuration);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Направления туров</IonTitle>
        </IonToolbar>
        <IonToolbar className="filter-toolbar">
          <IonSegment
            scrollable
            value={selectedDuration}
            onIonChange={(e) => setSelectedDuration(e.detail.value as string)}
          >
            {durations.map((dur) => (
              <IonSegmentButton key={dur} value={dur}>
                <IonLabel>{dur}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="list-content">
        <IonList lines="none" className="card-list">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tours;
