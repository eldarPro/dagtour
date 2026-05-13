import { supabase } from './supabase';

const SMS_GOROD_API_URL = "https://new.smsgorod.ru/apiSms/create";
const DEFAULT_SENDER = "VIRTA";
const CODE_TTL_MINUTES = 5;

// Коды стран СНГ
const CIS_COUNTRIES = ["370", "371", "372", "373", "374", "375", "380",
                       "992", "993", "994", "995", "996", "998", "398"];

interface SendSmsResult {
  success: boolean;
  error?: string;
}

interface VerifyResult {
  success: boolean;
  error?: string;
  userId?: string;
  isNewUser?: boolean;
}

// Нормализация телефона - оставляем только цифры
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

// Проверка, является ли номер российским
function isRussianPhone(phone: string): boolean {
  const code = extractCountryCode(phone);
  return code === "7";
}

// Проверка, является ли номер из СНГ
function isCisPhone(phone: string): boolean {
  const code = extractCountryCode(phone);
  return CIS_COUNTRIES.includes(code);
}

// Извлечение кода страны
function extractCountryCode(phone: string): string {
  const cleaned = normalizePhone(phone);
  
  // Проверяем трехзначные коды СНГ
  for (const code of CIS_COUNTRIES) {
    if (cleaned.startsWith(code)) {
      return code;
    }
  }
  
  // Проверяем код 7 (Россия/Казахстан)
  if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
    return "7";
  }
  
  return "";
}

// Проверка валидности номера
function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  return /^\+?\d{7,15}$/.test(cleaned);
}

// Генерация случайного кода
function generateCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Форматирование кода для SMS (XXX-XXX)
function formatCode(code: number): string {
  const codeStr = code.toString();
  return `${codeStr.slice(0, 3)}-${codeStr.slice(3)}`;
}

// Получение текста SMS в зависимости от страны
function getSmsText(phone: string): string {
  const textRu = "as-salam.ru: Ваш код ";
  const textEn = "as-salam.ru: Your code is ";
  
  if (isRussianPhone(phone) || isCisPhone(phone)) {
    return textRu;
  }
  return textEn;
}

// Проверка, не отправляли ли недавно код на этот номер
async function checkRecentCode(phone: string): Promise<boolean> {
  const normalizedPhone = normalizePhone(phone);
  const { data, error } = await supabase
    .from('otp_codes')
    .select('id')
    .eq('phone', normalizedPhone)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  
  return !!data && !error;
}

// Отправка SMS с кодом
export async function sendSmsCode(phone: string): Promise<SendSmsResult> {
  const normalizedPhone = normalizePhone(phone);
  
  if (!isValidPhone(phone)) {
    return { success: false, error: 'Некорректный номер телефона' };
  }
  
  // Проверяем, не отправляли ли недавно код
  const hasRecentCode = await checkRecentCode(phone);
  if (hasRecentCode) {
    return { success: false, error: 'Код уже был отправлен. Подождите 5 минут.' };
  }
  
  const code = generateCode();
  const text = getSmsText(phone) + formatCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
  
  // Отправляем SMS через API (нужен API ключ)
  const apiKey = import.meta.env.VITE_SMS_GOROD_API_KEY;
  
  if (!apiKey) {
    // Если нет API ключа, просто сохраняем код для тестирования
    console.log('SMS API key not configured, using test mode');
    
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalizedPhone,
        code: code,
        context: 'auth',
        used: false,
        expires_at: expiresAt,
      });
    
    if (insertError) {
      return { success: false, error: 'Ошибка при сохранении кода' };
    }
    
    // В тестовом режиме возвращаем код для проверки
    console.log(`Test mode: Code for ${phone} is ${formatCode(code)}`);
    return { success: true };
  }
  
  try {
    const payload = {
      apiKey: apiKey,
      sms: [
        {
          channel: "char",
          phone: normalizedPhone,
          text: text,
          sender: DEFAULT_SENDER,
        },
      ],
    };
    
    const response = await fetch(SMS_GOROD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMS API error:', response.status, errorText);
      return { success: false, error: 'Ошибка отправки SMS' };
    }
    
    // Сохраняем код в БД
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalizedPhone,
        code: code,
        context: 'auth',
        used: false,
        expires_at: expiresAt,
      });
    
    if (insertError) {
      return { success: false, error: 'Ошибка при сохранении кода' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: 'Ошибка сети при отправке SMS' };
  }
}

