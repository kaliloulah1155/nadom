// Fake Data pour la plateforme Import-Export / Personal Shopping

// ==================== USERS ====================
export const FAKE_USERS = [
  {
    id: 'user_1',
    email: 'client@example.com',
    password: 'password123',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+225 01 23 45 67',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    role: 'client' as const,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2024-01-01'
  },
  {
    id: 'user_2',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Marie',
    lastName: 'Martin',
    phone: '+225 07 89 01 23',
    country: "Côte d'Ivoire",
    city: 'Abidjan',
    role: 'admin' as const,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    createdAt: '2024-01-01'
  },
  {
    id: 'user_3',
    email: 'agent@example.com',
    password: 'agent123',
    firstName: 'Wang',
    lastName: 'Wei',
    phone: '+86 138 0000 1234',
    country: 'Chine',
    city: 'Guangzhou',
    role: 'agent' as const,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    createdAt: '2024-01-01'
  },
  {
    id: 'user_4',
    email: 'mamadou@example.com',
    password: 'password123',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    phone: '+221 77 123 45 67',
    country: 'Sénégal',
    city: 'Dakar',
    role: 'client' as const,
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    createdAt: '2024-01-15'
  },
  {
    id: 'user_5',
    email: 'fatou@example.com',
    password: 'password123',
    firstName: 'Fatou',
    lastName: 'Diop',
    phone: '+221 78 234 56 78',
    country: 'Sénégal',
    city: 'Dakar',
    role: 'client' as const,
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    createdAt: '2024-02-01'
  }
]

// ==================== CATEGORIES ====================
export const FAKE_CATEGORIES = [
  { id: 'cat_1', name_fr: 'Électronique & High-Tech', name_en: 'Electronics & High-tech', icon: 'bi-phone', color: '#3498db' },
  { id: 'cat_2', name_fr: 'Fashion & Vêtements', name_en: 'Fashion & Clothing', icon: 'bi-bag', color: '#e74c3c' },
  { id: 'cat_3', name_fr: 'Maison & Décoration', name_en: 'Home & Decoration', icon: 'bi-house', color: '#2ecc71' },
  { id: 'cat_4', name_fr: 'Beauté & Cosmétique', name_en: 'Beauty & Cosmetics', icon: 'bi-heart', color: '#9b59b6' },
  { id: 'cat_5', name_fr: 'Sport & Loisirs', name_en: 'Sport & Leisure', icon: 'bi-bicycle', color: '#f39c12' },
  { id: 'cat_6', name_fr: 'Jouets & Enfants', name_en: 'Toys & Children', icon: 'bi-gift', color: '#1abc9c' },
  { id: 'cat_7', name_fr: 'Auto & Moto', name_en: 'Auto & Moto', icon: 'bi-car-front', color: '#34495e' },
  { id: 'cat_8', name_fr: 'Machines & Équipements', name_en: 'Machines & Equipment', icon: 'bi-gear', color: '#7f8c8d' },
  { id: 'cat_9', name_fr: 'Alimentation & Boissons', name_en: 'Food & Beverage', icon: 'bi-cup-hot', color: '#d35400' },
  { id: 'cat_10', name_fr: 'Mobilier & Bureau', name_en: 'Furniture & Office', icon: 'bi-lamp', color: '#8e44ad' },
  { id: 'cat_11', name_fr: 'Santé & Médical', name_en: 'Health & Medical', icon: 'bi-hospital', color: '#16a085' },
  { id: 'cat_12', name_fr: 'Textile & Tissus', name_en: 'Textile & Fabrics', icon: 'bi-scissors', color: '#c0392b' }
]

