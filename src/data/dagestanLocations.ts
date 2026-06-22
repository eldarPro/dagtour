export interface Place {
  name: string;
  lat: number;
  lng: number;
}

export interface District {
  name: string;
  settlements: Place[];
}

export const cities: Place[] = [
  { name: 'Махачкала', lat: 42.9849, lng: 47.5047 },
  { name: 'Дербент', lat: 42.0599, lng: 48.2733 },
  { name: 'Хасавюрт', lat: 43.2499, lng: 46.5852 },
  { name: 'Каспийск', lat: 42.8824, lng: 47.6382 },
  { name: 'Избербаш', lat: 42.5681, lng: 47.8726 },
  { name: 'Буйнакск', lat: 42.8192, lng: 47.1137 },
  { name: 'Кизляр', lat: 43.8486, lng: 46.7218 },
  { name: 'Кизилюрт', lat: 43.2022, lng: 46.8704 },
  { name: 'Дагестанские Огни', lat: 42.1098, lng: 48.1867 },
];

export const districts: District[] = [
  {
    name: 'Агульский район',
    settlements: [
      { name: 'Тпиг', lat: 42.095, lng: 47.302 },
      { name: 'Буршаг', lat: 42.085, lng: 47.282 },
      { name: 'Хутхул', lat: 42.112, lng: 47.320 },
      { name: 'Цирхе', lat: 42.075, lng: 47.290 },
    ],
  },
  {
    name: 'Акушинский район',
    settlements: [
      { name: 'Акуша', lat: 42.290, lng: 47.182 },
      { name: 'Усиша', lat: 42.352, lng: 47.155 },
      { name: 'Цудахар', lat: 42.265, lng: 47.162 },
      { name: 'Муги', lat: 42.278, lng: 47.195 },
    ],
  },
  {
    name: 'Ахвахский район',
    settlements: [
      { name: 'Карата', lat: 42.473, lng: 46.362 },
      { name: 'Ратлуб', lat: 42.455, lng: 46.345 },
      { name: 'Тад-Магитль', lat: 42.482, lng: 46.378 },
      { name: 'Ахвах', lat: 42.467, lng: 46.355 },
    ],
  },
  {
    name: 'Ахтынский район',
    settlements: [
      { name: 'Ахты', lat: 41.466, lng: 47.715 },
      { name: 'Смугул', lat: 41.455, lng: 47.732 },
      { name: 'Хрюг', lat: 41.495, lng: 47.682 },
      { name: 'Зрых', lat: 41.478, lng: 47.702 },
      { name: 'Луткун', lat: 41.448, lng: 47.745 },
    ],
  },
  {
    name: 'Бабаюртовский район',
    settlements: [
      { name: 'Бабаюрт', lat: 43.601, lng: 46.810 },
      { name: 'Аверьяновка', lat: 43.622, lng: 46.835 },
      { name: 'Новый Аул', lat: 43.580, lng: 46.795 },
      { name: 'Кадыркент', lat: 43.558, lng: 46.780 },
    ],
  },
  {
    name: 'Ботлихский район',
    settlements: [
      { name: 'Ботлих', lat: 42.672, lng: 46.212 },
      { name: 'Анди', lat: 42.792, lng: 46.332 },
      { name: 'Годобери', lat: 42.688, lng: 46.238 },
      { name: 'Тандо', lat: 42.661, lng: 46.198 },
      { name: 'Зило', lat: 42.680, lng: 46.225 },
    ],
  },
  {
    name: 'Буйнакский район',
    settlements: [
      { name: 'Нижний Дженгутай', lat: 42.862, lng: 47.142 },
      { name: 'Верхний Дженгутай', lat: 42.875, lng: 47.158 },
      { name: 'Атланаул', lat: 42.848, lng: 47.130 },
      { name: 'Халимбекаул', lat: 42.855, lng: 47.148 },
      { name: 'Эрпели', lat: 42.870, lng: 47.135 },
    ],
  },
  {
    name: 'Гергебильский район',
    settlements: [
      { name: 'Гергебиль', lat: 42.601, lng: 47.038 },
      { name: 'Могох', lat: 42.620, lng: 47.055 },
      { name: 'Гапшима', lat: 42.588, lng: 47.022 },
      { name: 'Обода', lat: 42.612, lng: 47.048 },
    ],
  },
  {
    name: 'Гумбетовский район',
    settlements: [
      { name: 'Мехельта', lat: 42.895, lng: 46.552 },
      { name: 'Зубутли', lat: 42.912, lng: 46.568 },
      { name: 'Инхело', lat: 42.878, lng: 46.540 },
      { name: 'Арани', lat: 42.905, lng: 46.542 },
    ],
  },
  {
    name: 'Гунибский район',
    settlements: [
      { name: 'Гуниб', lat: 42.383, lng: 46.952 },
      { name: 'Согратль', lat: 42.358, lng: 46.912 },
      { name: 'Чох', lat: 42.372, lng: 46.932 },
      { name: 'Кегер', lat: 42.395, lng: 46.968 },
      { name: 'Куяда', lat: 42.405, lng: 46.978 },
    ],
  },
  {
    name: 'Дахадаевский район',
    settlements: [
      { name: 'Уркарах', lat: 42.172, lng: 47.505 },
      { name: 'Кубачи', lat: 42.095, lng: 47.478 },
      { name: 'Кища', lat: 42.188, lng: 47.522 },
      { name: 'Харбук', lat: 42.155, lng: 47.495 },
    ],
  },
  {
    name: 'Дербентский район',
    settlements: [
      { name: 'Мамедкала', lat: 42.178, lng: 48.225 },
      { name: 'Берикей', lat: 42.198, lng: 48.240 },
      { name: 'Белиджи', lat: 42.048, lng: 48.315 },
      { name: 'Геджух', lat: 42.112, lng: 48.268 },
      { name: 'Падар', lat: 42.032, lng: 48.338 },
    ],
  },
  {
    name: 'Докузпаринский район',
    settlements: [
      { name: 'Усухчай', lat: 41.523, lng: 47.800 },
      { name: 'Мискинджа', lat: 41.510, lng: 47.815 },
      { name: 'Фий', lat: 41.535, lng: 47.792 },
    ],
  },
  {
    name: 'Казбековский район',
    settlements: [
      { name: 'Дылым', lat: 43.018, lng: 46.862 },
      { name: 'Геметюбе', lat: 43.035, lng: 46.878 },
      { name: 'Алмак', lat: 43.002, lng: 46.848 },
      { name: 'Байрамаул', lat: 43.025, lng: 46.870 },
    ],
  },
  {
    name: 'Кайтагский район',
    settlements: [
      { name: 'Маджалис', lat: 42.195, lng: 47.782 },
      { name: 'Янгикент', lat: 42.212, lng: 47.798 },
      { name: 'Джибахни', lat: 42.178, lng: 47.768 },
      { name: 'Нижний Башлы', lat: 42.205, lng: 47.810 },
    ],
  },
  {
    name: 'Карабудахкентский район',
    settlements: [
      { name: 'Карабудахкент', lat: 42.728, lng: 47.532 },
      { name: 'Губден', lat: 42.752, lng: 47.548 },
      { name: 'Доргели', lat: 42.712, lng: 47.518 },
      { name: 'Кака-Шура', lat: 42.738, lng: 47.540 },
    ],
  },
  {
    name: 'Каякентский район',
    settlements: [
      { name: 'Каякент', lat: 42.422, lng: 48.012 },
      { name: 'Новокаякент', lat: 42.438, lng: 48.025 },
      { name: 'Герга', lat: 42.405, lng: 47.998 },
      { name: 'Сагаси-Дейбук', lat: 42.412, lng: 48.005 },
    ],
  },
  {
    name: 'Кизилюртовский район',
    settlements: [
      { name: 'Комсомольское', lat: 43.238, lng: 46.882 },
      { name: 'Зубутли-Миатли', lat: 43.255, lng: 46.898 },
      { name: 'Новый Чиркей', lat: 43.248, lng: 46.912 },
      { name: 'Куруш', lat: 43.228, lng: 46.872 },
    ],
  },
  {
    name: 'Кизлярский район',
    settlements: [
      { name: 'Крайновка', lat: 44.062, lng: 46.548 },
      { name: 'Брянск', lat: 43.938, lng: 46.688 },
      { name: 'Новогладовская', lat: 43.922, lng: 46.672 },
      { name: 'Красная Партизанка', lat: 43.955, lng: 46.705 },
    ],
  },
  {
    name: 'Кулинский район',
    settlements: [
      { name: 'Вачи', lat: 42.022, lng: 47.098 },
      { name: 'Хосрех', lat: 42.038, lng: 47.115 },
      { name: 'Кули', lat: 42.010, lng: 47.082 },
      { name: 'Вихли', lat: 42.015, lng: 47.090 },
    ],
  },
  {
    name: 'Кумторкалинский район',
    settlements: [
      { name: 'Кумторкала', lat: 43.218, lng: 47.225 },
      { name: 'Ленинкент', lat: 43.055, lng: 47.485 },
      { name: 'Тюбе', lat: 43.198, lng: 47.212 },
      { name: 'Альбурикент', lat: 43.038, lng: 47.502 },
    ],
  },
  {
    name: 'Курахский район',
    settlements: [
      { name: 'Курах', lat: 41.882, lng: 47.482 },
      { name: 'Усуг', lat: 41.898, lng: 47.498 },
      { name: 'Куркент', lat: 41.868, lng: 47.468 },
    ],
  },
  {
    name: 'Лакский район',
    settlements: [
      { name: 'Кумух', lat: 42.148, lng: 47.055 },
      { name: 'Хосрех', lat: 42.165, lng: 47.072 },
      { name: 'Балхар', lat: 42.132, lng: 47.038 },
      { name: 'Цовкра', lat: 42.115, lng: 47.020 },
    ],
  },
  {
    name: 'Левашинский район',
    settlements: [
      { name: 'Леваши', lat: 42.430, lng: 47.320 },
      { name: 'Хаджалмахи', lat: 42.412, lng: 47.305 },
      { name: 'Цудахар', lat: 42.448, lng: 47.335 },
      { name: 'Унчукатль', lat: 42.422, lng: 47.312 },
    ],
  },
  {
    name: 'Магарамкентский район',
    settlements: [
      { name: 'Магарамкент', lat: 41.602, lng: 48.102 },
      { name: 'Советское', lat: 41.618, lng: 48.118 },
      { name: 'Хош', lat: 41.588, lng: 48.088 },
      { name: 'Бильбиль', lat: 41.612, lng: 48.112 },
    ],
  },
  {
    name: 'Новолакский район',
    settlements: [
      { name: 'Новолакское', lat: 43.115, lng: 46.782 },
      { name: 'Чапаево', lat: 43.132, lng: 46.798 },
      { name: 'Новокули', lat: 43.102, lng: 46.768 },
    ],
  },
  {
    name: 'Ногайский район',
    settlements: [
      { name: 'Терекли-Мектеб', lat: 44.382, lng: 46.052 },
      { name: 'Кунбатар', lat: 44.398, lng: 46.068 },
      { name: 'Нефтекумск (Дагестан)', lat: 44.362, lng: 46.038 },
    ],
  },
  {
    name: 'Рутульский район',
    settlements: [
      { name: 'Рутул', lat: 41.532, lng: 47.342 },
      { name: 'Ихрек', lat: 41.548, lng: 47.358 },
      { name: 'Хнов', lat: 41.518, lng: 47.328 },
      { name: 'Мюхрек', lat: 41.542, lng: 47.352 },
    ],
  },
  {
    name: 'Сергокалинский район',
    settlements: [
      { name: 'Сергокала', lat: 42.522, lng: 47.522 },
      { name: 'Гурбуки', lat: 42.538, lng: 47.538 },
      { name: 'Мюрего', lat: 42.508, lng: 47.508 },
    ],
  },
  {
    name: 'Сулейман-Стальский район',
    settlements: [
      { name: 'Касумкент', lat: 41.802, lng: 48.002 },
      { name: 'Ашага-Стал', lat: 41.818, lng: 48.018 },
      { name: 'Юхари-Стал', lat: 41.825, lng: 48.025 },
      { name: 'Испик', lat: 41.788, lng: 47.988 },
    ],
  },
  {
    name: 'Табасаранский район',
    settlements: [
      { name: 'Хучни', lat: 42.018, lng: 47.978 },
      { name: 'Хурик', lat: 42.032, lng: 47.992 },
      { name: 'Татиль', lat: 42.005, lng: 47.965 },
      { name: 'Дюбек', lat: 42.038, lng: 48.000 },
    ],
  },
  {
    name: 'Тарумовский район',
    settlements: [
      { name: 'Тарумовка', lat: 44.018, lng: 46.502 },
      { name: 'Кочубей', lat: 44.352, lng: 46.488 },
      { name: 'Юрковка', lat: 44.038, lng: 46.518 },
      { name: 'Дмитриевское', lat: 44.002, lng: 46.482 },
    ],
  },
  {
    name: 'Тляратинский район',
    settlements: [
      { name: 'Тлярата', lat: 42.322, lng: 46.028 },
      { name: 'Камилух', lat: 42.338, lng: 46.042 },
      { name: 'Цумали', lat: 42.308, lng: 46.015 },
    ],
  },
  {
    name: 'Унцукульский район',
    settlements: [
      { name: 'Унцукуль', lat: 42.702, lng: 46.758 },
      { name: 'Гимры', lat: 42.718, lng: 46.772 },
      { name: 'Ирганай', lat: 42.688, lng: 46.745 },
      { name: 'Балаханы', lat: 42.712, lng: 46.762 },
    ],
  },
  {
    name: 'Хасавюртовский район',
    settlements: [
      { name: 'Бамматюрт', lat: 43.282, lng: 46.598 },
      { name: 'Эндирей', lat: 43.298, lng: 46.612 },
      { name: 'Аксай', lat: 43.312, lng: 46.625 },
      { name: 'Султанянгиюрт', lat: 43.268, lng: 46.585 },
    ],
  },
  {
    name: 'Хивский район',
    settlements: [
      { name: 'Хив', lat: 41.882, lng: 47.802 },
      { name: 'Ханаг', lat: 41.898, lng: 47.818 },
      { name: 'Эминхюр', lat: 41.868, lng: 47.788 },
    ],
  },
  {
    name: 'Хунзахский район',
    settlements: [
      { name: 'Хунзах', lat: 42.572, lng: 46.732 },
      { name: 'Батлух', lat: 42.558, lng: 46.718 },
      { name: 'Арани', lat: 42.585, lng: 46.745 },
      { name: 'Гоцатль', lat: 42.562, lng: 46.728 },
    ],
  },
  {
    name: 'Цумадинский район',
    settlements: [
      { name: 'Агвали', lat: 42.548, lng: 46.022 },
      { name: 'Кеди', lat: 42.562, lng: 46.038 },
      { name: 'Тинди', lat: 42.575, lng: 46.052 },
      { name: 'Цумади', lat: 42.535, lng: 46.010 },
    ],
  },
  {
    name: 'Цунтинский район',
    settlements: [
      { name: 'Кидеро', lat: 42.182, lng: 46.122 },
      { name: 'Шаури', lat: 42.198, lng: 46.138 },
      { name: 'Генух', lat: 42.168, lng: 46.108 },
    ],
  },
  {
    name: 'Чародинский район',
    settlements: [
      { name: 'Цуриб', lat: 42.432, lng: 46.572 },
      { name: 'Ричаганиб', lat: 42.448, lng: 46.588 },
      { name: 'Тидиб', lat: 42.418, lng: 46.558 },
    ],
  },
  {
    name: 'Шамильский район',
    settlements: [
      { name: 'Хебда', lat: 42.472, lng: 46.262 },
      { name: 'Хотода', lat: 42.488, lng: 46.278 },
      { name: 'Урада', lat: 42.458, lng: 46.248 },
      { name: 'Келеб', lat: 42.495, lng: 46.288 },
    ],
  },
];

// settlement name (lower) → district name
const _settlementToDistrict = new Map<string, string>();
for (const d of districts) {
  for (const s of d.settlements) {
    _settlementToDistrict.set(s.name.toLowerCase(), d.name);
  }
}

/** Returns the district name for a given city/settlement name, or undefined if not found. */
export function getSettlementDistrict(name?: string): string | undefined {
  if (!name) return undefined;
  return _settlementToDistrict.get(name.toLowerCase());
}