// Проверка кода и авторизация/регистрация пользователя
export async function verifyCodeAndAuth(phone: string, code: string): Promise<VerifyResult> {
  const normalizedPhone = normalizePhone(phone);
  const codeNumber = parseInt(code.replace(/\D/g, ''), 10);
  
  if (isNaN(codeNumber) || codeNumber < 100000 || codeNumber > 999999) {
    return { success: false, error: 'Введите 6-значный код' };
  }
  
  // Ищем валидный код
  const { data: otpRecord, error: otpError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('phone', normalizedPhone)
    .eq('code', codeNumber)
    .eq('context', 'auth')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  
  if (otpError || !otpRecord) {
    return { success: false, error: 'Неверный или истёкший код' };
  }
  
  // Помечаем код как использованный
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', otpRecord.id);
  
  // Ищем существующего пользователя по телефону
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('phone', normalizedPhone)
    .maybeSingle();
  
  if (existingProfile) {
    // Пользователь существует - создаём анонимную сессию через Magic Link
    // Supabase не поддерживает напрямую phone auth без настройки,
    // поэтому используем workaround: создаём临时ный email на основе телефона
    
    const tempEmail = `phone_${normalizedPhone}@assalam.local`;
    
    // Пробуем создать или получить пользователя
    const { data: userData, error: userError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });
    
    // Если phone auth не настроен, используем альтернативный метод
    if (userError && userError.message.includes('phone')) {
      // Создаём пользователя через admin API (требуется service_role key)
      // Или используем magic link с телефоном как email
      return { 
        success: false, 
        error: 'Настройте Phone Auth в Supabase для использования авторизации по телефону' 
      };
    }
    
    return { 
      success: true, 
      userId: existingProfile.id,
      isNewUser: false 
    };
  }
  
  // Новый пользователь - создаём аккаунт
  // Для этого нужно использовать Supabase Admin API
  // Пока вернём информацию о необходимости создания пользователя
  
  // Получаем следующий номер пользователя
  const { data: nextNumberData } = await supabase.rpc('get_next_user_number');
  const nextNumber = nextNumberData || 1;
  const userName = `User #${nextNumber}`;
  
  // Создаём пользователя через magic link с телефоном
  // В реальном приложении нужно использовать Admin API для создания пользователя
  // Здесь мы возвращаем информацию для создания профиля
  
  return {
    success: true,
    isNewUser: true,
    userId: undefined,
    error: undefined
  };
}

// Альтернативный метод: создание пользователя через Admin API
export async function createUserWithPhone(phone: string): Promise<{ userId?: string; error?: string }> {
  const normalizedPhone = normalizePhone(phone);
  
  // Проверяем, нет ли уже пользователя
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', normalizedPhone)
    .maybeSingle();
  
  if (existingProfile) {
    return { userId: existingProfile.id };
  }
  
  // Получаем следующий номер
  const { data: nextNumberData } = await supabase.rpc('get_next_user_number');
  const nextNumber = nextNumberData || 1;
  const userName = `User #${nextNumber}`;
  
  // Создаём анонимного пользователя (без email)
  // Для этого нужен service_role ключ на клиенте (небезопасно для продакшена)
  // В продакшене это должно быть на сервере/edge function
  
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (serviceRoleKey) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          phone_confirm: true,
          user_metadata: {
            phone: normalizedPhone,
            full_name: userName,
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Admin user creation error:', errorData);
        return { error: 'Не удалось создать пользователя' };
      }
      
      const userData = await response.json();
      return { userId: userData.id };
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: 'Ошибка при создании пользователя' };
    }
  }
  
  return { error: 'Настройте SERVICE_ROLE_KEY для создания пользователей' };
}
