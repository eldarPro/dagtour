import React, { useState } from 'react';
import { IonItem, IonLabel, IonNote } from '@ionic/react';
import LocationModal from './LocationModal';
import './LocationPicker.css';

export interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (loc: LocationValue) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IonItem button onClick={() => setIsOpen(true)}>
        <IonLabel position="stacked">Местоположение</IonLabel>
        {value ? (
          <div className="location-picker-value">{value.address}</div>
        ) : (
          <IonNote>Не выбрано</IonNote>
        )}
      </IonItem>

      <LocationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(loc) => {
          onChange(loc);
          setIsOpen(false);
        }}
      />
    </>
  );
};

export default LocationPicker;
