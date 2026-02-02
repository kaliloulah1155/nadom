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
  { id: 'cat_1', name: 'Électronique & High-Tech', icon: 'bi-phone', color: '#3498db' },
  { id: 'cat_2', name: 'Fashion & Vêtements', icon: 'bi-bag', color: '#e74c3c' },
  { id: 'cat_3', name: 'Maison & Décoration', icon: 'bi-house', color: '#2ecc71' },
  { id: 'cat_4', name: 'Beauté & Cosmétique', icon: 'bi-heart', color: '#9b59b6' },
  { id: 'cat_5', name: 'Sport & Loisirs', icon: 'bi-bicycle', color: '#f39c12' },
  { id: 'cat_6', name: 'Jouets & Enfants', icon: 'bi-gift', color: '#1abc9c' },
  { id: 'cat_7', name: 'Auto & Moto', icon: 'bi-car-front', color: '#34495e' },
  { id: 'cat_8', name: 'Machines & Équipements', icon: 'bi-gear', color: '#7f8c8d' },
  { id: 'cat_9', name: 'Alimentation & Boissons', icon: 'bi-cup-hot', color: '#d35400' },
  { id: 'cat_10', name: 'Mobilier & Bureau', icon: 'bi-lamp', color: '#8e44ad' },
  { id: 'cat_11', name: 'Santé & Médical', icon: 'bi-hospital', color: '#16a085' },
  { id: 'cat_12', name: 'Textile & Tissus', icon: 'bi-scissors', color: '#c0392b' }
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
    name: 'Wang Wei',
    languages: ['Français', 'Mandarin', 'Anglais'],
    specializations: ['Commerce', 'Marchés de gros', 'Négociation'],
    cities: ['Guangzhou', 'Shenzhen', 'Yiwu'],
    experience: 8,
    rating: 4.8,
    reviews: 45,
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    pricePerDay: 150000,
    pricePerHour: 25000,
    description: 'Expert en sourcing et négociation dans les marchés de Guangzhou et Yiwu. Spécialisé dans l\'électronique et le textile.',
    available: true
  },
  {
    id: 'guide_2',
    name: 'Li Ming',
    languages: ['Français', 'Mandarin'],
    specializations: ['Textile', 'Mode', 'Usines'],
    cities: ['Guangzhou', 'Dongguan'],
    experience: 5,
    rating: 4.6,
    reviews: 32,
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    pricePerDay: 120000,
    pricePerHour: 20000,
    description: 'Spécialiste du textile et de la mode. Connaissance approfondie des usines de confection.',
    available: true
  },
  {
    id: 'guide_3',
    name: 'Zhang Hui',
    languages: ['Français', 'Mandarin', 'Anglais', 'Espagnol'],
    specializations: ['Électronique', 'High-Tech', 'Gadgets'],
    cities: ['Shenzhen', 'Hong Kong'],
    experience: 10,
    rating: 4.9,
    reviews: 78,
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    pricePerDay: 180000,
    pricePerHour: 30000,
    description: 'Experte en électronique et technologies. Accès privilégié aux usines de Shenzhen.',
    available: true
  },
  {
    id: 'guide_4',
    name: 'Chen Jie',
    languages: ['Français', 'Mandarin'],
    specializations: ['Décoration', 'Mobilier', 'Artisanat'],
    cities: ['Foshan', 'Guangzhou'],
    experience: 6,
    rating: 4.7,
    reviews: 28,
    avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
    pricePerDay: 130000,
    pricePerHour: 22000,
    description: 'Spécialiste en mobilier et décoration. Expert des marchés de Foshan.',
    available: false
  }
]