// ==================== PERSONAL SHOPPING REQUESTS ====================
export const FAKE_PERSONAL_SHOPPING_REQUESTS = [
  {
    id: 'req_1',
    userId: 'user_1',
    status: 'negotiating' as const,
    category: 'Électronique & High-Tech',
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Téléphone dernière génération, couleur noir titanium, 256GB, version internationale avec garantie',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
    ],
    budgetEstimated: 500000,
    quantity: 1,
    quotedPrice: 450000,
    quotedDetails: {
      productCost: 380000,
      serviceFee: 19000,
      inspectionFee: 5000,
      packagingFee: 3000,
      shippingCost: 43000,
      totalPrice: 450000
    },
    assignedAgent: 'user_3',
    whatsappMessages: 12,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-22T15:45:00Z'
  },
  {
    id: 'req_2',
    userId: 'user_1',
    status: 'searching' as const,
    category: 'Fashion & Vêtements',
    title: 'Lot de vêtements pour boutique',
    description: 'Recherche fournisseur pour lot de 100 pièces: robes, chemises, pantalons. Qualité moyenne-haute, tailles variées S-XXL',
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400',
      'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400'
    ],
    budgetEstimated: 2000000,
    quantity: 100,
    assignedAgent: 'user_3',
    whatsappMessages: 5,
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z'
  },
  {
    id: 'req_3',
    userId: 'user_4',
    status: 'confirmed' as const,
    category: 'Maison & Décoration',
    title: 'Luminaires LED modernes',
    description: 'Pack de 20 luminaires LED design pour restaurant, style moderne minimaliste, couleur blanc/doré',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400'
    ],
    budgetEstimated: 1500000,
    quantity: 20,
    quotedPrice: 1350000,
    quotedDetails: {
      productCost: 1100000,
      serviceFee: 55000,
      inspectionFee: 15000,
      packagingFee: 30000,
      shippingCost: 150000,
      totalPrice: 1350000
    },
    assignedAgent: 'user_3',
    whatsappMessages: 18,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-20T09:30:00Z'
  },
  {
    id: 'req_4',
    userId: 'user_5',
    status: 'pending' as const,
    category: 'Beauté & Cosmétique',
    title: 'Produits cosmétiques coréens',
    description: 'Recherche gamme complète de soins visage K-Beauty: sérums, crèmes, masques. Minimum 50 pièces par référence',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
    ],
    budgetEstimated: 800000,
    quantity: 200,
    whatsappMessages: 0,
    createdAt: '2024-01-28T16:00:00Z',
    updatedAt: '2024-01-28T16:00:00Z'
  },
  {
    id: 'req_5',
    userId: 'user_1',
    status: 'shipped' as const,
    category: 'Électronique & High-Tech',
    title: 'Écouteurs TWS en gros',
    description: 'Lot de 50 écouteurs TWS Bluetooth, qualité premium avec boîtier de charge, pour revente',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'
    ],
    budgetEstimated: 1000000,
    quantity: 50,
    quotedPrice: 875000,
    quotedDetails: {
      productCost: 700000,
      serviceFee: 35000,
      inspectionFee: 10000,
      packagingFee: 20000,
      shippingCost: 110000,
      totalPrice: 875000
    },
    assignedAgent: 'user_3',
    whatsappMessages: 25,
    trackingNumber: 'TRK-2024-001234',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },
  {
    id: 'req_6',
    userId: 'user_4',
    status: 'delivered' as const,
    category: 'Machines & Équipements',
    title: 'Machine à coudre industrielle',
    description: 'Machine à coudre industrielle JUKI DDL-8700 ou équivalent, pour atelier de couture',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    ],
    budgetEstimated: 350000,
    quantity: 1,
    quotedPrice: 320000,
    quotedDetails: {
      productCost: 250000,
      serviceFee: 12500,
      inspectionFee: 7500,
      packagingFee: 10000,
      shippingCost: 40000,
      totalPrice: 320000
    },
    assignedAgent: 'user_3',
    whatsappMessages: 30,
    trackingNumber: 'TRK-2024-000987',
    createdAt: '2023-12-15T10:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  }
]

