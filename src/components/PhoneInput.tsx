import React, { useState, useRef, useEffect } from 'react';
import { IonModal, IonSearchbar, IonList, IonItem, IonLabel } from '@ionic/react';
import { countries, Country } from '../data/countries';
import './PhoneInput.css';

const RUSSIA = countries.find(c => c.iso === 'RU')!;

const applyMask = (digits: string, mask: string | string[]): string => {
  const m = Array.isArray(mask) ? mask[0] : mask;
  let result = '';
  let di = 0;
  for (let i = 0; i < m.length; i++) {
    if (di >= digits.length) break;
    if (m[i] === '9') {
      result += digits[di++];
    } else {
      result += m[i];
    }
  }
  return result;
};

const getPlaceholder = (mask: string | string[]): string => {
  const m = Array.isArray(mask) ? mask[0] : mask;
  return m.replace(/9/g, '_');
};

const parseInitialValue = (val: string): { country: Country; digits: string } => {
  if (!val) return { country: RUSSIA, digits: '' };
  const normalized = val.startsWith('+') ? val : '+' + val;
  const sorted = [...countries].sort((a, b) => b.code.length - a.code.length);
  const match = sorted.find(c => normalized.startsWith(c.code));
  if (match) {
    return { country: match, digits: normalized.slice(match.code.length).replace(/\D/g, '') };
  }
  return { country: RUSSIA, digits: val.replace(/\D/g, '') };
};

interface PhoneInputProps {
  value?: string;
  onChange: (fullNumber: string) => void;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value = '', onChange, disabled }) => {
  const parsed = parseInitialValue(value);
  const [country, setCountry] = useState<Country>(parsed.country);
  const [digits, setDigits] = useState(parsed.digits);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) { skipFirst.current = false; return; }
    const raw = digits.replace(/\D/g, '');
    onChange(country.code + raw);
  }, [digits, country]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const mask = Array.isArray(country.mask) ? country.mask[0] : country.mask;
    const maxDigits = (mask.match(/9/g) || []).length;
    setDigits(raw.slice(0, maxDigits));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && digits.length === 0) return;
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setDigits('');
    setModalOpen(false);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const filtered = search
    ? countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : countries;

  const formatted = applyMask(digits, country.mask);
  const placeholder = getPlaceholder(country.mask);

  return (
    <>
      <div className={`phone-input${disabled ? ' phone-input--disabled' : ''}`}>
        <button
          type="button"
          className="phone-input__country-btn"
          onClick={() => !disabled && setModalOpen(true)}
          disabled={disabled}
        >
          <img src={country.flag} alt={country.iso} className="phone-input__flag" />
          <span className="phone-input__code">{country.code}</span>
          <svg className="phone-input__arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M7.5 12L2.73686 5.25L12.2631 5.25L7.5 12Z" fill="#8291AF" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          className="phone-input__field"
          value={formatted}
          placeholder={placeholder}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>

      <IonModal
        isOpen={modalOpen}
        onDidDismiss={() => { setModalOpen(false); setSearch(''); }}
        breakpoints={[0, 0.9]}
        initialBreakpoint={0.9}
      >
        <div className="phone-input__modal">
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(e.detail.value ?? '')}
            placeholder="Поиск страны"
            debounce={0}
          />
          <IonList className="phone-input__country-list">
            {filtered.map(c => (
              <IonItem
                key={c.iso}
                button
                detail={false}
                onClick={() => selectCountry(c)}
                className={c.iso === country.iso ? 'phone-input__country-item--active' : ''}
              >
                <img src={c.flag} alt={c.iso} className="phone-input__flag phone-input__flag--list" slot="start" />
                <IonLabel>
                  <span className="phone-input__country-name">{c.name}</span>
                  <span className="phone-input__country-code">{c.code}</span>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonModal>
    </>
  );
};

export default PhoneInput;
