import { useState, useRef } from 'react';

export interface ContactFields {
  phone: string;
  whatsapp: string;
  telegram: string;
  vk: string;
}

export interface ContactErrors {
  telegram?: string;
  whatsapp?: string;
  vk?: string;
}

const TELEGRAM_REGEX = /^([a-zA-Z][a-zA-Z0-9_]{4,31}|\+?[0-9]{7,15})$/;
const WHATSAPP_REGEX = /^\+?[0-9]{7,15}$/;
const VK_REGEX = /^[a-zA-Z0-9_.]{2,50}$/;

const EMPTY: ContactFields = {
  phone: '', whatsapp: '', telegram: '', vk: '',
};

export function useContactFields() {
  const [contacts, setContacts] = useState<ContactFields>({ ...EMPTY });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [phoneKey, setPhoneKey] = useState('');
  const contactRef = useRef<ContactFields>({ ...EMPTY });

  const updateContact = (field: keyof ContactFields, value: string) => {
    setContacts(prev => ({ ...prev, [field]: value }));
    contactRef.current[field] = value;
    setContactErrors(prev => {
      if (prev[field as keyof ContactErrors] !== undefined) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  };

  const loadContacts = (data: Partial<ContactFields>, initPhoneKey?: string) => {
    const next: ContactFields = { ...EMPTY, ...data };
    setContacts(next);
    contactRef.current = { ...next };
    if (initPhoneKey !== undefined) setPhoneKey(initPhoneKey);
  };

  const validateContacts = (): boolean => {
    const fields = contactRef.current;
    const errs: ContactErrors = {};

    if (fields.telegram.trim() && !TELEGRAM_REGEX.test(fields.telegram.trim())) {
      errs.telegram = 'Укажите username или номер телефона';
    }
    if (fields.whatsapp.trim() && !WHATSAPP_REGEX.test(fields.whatsapp.trim())) {
      errs.whatsapp = 'Укажите номер телефона (например +79001234567)';
    }
    if (fields.vk.trim() && !VK_REGEX.test(fields.vk.trim())) {
      errs.vk = 'Укажите username профиля ВКонтакте';
    }

    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return { contacts, contactRef, contactErrors, updateContact, loadContacts, validateContacts, phoneKey, setPhoneKey };
}
