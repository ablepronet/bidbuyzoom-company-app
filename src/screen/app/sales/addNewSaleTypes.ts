export type Step = 1 | 2 | 3;

export type DateMode =
  | 'One day sale'
  | 'Multiple day sale'
  | 'Start date / End date'
  | 'Date to be announced'
  | 'One Day Online Only Sale';

export const dateModeOptions: DateMode[] = [
  'One day sale',
  'Multiple day sale',
  'Start date / End date',
  'Date to be announced',
  'One Day Online Only Sale',
];

export const timeZoneLabelMap: Record<string, string> = {
  'Etc/GMT+12': 'International Date Line West',
  'Pacific/Midway': 'Midway Island, Samoa',
  'Pacific/Honolulu': 'Hawaii',
  'America/Anchorage': 'Alaska',
  'America/Los_Angeles': 'Pacific Time (US & Canada)',
  'America/Tijuana': 'Tijuana, Baja California',
  'America/Denver': 'Mountain Time (US & Canada)',
  'America/Chihuahua': 'Chihuahua, La Paz, Mazatlan',
  'America/Phoenix': 'Arizona',
  'America/Chicago': 'Central Time (US & Canada)',
  'America/Regina': 'Saskatchewan',
  'America/Mexico_City': 'Guadalajara, Mexico City, Monterrey',
  'America/Guatemala': 'Central America',
  'America/New_York': 'Eastern Time (US & Canada)',
  'America/Indiana/Indianapolis': 'Indiana (East)',
  'America/Bogota': 'Bogota, Lima, Quito',
  'America/Caracas': 'Caracas',
  'America/Halifax': 'Atlantic Time (Canada)',
  'America/Manaus': 'Manaus',
  'America/Santiago': 'Santiago',
  'America/St_Johns': 'Newfoundland',
  'America/Sao_Paulo': 'Brasilia',
  'America/Argentina/Buenos_Aires': 'Buenos Aires, Georgetown',
  'America/Godthab': 'Greenland',
  'Atlantic/South_Georgia': 'Mid-Atlantic',
  'Atlantic/Azores': 'Azores',
  'Atlantic/Cape_Verde': 'Cape Verde Is.',
  'Europe/London': 'Dublin, Edinburgh, Lisbon, London',
  'Africa/Casablanca': 'Casablanca, Monrovia, Reykjavik',
  'Europe/Berlin': 'Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  'Europe/Belgrade': 'Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  'Europe/Paris': 'Brussels, Copenhagen, Madrid, Paris',
  'Europe/Sarajevo': 'Sarajevo, Skopje, Warsaw, Zagreb',
  'Africa/Lagos': 'West Central Africa',
  'Asia/Amman': 'Amman',
  'Europe/Athens': 'Athens, Bucharest, Istanbul',
  'Asia/Beirut': 'Beirut',
  'Africa/Cairo': 'Cairo',
  'Africa/Harare': 'Harare, Pretoria',
  'Europe/Helsinki': 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  'Asia/Jerusalem': 'Jerusalem',
  'Europe/Minsk': 'Minsk',
  'Africa/Windhoek': 'Windhoek',
  'Asia/Baghdad': 'Baghdad',
  'Asia/Kuwait': 'Kuwait, Riyadh',
  'Europe/Moscow': 'Moscow, St. Petersburg, Volgograd',
  'Africa/Nairobi': 'Nairobi',
  'Asia/Tbilisi': 'Tbilisi',
  'Asia/Tehran': 'Tehran',
  'Asia/Muscat': 'Abu Dhabi, Muscat',
  'Asia/Baku': 'Baku',
  'Asia/Yerevan': 'Yerevan',
  'Asia/Kabul': 'Kabul',
  'Asia/Yekaterinburg': 'Ekaterinburg',
  'Asia/Karachi': 'Islamabad, Karachi, Tashkent',
  'Asia/Kolkata': 'Chennai, Kolkata, Mumbai, New Delhi',
  'Asia/Kathmandu': 'Kathmandu',
  'Asia/Dhaka': 'Astana, Dhaka',
  'Asia/Colombo': 'Sri Jayawardenepura',
  'Asia/Yangon': 'Yangon Rangoon',
  'Asia/Bangkok': 'Bangkok, Hanoi, Jakarta',
  'Asia/Novosibirsk': 'Novosibirsk',
  'Asia/Shanghai': 'Beijing, Chongqing, Hong Kong, Urumqi',
  'Asia/Krasnoyarsk': 'Krasnoyarsk',
  'Asia/Kuala_Lumpur': 'Kuala Lumpur, Singapore',
  'Australia/Perth': 'Perth',
  'Asia/Taipei': 'Taipei',
  'Asia/Ulaanbaatar': 'Ulaan Bataar',
  'Asia/Irkutsk': 'Irkutsk',
  'Asia/Tokyo': 'Osaka, Sapporo, Tokyo',
  'Asia/Seoul': 'Seoul',
  'Australia/Adelaide': 'Adelaide',
  'Australia/Darwin': 'Darwin',
  'Australia/Brisbane': 'Brisbane',
  'Australia/Sydney': 'Canberra, Melbourne, Sydney',
  'Pacific/Guam': 'Guam, Port Moresby',
  'Australia/Hobart': 'Hobart',
  'Asia/Yakutsk': 'Yakutsk',
  'Pacific/Noumea': 'Solomon Is., New Caledonia',
  'Asia/Vladivostok': 'Vladivostok',
  'Pacific/Auckland': 'Auckland, Wellington',
  'Pacific/Fiji': 'Fiji, Kamchatka, Marshall Is.',
  'Pacific/Tongatapu': "Nuku'alofa",
};

export type FormState = {
  sale: string;
  businessName: string;
  title: string;
  saleType: string;
  categories: string[];
  shortDescription: string;
  fullDescription: string;
  dateMode: DateMode;
  saleDate: string;
  startTime: string;
  endTime: string;
  userTimeZone: string;
  saleTimeZone: string;
  uploadTitle: string;
  sameAsCompanyAddress: boolean;
  address: string;
  state: string;
  city: string;
  zipCode: string;
};

export type FormErrors = Partial<Record<keyof FormState | 'categories', string>>;

export type PickerMode = 'date' | 'time';

export type PickerConfig =
  | {
      target: 'form';
      key: 'saleDate' | 'startTime' | 'endTime';
      mode: PickerMode;
    }
  | {
      target: 'multi';
      id: string;
      key: 'date' | 'startTime' | 'endTime';
      mode: PickerMode;
    }
  | {
      target: 'range';
      key: 'startDate' | 'endDate' | 'startTime' | 'endTime';
      mode: PickerMode;
    }
  | {target: 'online'; key: 'startDate' | 'endDate'; mode: PickerMode};

export type SelectedFile = {
  uri: string;
  name: string;
  type?: string;
  size?: number;
  isExisting?: boolean;
  originalPath?: string;
};

export type SaleDateRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};
