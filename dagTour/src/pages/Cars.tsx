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
import CarCard from '../components/CarCard';
import { cars } from '../data/mockData';
import './Cars.css';

const types = ['Все', 'эконом', 'комфорт', 'внедорожник'];

const Cars: React.FC = () => {
  const [selectedType, setSelectedType] = useState('Все');

  const filtered = selectedType === 'Все'
    ? cars
    : cars.filter((c) => c.type === selectedType);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда авто</IonTitle>
        </IonToolbar>
        <IonToolbar className="filter-toolbar">
          <IonSegment
            scrollable
            value={selectedType}
            onIonChange={(e) => setSelectedType(e.detail.value as string)}
          >
            {types.map((type) => (
              <IonSegmentButton key={type} value={type}>
                <IonLabel>{type === 'Все' ? 'Все' : type.charAt(0).toUpperCase() + type.slice(1)}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="list-content">
        <IonList lines="none" className="card-list">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Cars;