// ==================== DESTINATIONS ====================
export const FAKE_DESTINATIONS = [
  {
    id: 'dest_ci',
    country: "Côte d'Ivoire",
    continent: 'Afrique',
    city: 'Abidjan',
    flag: '🇨🇮',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 9000 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 12500 },
      { mode: 'sea', duration: '30-45 jours', costPerKg: 2000 }
    ]
  },
  {
    id: 'dest_sn',
    country: 'Sénégal',
    continent: 'Afrique',
    city: 'Dakar',
    flag: '🇸🇳',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 9500 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 13000 },
      { mode: 'sea', duration: '30-45 jours', costPerKg: 2200 }
    ]
  },
  {
    id: 'dest_ml',
    country: 'Mali',
    continent: 'Afrique',
    city: 'Bamako',
    flag: '🇲🇱',
    shippingModes: [
      { mode: 'air_normal', duration: '18-21 jours', costPerKg: 10000 },
      { mode: 'air_express', duration: '5-7 jours', costPerKg: 14000 },
      { mode: 'sea', duration: '45-60 jours', costPerKg: 2500 }
    ]
  },
  {
    id: 'dest_bf',
    country: 'Burkina Faso',
    continent: 'Afrique',
    city: 'Ouagadougou',
    flag: '🇧🇫',
    shippingModes: [
      { mode: 'air_normal', duration: '18-21 jours', costPerKg: 10500 },
      { mode: 'air_express', duration: '5-7 jours', costPerKg: 14500 },
      { mode: 'sea', duration: '45-60 jours', costPerKg: 2800 }
    ]
  },
  {
    id: 'dest_cm',
    country: 'Cameroun',
    continent: 'Afrique',
    city: 'Douala',
    flag: '🇨🇲',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 8500 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 12000 },
      { mode: 'sea', duration: '25-35 jours', costPerKg: 1800 }
    ]
  },
  {
    id: 'dest_ga',
    country: 'Gabon',
    continent: 'Afrique',
    city: 'Libreville',
    flag: '🇬🇦',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 9000 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 12500 },
      { mode: 'sea', duration: '25-35 jours', costPerKg: 1900 }
    ]
  },
  {
    id: 'dest_cg',
    country: 'Congo-Brazzaville',
    continent: 'Afrique',
    city: 'Brazzaville',
    flag: '🇨🇬',
    shippingModes: [
      { mode: 'air_normal', duration: '15-18 jours', costPerKg: 9200 },
      { mode: 'air_express', duration: '3-5 jours', costPerKg: 13000 },
      { mode: 'sea', duration: '30-40 jours', costPerKg: 2100 }
    ]
  },
  {
    id: 'dest_cd',
    country: 'RD Congo',
    continent: 'Afrique',
    city: 'Kinshasa',
    flag: '🇨🇩',
    shippingModes: [
      { mode: 'air_normal', duration: '18-21 jours', costPerKg: 9800 },
      { mode: 'air_express', duration: '5-7 jours', costPerKg: 14000 },
      { mode: 'sea', duration: '35-50 jours', costPerKg: 2400 }
    ]
  }
]

