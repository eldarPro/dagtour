export interface House {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  photo: string;
  location: string;
  rating: number;
  rooms: number;
  guests: number;
  lat: number;
  lng: number;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  pricePerDay: number;
  photo: string;
  type: 'эконом' | 'комфорт' | 'внедорожник';
  seats: number;
  transmission: string;
  lat: number;
  lng: number;
}

export interface Tour {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  photo: string;
  route: string[];
}

export const houses: House[] = [
  {
    id: 1,
    name: 'Горный дом в Гунибе',
    description: 'Уютный каменный дом с видом на горы и ущелье. Традиционная дагестанская архитектура с современным комфортом. Терраса с панорамным видом.',
    pricePerNight: 3500,
    photo: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=300&fit=crop&auto=format',
    location: 'Гуниб',
    rating: 4.8,
    rooms: 3,
    guests: 6,
    lat: 42.3894,
    lng: 46.9539,
  },
  {
    id: 2,
    name: 'Вилла у моря в Избербаше',
    description: 'Просторная вилла в 100 метрах от Каспийского моря. Собственный двор, мангальная зона, парковка. Идеально для семейного отдыха.',
    pricePerNight: 5000,
    photo: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop&auto=format',
    location: 'Избербаш',
    rating: 4.6,
    rooms: 4,
    guests: 8,
    lat: 42.5647,
    lng: 47.8736,
  },
  {
    id: 3,
    name: 'Гостевой дом в Дербенте',
    description: 'Гостевой дом в историческом центре Дербента. Рядом крепость Нарын-Кала и старый город. Завтрак включён.',
    pricePerNight: 2500,
    photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format',
    location: 'Дербент',
    rating: 4.9,
    rooms: 2,
    guests: 4,
    lat: 42.0576,
    lng: 48.2932,
  },
  {
    id: 4,
    name: 'Эко-дом в Ахтах',
    description: 'Экологичный дом из натуральных материалов на берегу реки. Тишина, свежий воздух и невероятные пейзажи.',
    pricePerNight: 2000,
    photo: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&h=300&fit=crop&auto=format',
    location: 'Ахты',
    rating: 4.7,
    rooms: 2,
    guests: 4,
    lat: 41.4576,
    lng: 47.7322,
  },
  {
    id: 5,
    name: 'Люкс-апартаменты в Махачкале',
    description: 'Современные апартаменты в центре Махачкалы. Полностью оборудованная кухня, Wi-Fi, кондиционер. Рядом рестораны и магазины.',
    pricePerNight: 4000,
    photo: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&auto=format',
    location: 'Махачкала',
    rating: 4.5,
    rooms: 2,
    guests: 4,
    lat: 42.9849,
    lng: 47.5047,
  },
];

export const cars: Car[] = [
  {
    id: 1,
    brand: 'Lada',
    model: 'Granta',
    pricePerDay: 1500,
    photo: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&h=300&fit=crop&auto=format',
    type: 'эконом',
    seats: 5,
    transmission: 'механика',
    lat: 42.9849,
    lng: 47.5047,
  },
  {
    id: 2,
    brand: 'Hyundai',
    model: 'Solaris',
    pricePerDay: 2000,
    photo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop&auto=format',
    type: 'эконом',
    seats: 5,
    transmission: 'автомат',
    lat: 42.5647,
    lng: 47.8736,
  },
  {
    id: 3,
    brand: 'Toyota',
    model: 'Camry',
    pricePerDay: 3500,
    photo: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=300&fit=crop&auto=format',
    type: 'комфорт',
    seats: 5,
    transmission: 'автомат',
    lat: 42.0576,
    lng: 48.2932,
  },
  {
    id: 4,
    brand: 'Toyota',
    model: 'Land Cruiser',
    pricePerDay: 5000,
    photo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop&auto=format',
    type: 'внедорожник',
    seats: 7,
    transmission: 'автомат',
    lat: 41.4576,
    lng: 47.7322,
  },
  {
    id: 5,
    brand: 'UAZ',
    model: 'Patriot',
    pricePerDay: 3000,
    photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&auto=format',
    type: 'внедорожник',
    seats: 5,
    transmission: 'механика',
    lat: 42.3894,
    lng: 46.9539,
  },
];

export const tours: Tour[] = [
  {
    id: 1,
    name: 'Сулакский каньон',
    description: 'Захватывающая поездка к одному из самых глубоких каньонов мира. Катание на катере по бирюзовой воде, смотровые площадки и обед с видом на каньон.',
    duration: '1 день',
    price: 3000,
    photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop&auto=format',
    route: ['Махачкала', 'Дубки', 'Сулакский каньон', 'Махачкала'],
  },
  {
    id: 2,
    name: 'Древний Дербент',
    description: 'Путешествие в древнейший город России. Крепость Нарын-Кала, Джума-мечеть, старые кварталы магалы и берег Каспийского моря.',
    duration: '1 день',
    price: 2500,
    photo: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format',
    route: ['Махачкала', 'Дербент', 'Нарын-Кала', 'Махачкала'],
  },
  {
    id: 3,
    name: 'Горный Дагестан',
    description: 'Тур по горным аулам: Гуниб, Чох, Гамсутль — заброшенный аул-призрак. Горные перевалы, водопады и традиционная кухня.',
    duration: '2 дня',
    price: 7000,
    photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
    route: ['Махачкала', 'Гуниб', 'Чох', 'Гамсутль', 'Махачкала'],
  },
  {
    id: 4,
    name: 'Водопады и озёра',
    description: 'Маршрут по водопадам Дагестана: Тобот, Хунзахский водопад. Посещение высокогорного озера Кезеной-Ам на границе с Чечнёй.',
    duration: '2 дня',
    price: 6500,
    photo: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400&h=300&fit=crop&auto=format',
    route: ['Махачкала', 'Хунзах', 'Водопад Тобот', 'Кезеной-Ам', 'Махачкала'],
  },
  {
    id: 5,
    name: 'Южный Дагестан',
    description: 'Тур по южному Дагестану: село Куруш — самое высокогорное в Европе, Ахтынские горячие источники, каньон реки Самур.',
    duration: '3 дня',
    price: 9000,
    photo: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop&auto=format',
    route: ['Махачкала', 'Ахты', 'Куруш', 'Самурский лес', 'Махачкала'],
  },
];
