import React from 'react';
import PhoneInput from './PhoneInput';
import { ContactFields, ContactErrors } from '../lib/useContactFields';
import './ContactSection.css';

const WhatsAppIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#25D366"/>
    <path fill="white" d="M14 5.5C9.3 5.5 5.5 9.3 5.5 14c0 1.48.37 2.87 1.03 4.09L5.5 22.5l4.52-1.18A8.44 8.44 0 0014 22.5c4.7 0 8.5-3.8 8.5-8.5S18.7 5.5 14 5.5zm4.07 11.6c-.17.49-1.01.95-1.4 1.01-.36.05-.8.07-2.58-.54-2.16-.78-3.55-2.98-3.65-3.12-.1-.14-.87-1.16-.87-2.22 0-1.05.55-1.57.74-1.79.2-.21.43-.26.57-.26l.4.01c.14 0 .33.01.5.38l.64 1.59c.07.16.02.35-.07.48l-.35.48c-.1.14-.2.29-.1.54.34.7.85 1.35 1.41 1.84.6.52 1.24.87 1.86 1.06.21.07.36.05.48-.04l.5-.56c.16-.18.35-.22.56-.13l1.68.79c.21.1.4.23.4.58v.46z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#2AABEE"/>
    <path fill="white" d="M6.1 13.72 20.64 8.1c.67-.24 1.25.16 1.03.84l-2.4 11.3c-.18.8-.66.99-1.33.61l-3.68-2.71-1.78 1.72c-.2.2-.37.36-.74.36l.26-3.75 6.83-6.18c.3-.27-.06-.42-.46-.16L9.04 16.04 5.38 14.87c-.8-.25-.82-.8.72-1.15z"/>
  </svg>
);

const VKIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#0077FF"/>
    <path fill="white" d="M22.56 10.1c.14-.46 0-.8-.66-.8H19.6c-.55 0-.8.28-.94.59 0 0-1.1 2.7-2.67 4.46-.5.51-.74.67-1.02.67-.14 0-.35-.16-.35-.62v-4.3c0-.55-.16-.8-.62-.8h-3.57c-.35 0-.56.26-.56.51 0 .54.8.66.88 2.17v3.28c0 .71-.13.84-.4.84-.74 0-2.55-2.71-3.62-5.81-.21-.6-.42-.84-.98-.84H3.53c-.62 0-.74.28-.74.59 0 .55.74 3.3 3.45 6.94 1.81 2.6 4.36 4.01 6.68 4.01 1.4 0 1.56-.32 1.56-.86v-1.97c0-.62.13-.74.56-.74.32 0 .88.16 2.18 1.41 1.48 1.48 1.73 2.15 2.56 2.15h2.13c.62 0 .93-.31.75-.92-.2-.6-.9-1.48-1.83-2.52-.51-.6-1.27-1.25-1.5-1.56-.32-.42-.23-.6 0-.97 0 0 2.66-3.76 2.93-5.04z"/>
  </svg>
);


interface ContactSectionProps {
  contacts: ContactFields;
  onChange: (field: keyof ContactFields, value: string) => void;
  phoneKey?: string;
  errors?: ContactErrors;
}

const ContactSection: React.FC<ContactSectionProps> = ({ contacts, onChange, phoneKey, errors }) => (
  <div className="contact-section">
    <div className="contact-section__title">Контакты для связи</div>

    <div className="contact-section__phone-wrap">
      <div className="contact-section__label">Номер телефона <span style={{ color: 'var(--ion-color-danger)' }}>*</span></div>
      <PhoneInput key={phoneKey || 'phone'} value={contacts.phone} onChange={v => onChange('phone', v)} />
    </div>

    <div className="contact-section__social-list">
      <div className="contact-section__social-group">
        <div className={`contact-section__social-row${errors?.whatsapp ? ' contact-section__social-row--error' : ''}`}>
          <div className="contact-section__social-icon"><WhatsAppIcon /></div>
          <input
            type="tel"
            inputMode="tel"
            className="contact-section__social-input"
            placeholder="+7 900 000 00 00"
            value={contacts.whatsapp}
            onChange={e => onChange('whatsapp', e.target.value)}
          />
        </div>
        {errors?.whatsapp && <p className="contact-section__field-error">{errors.whatsapp}</p>}
      </div>

      <div className="contact-section__social-group">
        <div className={`contact-section__social-row${errors?.telegram ? ' contact-section__social-row--error' : ''}`}>
          <div className="contact-section__social-icon"><TelegramIcon /></div>
          <input
            type="text"
            className="contact-section__social-input"
            placeholder="username или +79000000000"
            value={contacts.telegram}
            onChange={e => onChange('telegram', e.target.value)}
          />
        </div>
        {errors?.telegram && <p className="contact-section__field-error">{errors.telegram}</p>}
      </div>

      <div className="contact-section__social-group">
        <div className={`contact-section__social-row${errors?.vk ? ' contact-section__social-row--error' : ''}`}>
          <div className="contact-section__social-icon"><VKIcon /></div>
          <input
            type="text"
            className="contact-section__social-input"
            placeholder="username"
            value={contacts.vk}
            onChange={e => onChange('vk', e.target.value)}
          />
        </div>
        {errors?.vk && <p className="contact-section__field-error">{errors.vk}</p>}
      </div>

    </div>
  </div>
);

export default ContactSection;