// ==================== SHIPMENTS ====================
export const FAKE_SHIPMENTS = [
  {
    id: 'ship_1',
    trackingNumber: 'TRK-2024-001234',
    userId: 'user_1',
    requestId: 'req_5',
    destinationCountry: "Côte d'Ivoire",
    destinationCity: 'Abidjan',
    shippingMode: 'air_express' as const,
    status: 'in_transit' as const,
    weight: 8.5,
    dimensions: '40x30x25 cm',
    declaredValue: 875000,
    shippingCost: 110000,
    timeline: [
      { date: '2024-01-20T10:00:00Z', status: 'order_placed', location: 'Guangzhou, Chine', description: 'Commande validée et payée' },
      { date: '2024-01-21T14:00:00Z', status: 'picked_up', location: 'Entrepôt Guangzhou', description: 'Colis collecté et vérifié' },
      { date: '2024-01-22T08:00:00Z', status: 'in_transit', location: 'Aéroport Guangzhou', description: 'Colis en transit vers Abidjan' }
    ],
    currentLocation: 'En vol - Guangzhou → Abidjan',
    estimatedDelivery: '2024-01-27',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z'
  },
  {
    id: 'ship_2',
    trackingNumber: 'TRK-2024-000987',
    userId: 'user_4',
    requestId: 'req_6',
    destinationCountry: 'Sénégal',
    destinationCity: 'Dakar',
    shippingMode: 'sea' as const,
    status: 'delivered' as const,
    weight: 45,
    dimensions: '120x80x60 cm',
    declaredValue: 320000,
    shippingCost: 40000,
    timeline: [
      { date: '2023-12-20T10:00:00Z', status: 'order_placed', location: 'Shenzhen, Chine', description: 'Commande validée' },
      { date: '2023-12-22T08:00:00Z', status: 'picked_up', location: 'Port Shenzhen', description: 'Colis embarqué' },
      { date: '2024-01-05T10:00:00Z', status: 'in_customs', location: 'Port Dakar', description: 'Arrivée au port, en dédouanement' },
      { date: '2024-01-10T14:00:00Z', status: 'out_for_delivery', location: 'Dakar', description: 'Colis libéré, en cours de livraison' },
      { date: '2024-01-12T11:00:00Z', status: 'delivered', location: 'Dakar', description: 'Livré au destinataire' }
    ],
    currentLocation: 'Livré',
    estimatedDelivery: '2024-01-12',
    actualDelivery: '2024-01-12',
    createdAt: '2023-12-20T10:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z'
  },
  {
    id: 'ship_3',
    trackingNumber: 'TRK-2024-001456',
    userId: 'user_1',
    destinationCountry: "Côte d'Ivoire",
    destinationCity: 'Abidjan',
    shippingMode: 'air_normal' as const,
    status: 'in_customs' as const,
    weight: 25,
    dimensions: '60x50x40 cm',
    declaredValue: 1350000,
    shippingCost: 225000,
    timeline: [
      { date: '2024-01-10T10:00:00Z', status: 'order_placed', location: 'Yiwu, Chine', description: 'Commande validée' },
      { date: '2024-01-12T08:00:00Z', status: 'picked_up', location: 'Entrepôt Yiwu', description: 'Colis collecté' },
      { date: '2024-01-14T14:00:00Z', status: 'in_transit', location: 'Aéroport Shanghai', description: 'En transit' },
      { date: '2024-01-25T09:00:00Z', status: 'in_customs', location: 'Douane Abidjan', description: 'En cours de dédouanement' }
    ],
    currentLocation: 'Douane Abidjan',
    estimatedDelivery: '2024-01-30',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z'
  }
]

// ==================== GUIDES ====================
export const FAKE_GUIDES = [
  {
    id: 'guide_1',
    name_fr: 'Wang Wei',
    name_en: 'Wang Wei',
    languages: ['Français', 'Mandarin', 'Anglais'],
    specializations: ['Commerce', 'Marchés de gros'],
    cities: ['Guangzhou', 'Shenzhen'],
    experience: 8,
    rating: 4.8,
    reviews: 45,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    pricePerDay: 150000,
    pricePerHour: 25000,
    description_fr: 'Expert en sourcing et négociation dans les marchés de Guangzhou.',
    description_en: 'Expert in sourcing and negotiation in Guangzhou markets.',
    available: true
  }
]

// ==================== VISAS ====================
export const FAKE_VISAS = [
  {
    id: 'visa_1',
    type: 'Affaires (M)',
    name_fr: 'Visa Affaires (M)',
    name_en: 'Business Visa (M)',
    duration_fr: '30-90 jours',
    duration_en: '30-90 days',
    validity_fr: '1 an (entrées multiples)',
    validity_en: '1 year (multiple entries)',
    processingTime_fr: '7-10 jours ouvrables',
    processingTime_en: '7-10 business days',
    cost: 150000,
    requirements_fr: [
      'Passeport valide 6 mois minimum',
      'Lettre d\'invitation d\'une entreprise chinoise'
    ],
    requirements_en: [
      'Passport valid for at least 6 months',
      'Invitation letter from a Chinese company'
    ],
    description_fr: 'Pour les voyages d\'affaires, réunions, et foires.',
    description_en: 'For business trips, meetings, and trade fairs.'
  },
  {
    id: 'visa_2',
    type: 'Tourisme (L)',
    name_fr: 'Visa Tourisme (L)',
    name_en: 'Tourism Visa (L)',
    duration_fr: '30 jours',
    duration_en: '30 days',
    validity_fr: '3 mois (entrée simple)',
    validity_en: '3 months (single entry)',
    processingTime_fr: '5-7 jours ouvrables',
    processingTime_en: '5-7 business days',
    cost: 100000,
    requirements_fr: [
      'Passeport valide 6 mois minimum',
      'Réservation d\'hôtel'
    ],
    requirements_en: [
      'Passport valid for at least 6 months',
      'Hotel reservation'
    ],
    description_fr: 'Pour les voyages touristiques.',
    description_en: 'For tourist trips.'
  }
]

