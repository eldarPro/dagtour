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
import HouseCard from '../components/HouseCard';
import { houses } from '../data/mockData';
import './Houses.css';

const locations = ['Все', ...new Set(houses.map((h) => h.location))];

const Houses: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('Все');

  const filtered = selectedLocation === 'Все'
    ? houses
    : houses.filter((h) => h.location === selectedLocation);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Аренда домов</IonTitle>
        </IonToolbar>
        <IonToolbar className="filter-toolbar">
          <IonSegment
            scrollable
            value={selectedLocation}
            onIonChange={(e) => setSelectedLocation(e.detail.value as string)}
          >
            {locations.map((loc) => (
              <IonSegmentButton key={loc} value={loc}>
                <IonLabel>{loc}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="list-content">
        <IonList lines="none" className="card-list">
          {filtered.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Houses;
