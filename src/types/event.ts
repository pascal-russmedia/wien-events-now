
export interface Event {
  id: string;
  name: string;
  category: 'Party & Musik' | 'Familie & Freizeit' | 'Sport & Outdoor' | 'Kultur & Bühne';
  subcategory?: string;
  description: string;
  region: string;
  subregion?: string;
  city?: string;
  host?: string;
  address?: string;
  state: 'Pending' | 'Approved' | 'Rejected';
  popularityScore?: number;
  trustScore?: number;
  dates: {
    date: Date;
    startTime?: string;
    endTime?: string;
  }[];
  startTime?: string; // Keep for backward compatibility
  endTime?: string; // Keep for backward compatibility
  image?: string;
  price: {
    type: 'Free' | 'Cost';
    amount?: number;
  };
  link?: string;
  ticketLink?: string;
  featured: boolean;
  addedBy: 'Internal' | 'External';
  addedByEmail: string;
  created: Date;
  updated: Date;
}

// Create a separate type for event creation that makes state optional
export interface CreateEventData extends Omit<Event, 'id' | 'created' | 'updated' | 'state'> {
  state?: 'Pending' | 'Approved' | 'Rejected';
}

export interface Region {
  name: string;
  subregions?: string[];
}

export const REGIONS: Region[] = [
  {
    name: 'Vorarlberg',
    subregions: ['Bregenz', 'Dornbirn', 'Feldkirch', 'Bludenz']
  },
  {
    name: 'Deutschland'
  },
  {
    name: 'Schweiz'
  },
  {
    name: 'Wien',
    subregions: [
      'Innere Stadt', 'Leopoldstadt', 'Landstraße', 'Wieden', 'Margareten', 
      'Mariahilf', 'Neubau', 'Josefstadt', 'Alsergrund', 'Favoriten', 
      'Simmering', 'Meidling', 'Hietzing', 'Penzing', 'Rudolfsheim-Fünfhaus', 
      'Ottakring', 'Hernals', 'Währing', 'Döbling', 'Brigittenau', 
      'Floridsdorf', 'Donaustadt', 'Liesing'
    ]
  }
];

// Frontend regions (excluding Wien for now)
export const FRONTEND_REGIONS: Region[] = REGIONS.filter(region => region.name !== 'Wien');

export const CATEGORIES = [
  'Party & Musik',
  'Familie & Freizeit', 
  'Sport & Outdoor',
  'Kultur & Bühne'
] as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  'Party & Musik': [
    'Pop',
    'House',
    'Rock',
    'Festival',
    'Volksmusik',
    'Zeltfest',
    'Clubbing',
    'Ball',
    'Jazz, Blues, Swing',
    'Fasching',
    'Silvester',
    'Alternativ, Indie',
    'Hip Hop, Rap',
    'Latin, Salsa',
    'R&B, Soul',
    'Country',
    'Punk',
    'Reggae, Roots, Dub',
    'Metal'
  ],
  'Familie & Freizeit': [
    'Essen, Trinken',
    'Feste',
    'Tanzen',
    'Kinder, Jugend',
    'Gesundheit',
    'Führungen',
    'Märkte',
    'Seminare, Kurse',
    'Bildung',
    'Spiele',
    'Advent',
    'Charity',
    'Kirche',
    'Senioren',
    'Diskussionen',
    'Umzüge',
    'Vereine',
    'Wissenschaft',
    'Business',
    'Messen',
    'Politik',
    'Landwirtschaft',
    'Funken'
  ],
  'Sport & Outdoor': [
    'Wandern',
    'Wintersport',
    'Radsport',
    'Fußball',
    'Fitness',
    'Marathon, Laufen',
    'Ballsport',
    'Wassersport',
    'Golf',
    'Pferde',
    'Leichtathletik',
    'Kampfsport',
    'Motorsport',
    'Bootsport',
    'Abenteuer',
    'Schießen',
    'Flugsport'
  ],
  'Kultur & Bühne': [
    'Theater',
    'Klassische Musik',
    'Museen',
    'Kunst',
    'Oper',
    'Film',
    'Musicals',
    'Kabarett, Comedy',
    'Tanz',
    'Literatur, Lesung',
    'Mode',
    'Chor, Gesang',
    'Fotografie'
  ]
};