// ==================== VISAS ====================
export const FAKE_VISAS = [
  {
    id: 'visa_1',
    type: 'Affaires (M)',
    duration: '30-90 jours',
    validity: '1 an (entrées multiples)',
    processingTime: '7-10 jours ouvrables',
    cost: 150000,
    requirements: [
      'Passeport valide 6 mois minimum',
      'Photo d\'identité récente (4.8x3.3 cm)',
      'Formulaire de demande rempli',
      'Lettre d\'invitation d\'une entreprise chinoise',
      'Justificatif de l\'entreprise (RCCM, etc.)',
      'Preuve de moyens financiers'
    ],
    description: 'Pour les voyages d\'affaires, réunions, négociations commerciales et visites de foires.'
  },
  {
    id: 'visa_2',
    type: 'Tourisme (L)',
    duration: '30 jours',
    validity: '3 mois (entrée simple)',
    processingTime: '5-7 jours ouvrables',
    cost: 100000,
    requirements: [
      'Passeport valide 6 mois minimum',
      'Photo d\'identité récente',
      'Formulaire de demande rempli',
      'Réservation d\'hôtel',
      'Billet d\'avion aller-retour',
      'Relevé bancaire des 3 derniers mois'
    ],
    description: 'Pour les voyages touristiques et visites personnelles.'
  },
  {
    id: 'visa_3',
    type: 'Études (X1/X2)',
    duration: 'Selon durée des études',
    validity: 'Jusqu\'à 5 ans',
    processingTime: '15-20 jours ouvrables',
    cost: 200000,
    requirements: [
      'Passeport valide 6 mois minimum',
      'Photo d\'identité récente',
      'Formulaire JW201 ou JW202',
      'Lettre d\'admission de l\'université',
      'Certificat médical',
      'Preuve de moyens financiers',
      'Diplômes traduits et légalisés'
    ],
    description: 'Pour les études universitaires ou formations en Chine.'
  },
  {
    id: 'visa_4',
    type: 'Travail (Z)',
    duration: '30 jours (initial)',
    validity: 'Convertible en permis de résidence',
    processingTime: '20-30 jours ouvrables',
    cost: 250000,
    requirements: [
      'Passeport valide 6 mois minimum',
      'Photo d\'identité récente',
      'Permis de travail chinois',
      'Lettre d\'invitation de l\'employeur',
      'Contrat de travail',
      'Certificat médical',
      'Diplômes authentifiés'
    ],
    description: 'Pour travailler légalement en Chine avec un employeur chinois.'
  }
]

// ==================== BLOG POSTS ====================
export const FAKE_BLOG_POSTS = [
  {
    id: 'blog_1',
    title: 'Guide complet de l\'import-export avec la Chine',
    slug: 'guide-complet-import-export-chine',
    excerpt: 'Découvrez tout ce que vous devez savoir pour réussir vos importations depuis la Chine: procédures, pièges à éviter, et conseils pratiques.',
    content: `L'import-export avec la Chine représente une opportunité majeure pour les entrepreneurs africains. Ce guide vous accompagne étape par étape...`,
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
    title: 'Les meilleurs marchés de Guangzhou pour le sourcing',
    slug: 'meilleurs-marches-guangzhou-sourcing',
    excerpt: 'Tour d\'horizon des marchés incontournables de Guangzhou pour trouver les meilleurs produits aux meilleurs prix.',
    content: `Guangzhou, capitale mondiale du commerce, regorge de marchés spécialisés. Voici notre sélection...`,
    category: 'Sourcing',
    author: 'Wang Wei',
    authorAvatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    image: 'https://images.unsplash.com/photo-1519010470956-6d877008eaa4?w=800',
    publishedAt: '2024-01-15',
    views: 890,
    readTime: 6
  },
  {
    id: 'blog_3',
    title: 'Comment négocier efficacement avec les fournisseurs chinois',
    slug: 'negocier-efficacement-fournisseurs-chinois',
    excerpt: 'Techniques et astuces pour obtenir les meilleurs prix et conditions avec vos fournisseurs en Chine.',
    content: `La négociation est un art en Chine. Voici nos conseils pour réussir vos négociations...`,
    category: 'Conseils',
    author: 'Zhang Hui',
    authorAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    publishedAt: '2024-01-10',
    views: 2100,
    readTime: 10
  },
  {
    id: 'blog_4',
    title: 'Foire de Canton 2024: Guide du visiteur',
    slug: 'foire-canton-2024-guide-visiteur',
    excerpt: 'Tout savoir sur la Foire de Canton: dates, inscriptions, conseils pour optimiser votre visite.',
    content: `La Foire de Canton est le plus grand salon commercial au monde. Voici comment en tirer le meilleur parti...`,
    category: 'Événements',
    author: 'Marie Martin',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    publishedAt: '2024-01-05',
    views: 3500,
    readTime: 12
  }
]