// ==================== BLOG POSTS ====================
export const FAKE_BLOG_POSTS = [
  {
    id: 'blog_1',
    title_fr: 'Guide complet de l\'import-export avec la Chine',
    title_en: 'Complete guide to import-export with China',
    slug: 'guide-complet-import-export-chine',
    excerpt_fr: 'Découvrez tout ce que vous devez savoir pour réussir vos importations depuis la Chine: procédures, pièges à éviter, et conseils pratiques.',
    excerpt_en: 'Discover everything you need to know to succeed in your imports from China: procedures, pitfalls to avoid, and practical advice.',
    content_fr: `L'import-export avec la Chine représente une opportunité majeure pour les entrepreneurs africains. Ce guide vous accompagne étape par étape...`,
    content_en: `Import-export with China represents a major opportunity for African entrepreneurs. This guide accompanies you step by step...`,
    category: 'Import-Export',
    author: 'Marie Martin',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
    publishedAt: '2024-01-20',
    views: 1250,
    readTime: 8
  },
  {
    id: 'blog_2',
    title_fr: 'Les meilleurs marchés de Guangzhou pour le sourcing',
    title_en: 'The best markets in Guangzhou for sourcing',
    slug: 'meilleurs-marches-guangzhou-sourcing',
    excerpt_fr: 'Tour d\'horizon des marchés incontournables de Guangzhou pour trouver les meilleurs produits aux meilleurs prix.',
    excerpt_en: 'A tour of the essential markets in Guangzhou to find the best products at the best prices.',
    content_fr: `Guangzhou, capitale mondiale du commerce, regorge de marchés spécialisés. Voici notre sélection...`,
    content_en: `Guangzhou, world capital of commerce, is full of specialized markets. Here is our selection...`,
    category: 'Sourcing',
    author: 'Wang Wei',
    authorAvatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    image: 'https://images.unsplash.com/photo-1519010470956-6d877008eaa4?w=800',
    publishedAt: '2024-01-15',
    views: 890,
    readTime: 6
  }
]

// ==================== FAQ ====================
export const FAKE_FAQ = [
  {
    id: 'faq_1',
    question_fr: 'Combien de temps pour trouver un produit en Personal Shopping ?',
    question_en: 'How long does it take to find a product in Personal Shopping?',
    answer_fr: 'Généralement entre 2 et 7 jours selon la disponibilité du produit et sa complexité.',
    answer_en: 'Generally between 2 and 7 days depending on product availability and complexity.',
    category: 'Personal Shopping'
  }
]

// ==================== SERVICES ====================
export const FAKE_SERVICES = [
  {
    id: 'service_1',
    name_fr: 'Personal Shopping',
    name_en: 'Personal Shopping',
    icon: 'bi-bag-check',
    description_fr: 'Trouvez n\'importe quel produit en Chine sans vous déplacer',
    description_en: 'Find any product in China without traveling',
    features_fr: ['Recherche personnalisée', 'Négociation prix'],
    features_en: ['Personalized search', 'Price negotiation']
  },
  {
    id: 'service_2',
    name_fr: 'Import-Export',
    name_en: 'Import-Export',
    icon: 'bi-box-seam',
    description_fr: 'Expédition de vos marchandises vers l\'Afrique',
    description_en: 'Shipping of your goods to Africa',
    features_fr: ['Fret aérien & maritime', 'Dédouanement'],
    features_en: ['Air & sea freight', 'Customs clearance']
  }
]

// ==================== ADMIN STATS ====================
export const FAKE_ADMIN_STATS = {
  totalUsers: 156,
  totalRequests: 342,
  totalShipments: 189,
  totalRevenue: 45670000,
  pendingRequests: 23,
  inTransitShipments: 45,
  monthlyGrowth: 12.5,
  customerSatisfaction: 4.7
}
