import React, { useRef, useState } from 'react';
import { IonChip, IonLabel, IonIcon } from '@ionic/react';
import { closeCircle } from 'ionicons/icons';

interface Props {
  value: string[];
  onChange: (route: string[]) => void;
  required?: boolean;
}

const RouteTagInput: React.FC<Props> = ({ value, onChange, required }) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
      setInputVal('');
    } else if (e.key === 'Backspace' && inputVal === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputVal.trim()) {
      addTag(inputVal);
      setInputVal('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="route-tag-input-item">
      <div className="route-tag-label">
        Маршрут {required && <span className="add-tour-required">*</span>}
      </div>
      <div className="route-tag-hint">Добавьте места в правильной последовательности не учитывая город выезда</div>
      <div className="route-tag-chips">
        {value.map((point, i) => (
          <IonChip key={i} className="route-chip">
            <IonLabel>{point}</IonLabel>
            <IonIcon
              icon={closeCircle}
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            />
          </IonChip>
        ))}
      </div>
      <div className="route-tag-row">
        <input
          ref={inputRef}
          className="route-tag-native-input"
          value={inputVal}
          placeholder="Название места..."
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="route-tag-add-btn"
          onClick={() => { addTag(inputVal); setInputVal(''); inputRef.current?.focus(); }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default RouteTagInput;