// ==================== FAQ ====================
export const FAKE_FAQ = [
  {
    id: 'faq_1',
    question: 'Combien de temps pour trouver un produit en Personal Shopping ?',
    answer: 'Généralement entre 2 et 7 jours selon la disponibilité du produit et sa complexité. Les produits courants sont trouvés plus rapidement que les produits spécifiques ou personnalisés.',
    category: 'Personal Shopping'
  },
  {
    id: 'faq_2',
    question: 'Quels sont les modes de paiement acceptés ?',
    answer: 'Nous acceptons les virements bancaires, Mobile Money (Orange Money, Wave, MTN), et Western Union. Les paiements sont sécurisés et vous recevez une confirmation pour chaque transaction.',
    category: 'Paiement'
  },
  {
    id: 'faq_3',
    question: 'Comment fonctionne le suivi de colis ?',
    answer: 'Chaque colis reçoit un numéro de tracking unique. Vous pouvez suivre votre colis en temps réel sur notre plateforme, de l\'enlèvement en Chine jusqu\'à la livraison chez vous.',
    category: 'Livraison'
  },
  {
    id: 'faq_4',
    question: 'Quels sont les délais de livraison ?',
    answer: 'Les délais varient selon le mode d\'expédition: Express aérien (3-5 jours), Fret aérien standard (15-18 jours), Fret maritime (30-45 jours). Les délais peuvent varier selon la destination.',
    category: 'Livraison'
  },
  {
    id: 'faq_5',
    question: 'Comment sont calculés les frais de douane ?',
    answer: 'Les frais de douane dépendent de la nature des marchandises, de leur valeur déclarée et du pays de destination. Nous vous accompagnons dans les démarches de dédouanement.',
    category: 'Douane'
  },
  {
    id: 'faq_6',
    question: 'Puis-je visiter les usines en Chine ?',
    answer: 'Oui ! Nous organisons des visites guidées d\'usines et de marchés avec nos guides francophones. Contactez-nous pour planifier votre voyage d\'affaires.',
    category: 'Services'
  },
  {
    id: 'faq_7',
    question: 'Quelle est la quantité minimum de commande ?',
    answer: 'Il n\'y a pas de minimum pour le Personal Shopping. Pour les commandes en gros, le MOQ (Minimum Order Quantity) dépend du fournisseur et du produit.',
    category: 'Commandes'
  },
  {
    id: 'faq_8',
    question: 'Comment vérifiez-vous la qualité des produits ?',
    answer: 'Tous les produits passent par notre centre d\'inspection à Guangzhou. Nous vérifions la conformité, prenons des photos et vidéos avant expédition. Vous validez avant l\'envoi.',
    category: 'Qualité'
  }
]

// ==================== SERVICES ====================
export const FAKE_SERVICES = [
  {
    id: 'service_1',
    name: 'Personal Shopping',
    icon: 'bi-bag-check',
    description: 'Trouvez n\'importe quel produit en Chine sans vous déplacer',
    features: ['Recherche personnalisée', 'Négociation prix', 'Vérification qualité', 'Photos/vidéos avant achat']
  },
  {
    id: 'service_2',
    name: 'Import-Export',
    icon: 'bi-box-seam',
    description: 'Expédition de vos marchandises vers l\'Afrique',
    features: ['Fret aérien & maritime', 'Consolidation colis', 'Dédouanement', 'Livraison porte à porte']
  },
  {
    id: 'service_3',
    name: 'Guides & Interprètes',
    icon: 'bi-person-badge',
    description: 'Accompagnement professionnel lors de vos voyages en Chine',
    features: ['Guides francophones', 'Visite usines & marchés', 'Négociation sur place', 'Organisation séjour']
  },
  {
    id: 'service_4',
    name: 'Visa Chine',
    icon: 'bi-passport',
    description: 'Assistance complète pour l\'obtention de votre visa',
    features: ['Visa affaires', 'Visa tourisme', 'Visa études', 'Suivi dossier']
  },
  {
    id: 'service_5',
    name: 'Paiement Fournisseurs',
    icon: 'bi-credit-card',
    description: 'Sécurisez vos paiements avec vos fournisseurs chinois',
    features: ['Paiement sécurisé', 'Taux compétitifs', 'Confirmation rapide', 'Protection acheteur']
  },
  {
    id: 'service_6',
    name: 'Inspection Qualité',
    icon: 'bi-search',
    description: 'Contrôle qualité avant expédition de vos marchandises',
    features: ['Inspection usine', 'Contrôle pré-expédition', 'Rapport détaillé', 'Photos & vidéos']
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
