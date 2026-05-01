# Structure de Base de Données - NADOM Platform

## Vue d'ensemble

Ce document décrit la structure complète de la base de données pour la plateforme NADOM (Import-Export & Personal Shopping).

## Diagramme ERD (Entités-Relations)

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ 1:N
       │
       ├──────────┐
       │          │
       ▼          ▼
┌──────────────┐  ┌─────────────────┐       ┌──────────────────┐
│personal_     │  │  shipments      │◄──────┤  destinations    │
│shopping_     │  │                 │       │                  │
│requests      │◄─┤                 │       └──────────────────┘
└──────┬───────┘  └──────┬──────────┘
       │                 │
       │ N:M             │ 1:N
       │                 │
       ▼                 ▼
┌──────────────┐  ┌─────────────────┐
│request_items │  │shipment_timeline│
└──────────────┘  └─────────────────┘

┌──────────────┐       ┌─────────────┐
│   guides     │◄──┬───┤guide_bookings│
└──────────────┘   │   └─────────────┘
                   │
┌──────────────┐   │
│    users     │───┘
└──────────────┘

┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│ visa_types   │◄──────┤ visa_applications│◄──────┤    users     │
└──────────────┘       └─────────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐
│  categories  │◄──────┤   products   │
└──────────────┘       └──────┬───────┘
                              │
                              │ N:M
                              │
                              ▼
                       ┌──────────────┐       ┌──────────────┐
                       │  cart_items  │◄──────┤    users     │
                       └──────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐
│  blog_posts  │       │     faq      │
└──────────────┘       └──────────────┘
```

---

## 1. Table: `users`

Gère tous les utilisateurs (clients, admins, agents).

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    role ENUM('client', 'admin', 'agent') NOT NULL DEFAULT 'client',
    avatar VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);
```

**Champs:**
- `id`: Identifiant unique (ex: user_1234567890)
- `email`: Email unique pour connexion
- `password`: Hash du mot de passe (bcrypt/argon2)
- `role`: Type d'utilisateur (client, admin, agent)
- `avatar`: URL de la photo de profil

### Exemple JSON:

```json
{
  "id": "user_1",
  "email": "jean.dupont@example.com",
  "password": "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
  "first_name": "Jean",
  "last_name": "Dupont",
  "phone": "+225 01 23 45 67",
  "country": "Côte d'Ivoire",
  "city": "Abidjan",
  "role": "client",
  "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
  "email_verified": true,
  "is_active": true,
  "created_at": "2024-01-01T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

---

## 2. Table: `categories`

Catégories de produits pour Personal Shopping.

```sql
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3498db',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_display_order (display_order)
);
```

### Exemple JSON:

```json
{
  "id": "cat_1",
  "name_fr": "Électronique & High-Tech",
  "name_en": "Electronics & High-tech",
  "icon": "bi-phone",
  "color": "#3498db",
  "is_active": true,
  "display_order": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 3. Table: `products`

Catalogue de produits prédéfinis.

```sql
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    price DECIMAL(12, 2) NOT NULL,
    image VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    stock_status ENUM('in_stock', 'out_of_stock', 'on_demand') DEFAULT 'on_demand',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_price (price)
);
```

### Exemple JSON:

```json
{
  "id": "prod_1",
  "category_id": "cat_1",
  "name_fr": "iPhone 15 Pro 256GB",
  "name_en": "iPhone 15 Pro 256GB",
  "description_fr": "Dernier iPhone avec puce A17 Pro et cadre en titane.",
  "description_en": "Latest iPhone with A17 Pro chip and titanium frame.",
  "price": 850000.00,
  "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400",
  "is_active": true,
  "stock_status": "on_demand",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-10T12:00:00Z"
}
```

---

## 4. Table: `personal_shopping_requests`

Demandes de Personal Shopping des clients.

```sql
CREATE TABLE personal_shopping_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    contact_number VARCHAR(20),
    status ENUM('pending', 'searching', 'negotiating', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    category VARCHAR(200) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    images JSON,
    budget_estimated DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    quoted_price DECIMAL(12, 2),
    quoted_details JSON,
    assigned_agent_id VARCHAR(50),
    whatsapp_messages INT DEFAULT 0,
    tracking_number VARCHAR(100),
    shipment_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_agent (assigned_agent_id),
    INDEX idx_tracking (tracking_number),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description)
);
```

### Exemple JSON:

```json
{
  "id": "req_1",
  "user_id": "user_1",
  "contact_number": "+225 01 23 45 67",
  "status": "negotiating",
  "category": "Électronique & High-Tech",
  "title": "Samsung Galaxy S24 Ultra",
  "description": "Téléphone dernière génération, couleur noir titanium, 256GB, version internationale avec garantie",
  "images": [
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  ],
  "budget_estimated": 500000.00,
  "quantity": 1,
  "quoted_price": 450000.00,
  "quoted_details": {
    "productCost": 380000,
    "serviceFee": 19000,
    "inspectionFee": 5000,
    "packagingFee": 3000,
    "shippingCost": 43000,
    "totalPrice": 450000
  },
  "assigned_agent_id": "user_3",
  "whatsapp_messages": 12,
  "tracking_number": null,
  "shipment_id": null,
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-22T15:45:00Z"
}
```

---

## 5. Table: `request_items`

Produits sélectionnés dans une demande (depuis le catalogue).

```sql
CREATE TABLE request_items (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES personal_shopping_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_request (request_id),
    INDEX idx_product (product_id)
);
```

### Exemple JSON:

```json
{
  "id": "item_1",
  "request_id": "req_direct_1",
  "product_id": "prod_1",
  "quantity": 1,
  "price": 850000.00,
  "created_at": "2024-01-20T10:30:00Z"
}
```

---

## 6. Table: `destinations`

Destinations d'expédition avec tarifs.

```sql
CREATE TABLE destinations (
    id VARCHAR(50) PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    continent VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    flag VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_country (country),
    INDEX idx_active (is_active)
);
```

### Exemple JSON:

```json
{
  "id": "dest_ci",
  "country": "Côte d'Ivoire",
  "continent": "Afrique",
  "city": "Abidjan",
  "flag": "🇨🇮",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 7. Table: `shipping_modes`

Modes d'expédition par destination.

```sql
CREATE TABLE shipping_modes (
    id VARCHAR(50) PRIMARY KEY,
    destination_id VARCHAR(50) NOT NULL,
    mode ENUM('air_normal', 'air_express', 'sea') NOT NULL,
    duration VARCHAR(100) NOT NULL,
    cost_per_kg DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_destination (destination_id),
    INDEX idx_mode (mode)
);
```

### Exemple JSON:

```json
{
  "id": "mode_1",
  "destination_id": "dest_ci",
  "mode": "air_express",
  "duration": "3-5 jours",
  "cost_per_kg": 12500.00,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 8. Table: `shipments`

Expéditions de colis.

```sql
CREATE TABLE shipments (
    id VARCHAR(50) PRIMARY KEY,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    request_id VARCHAR(50),
    destination_country VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    shipping_mode ENUM('air_normal', 'air_express', 'sea') NOT NULL,
    status ENUM('pending', 'picked_up', 'in_transit', 'in_customs', 'out_for_delivery', 'delivered') NOT NULL DEFAULT 'pending',
    weight DECIMAL(10, 2) NOT NULL,
    dimensions VARCHAR(100),
    declared_value DECIMAL(12, 2) NOT NULL,
    shipping_cost DECIMAL(12, 2) NOT NULL,
    current_location VARCHAR(200),
    estimated_delivery DATE,
    actual_delivery DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES personal_shopping_requests(id) ON DELETE SET NULL,
    INDEX idx_tracking (tracking_number),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Exemple JSON:

```json
{
  "id": "ship_1",
  "tracking_number": "TRK-2024-001234",
  "user_id": "user_1",
  "request_id": "req_5",
  "destination_country": "Côte d'Ivoire",
  "destination_city": "Abidjan",
  "shipping_mode": "air_express",
  "status": "in_transit",
  "weight": 8.50,
  "dimensions": "40x30x25 cm",
  "declared_value": 875000.00,
  "shipping_cost": 110000.00,
  "current_location": "En vol - Guangzhou → Abidjan",
  "estimated_delivery": "2024-01-27",
  "actual_delivery": null,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-22T08:00:00Z"
}
```

---

## 9. Table: `shipment_timeline`

Historique de suivi des expéditions.

```sql
CREATE TABLE shipment_timeline (
    id VARCHAR(50) PRIMARY KEY,
    shipment_id VARCHAR(50) NOT NULL,
    date TIMESTAMP NOT NULL,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    INDEX idx_shipment (shipment_id),
    INDEX idx_date (date)
);
```

### Exemple JSON:

```json
{
  "id": "timeline_1",
  "shipment_id": "ship_1",
  "date": "2024-01-20T10:00:00Z",
  "status": "order_placed",
  "location": "Guangzhou, Chine",
  "description": "Commande validée et payée",
  "created_at": "2024-01-20T10:00:00Z"
}
```

---

## 10. Table: `guides`

Guides/Interprètes disponibles en Chine.

```sql
CREATE TABLE guides (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    languages JSON NOT NULL,
    specializations_fr JSON NOT NULL,
    specializations_en JSON NOT NULL,
    cities JSON NOT NULL,
    experience INT NOT NULL DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews INT DEFAULT 0,
    avatar VARCHAR(500),
    price_per_day DECIMAL(12, 2) NOT NULL,
    price_per_hour DECIMAL(12, 2) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_available (available),
    INDEX idx_rating (rating)
);
```

### Exemple JSON:

```json
{
  "id": "guide_1",
  "name": "Wang Wei",
  "languages": ["Français", "Mandarin", "Anglais"],
  "specializations_fr": ["Commerce", "Marchés de gros", "Sourcing"],
  "specializations_en": ["Business", "Wholesale markets", "Sourcing"],
  "cities": ["Guangzhou", "Shenzhen"],
  "experience": 8,
  "rating": 4.8,
  "reviews": 45,
  "avatar": "https://randomuser.me/api/portraits/men/10.jpg",
  "price_per_day": 150000.00,
  "price_per_hour": 25000.00,
  "description_fr": "Expert en sourcing et négociation dans les marchés de Guangzhou.",
  "description_en": "Expert in sourcing and negotiation in Guangzhou markets.",
  "available": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

## 11. Table: `guide_bookings`

Réservations de guides.

```sql
CREATE TABLE guide_bookings (
    id VARCHAR(50) PRIMARY KEY,
    guide_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    service_type ENUM('hourly', 'daily') NOT NULL DEFAULT 'daily',
    hours INT,
    days INT,
    total_price DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_guide (guide_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);
```

### Exemple JSON:

```json
{
  "id": "booking_1",
  "guide_id": "guide_1",
  "user_id": "user_1",
  "start_date": "2024-02-10",
  "end_date": "2024-02-12",
  "service_type": "daily",
  "hours": null,
  "days": 3,
  "total_price": 450000.00,
  "status": "confirmed",
  "notes": "Visite des marchés de Guangzhou pour sourcing textile",
  "created_at": "2024-01-20T14:30:00Z",
  "updated_at": "2024-01-21T09:15:00Z"
}
```

---

## 12. Table: `visa_types`

Types de visas disponibles.

```sql
CREATE TABLE visa_types (
    id VARCHAR(50) PRIMARY KEY,
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    duration_fr VARCHAR(100) NOT NULL,
    duration_en VARCHAR(100) NOT NULL,
    validity_fr VARCHAR(100) NOT NULL,
    validity_en VARCHAR(100) NOT NULL,
    processing_time_fr VARCHAR(100) NOT NULL,
    processing_time_en VARCHAR(100) NOT NULL,
    cost DECIMAL(12, 2) NOT NULL,
    requirements_fr JSON NOT NULL,
    requirements_en JSON NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    pdf_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_type (type),
    INDEX idx_active (is_active)
);
```

### Exemple JSON:

```json
{
  "id": "visa_1",
  "name_fr": "Visa Affaires (M)",
  "name_en": "Business Visa (M)",
  "type": "Affaires (M)",
  "duration_fr": "30-90 jours",
  "duration_en": "30-90 days",
  "validity_fr": "1 an (entrées multiples)",
  "validity_en": "1 year (multiple entries)",
  "processing_time_fr": "7-10 jours ouvrables",
  "processing_time_en": "7-10 business days",
  "cost": 150000.00,
  "requirements_fr": [
    "Passeport valide 6 mois minimum",
    "Lettre d'invitation d'une entreprise chinoise",
    "Photos d'identité récentes",
    "Formulaire de demande rempli"
  ],
  "requirements_en": [
    "Passport valid for at least 6 months",
    "Invitation letter from a Chinese company",
    "Recent passport photos",
    "Completed application form"
  ],
  "description_fr": "Pour les voyages d'affaires, réunions, et foires commerciales.",
  "description_en": "For business trips, meetings, and trade fairs.",
  "pdf_url": "https://example.com/docs/visa-affaires.pdf",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 13. Table: `visa_applications`

Demandes de visa des clients.

```sql
CREATE TABLE visa_applications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    visa_type VARCHAR(100) NOT NULL,
    status ENUM('pending', 'processing', 'approved', 'rejected') NOT NULL DEFAULT 'pending',

    -- Informations du demandeur
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    passport_number VARCHAR(100) NOT NULL,
    passport_expiry DATE NOT NULL,

    -- Dates de voyage
    departure_date DATE NOT NULL,
    return_date DATE,

    -- Documents
    documents JSON,
    notes TEXT,
    admin_notes TEXT,

    total_cost DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_visa_type (visa_type),
    INDEX idx_created_at (created_at)
);
```

### Exemple JSON:

```json
{
  "id": "visa_app_1",
  "user_id": "user_1",
  "visa_type": "Affaires (M)",
  "status": "processing",
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+225 01 23 45 67",
  "nationality": "Ivoirienne",
  "passport_number": "CI123456789",
  "passport_expiry": "2028-06-15",
  "departure_date": "2024-03-01",
  "return_date": "2024-03-15",
  "documents": [
    "https://example.com/uploads/passport_scan.pdf",
    "https://example.com/uploads/invitation_letter.pdf",
    "https://example.com/uploads/photo.jpg"
  ],
  "notes": "Participation à la Foire de Canton",
  "admin_notes": "Documents vérifiés, en attente d'approbation consulaire",
  "total_cost": 150000.00,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-22T14:30:00Z"
}
```

---

## 14. Table: `blog_posts`

Articles de blog.

```sql
CREATE TABLE blog_posts (
    id VARCHAR(50) PRIMARY KEY,
    title_fr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt_fr TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    content_fr LONGTEXT NOT NULL,
    content_en LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(200) NOT NULL,
    author_avatar VARCHAR(500),
    image VARCHAR(500),
    views INT DEFAULT 0,
    read_time INT DEFAULT 5,
    tags JSON,
    published_at DATE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_published (is_published, published_at),
    FULLTEXT idx_search (title_fr, title_en, excerpt_fr, excerpt_en)
);
```

### Exemple JSON:

```json
{
  "id": "blog_1",
  "title_fr": "Guide complet de l'import-export avec la Chine",
  "title_en": "Complete guide to import-export with China",
  "slug": "guide-complet-import-export-chine",
  "excerpt_fr": "Découvrez tout ce que vous devez savoir pour réussir vos importations depuis la Chine: procédures, pièges à éviter, et conseils pratiques.",
  "excerpt_en": "Discover everything you need to know to succeed in your imports from China: procedures, pitfalls to avoid, and practical advice.",
  "content_fr": "L'import-export avec la Chine représente une opportunité majeure pour les entrepreneurs africains...",
  "content_en": "Import-export with China represents a major opportunity for African entrepreneurs...",
  "category": "Import-Export",
  "author": "Marie Martin",
  "author_avatar": "https://randomuser.me/api/portraits/women/2.jpg",
  "image": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
  "views": 1250,
  "read_time": 8,
  "tags": ["import-export", "chine", "guide", "commerce"],
  "published_at": "2024-01-20",
  "is_published": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T09:00:00Z"
}
```

---

## 15. Table: `faq`

Questions fréquemment posées.

```sql
CREATE TABLE faq (
    id VARCHAR(50) PRIMARY KEY,
    question_fr TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_fr TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_display_order (display_order),
    FULLTEXT idx_search (question_fr, question_en, answer_fr, answer_en)
);
```

### Exemple JSON:

```json
{
  "id": "faq_1",
  "question_fr": "Combien de temps pour trouver un produit en Personal Shopping ?",
  "question_en": "How long does it take to find a product in Personal Shopping?",
  "answer_fr": "Généralement entre 2 et 7 jours selon la disponibilité du produit et sa complexité. Pour les produits standards, nous pouvons souvent trouver une source en 2-3 jours. Pour les produits plus spécifiques ou personnalisés, cela peut prendre jusqu'à 7 jours.",
  "answer_en": "Generally between 2 and 7 days depending on product availability and complexity. For standard products, we can often find a source in 2-3 days. For more specific or customized products, it can take up to 7 days.",
  "category": "Personal Shopping",
  "display_order": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 16. Table: `cart_items`

Panier d'achat des utilisateurs.

```sql
CREATE TABLE cart_items (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
);
```

### Exemple JSON:

```json
{
  "id": "cart_1",
  "user_id": "user_1",
  "product_id": "prod_1",
  "quantity": 2,
  "created_at": "2024-01-25T16:30:00Z",
  "updated_at": "2024-01-25T18:45:00Z"
}
```

---

## 17. Table: `notifications`

Notifications pour les utilisateurs.

```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at)
);
```

### Exemple JSON:

```json
{
  "id": "notif_1",
  "user_id": "user_1",
  "type": "request_status_update",
  "title": "Votre demande a été mise à jour",
  "message": "Votre demande 'Samsung Galaxy S24 Ultra' est maintenant en phase de négociation. Un devis vous a été envoyé.",
  "link": "/personal-shopping/req_1",
  "is_read": false,
  "created_at": "2024-01-22T15:45:00Z"
}
```

---

## 18. Table: `activity_logs`

Logs d'activité pour l'audit.

```sql
CREATE TABLE activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);
```

### Exemple JSON:

```json
{
  "id": "log_1",
  "user_id": "user_1",
  "action": "create",
  "entity_type": "personal_shopping_request",
  "entity_id": "req_1",
  "details": {
    "title": "Samsung Galaxy S24 Ultra",
    "category": "Électronique & High-Tech",
    "budget": 500000
  },
  "ip_address": "102.176.234.15",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "created_at": "2024-01-20T10:30:00Z"
}
```

---

## Relations Principales

### 1. Users → Personal Shopping Requests (1:N)
Un utilisateur peut créer plusieurs demandes de personal shopping.

### 2. Personal Shopping Requests → Request Items (1:N)
Une demande peut contenir plusieurs produits du catalogue.

### 3. Personal Shopping Requests ↔ Shipments (1:1)
Une demande peut être liée à une expédition.

### 4. Users → Shipments (1:N)
Un utilisateur peut avoir plusieurs expéditions.

### 5. Destinations → Shipping Modes (1:N)
Chaque destination a plusieurs modes d'expédition.

### 6. Shipments → Shipment Timeline (1:N)
Chaque expédition a un historique de tracking.

### 7. Guides → Guide Bookings (1:N)
Un guide peut avoir plusieurs réservations.

### 8. Users → Guide Bookings (1:N)
Un utilisateur peut réserver plusieurs guides.

### 9. Visa Types → Visa Applications (1:N)
Un type de visa peut avoir plusieurs demandes.

### 10. Users → Visa Applications (1:N)
Un utilisateur peut faire plusieurs demandes de visa.

### 11. Categories → Products (1:N)
Une catégorie contient plusieurs produits.

### 12. Users → Cart Items (1:N)
Un utilisateur a un panier avec plusieurs produits.

---

## Index et Optimisations

### Index recommandés pour les performances:

1. **Recherche de commandes par utilisateur**
   ```sql
   CREATE INDEX idx_user_status ON personal_shopping_requests(user_id, status);
   ```

2. **Tracking de colis**
   ```sql
   CREATE UNIQUE INDEX idx_tracking_unique ON shipments(tracking_number);
   ```

3. **Recherche de produits**
   ```sql
   CREATE FULLTEXT INDEX idx_product_search ON products(name_fr, name_en, description_fr, description_en);
   ```

4. **Statistiques admin**
   ```sql
   CREATE INDEX idx_stats_date ON personal_shopping_requests(status, created_at);
   CREATE INDEX idx_shipment_stats ON shipments(status, created_at);
   ```

---

## Contraintes et Validations

### Au niveau de la base de données:

1. **Email unique**
   ```sql
   ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
   ```

2. **Validation des prix**
   ```sql
   ALTER TABLE products ADD CONSTRAINT check_price CHECK (price >= 0);
   ```

3. **Validation des quantités**
   ```sql
   ALTER TABLE request_items ADD CONSTRAINT check_quantity CHECK (quantity > 0);
   ```

4. **Validation des dates**
   ```sql
   ALTER TABLE guide_bookings ADD CONSTRAINT check_dates CHECK (end_date >= start_date);
   ```

---

## Données de Test (Seeds)

Pour initialiser la base avec des données de test, utilisez les données de `utils/data/fakeData.ts`.

**Ordre d'insertion:**
1. `users`
2. `categories`
3. `products`
4. `destinations`
5. `shipping_modes`
6. `personal_shopping_requests`
7. `request_items`
8. `shipments`
9. `shipment_timeline`
10. `guides`
11. `guide_bookings`
12. `visa_types`
13. `visa_applications`
14. `blog_posts`
15. `faq`

---

## API Endpoints Recommandés

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil

### Personal Shopping
- `GET /api/personal-shopping/requests` - Liste des demandes
- `POST /api/personal-shopping/requests` - Créer une demande
- `GET /api/personal-shopping/requests/:id` - Détail d'une demande
- `PUT /api/personal-shopping/requests/:id` - Modifier une demande
- `DELETE /api/personal-shopping/requests/:id` - Supprimer une demande
- `PUT /api/personal-shopping/requests/:id/status` - Changer le statut
- `POST /api/personal-shopping/requests/:id/quotation` - Ajouter un devis

### Produits & Catégories
- `GET /api/categories` - Liste des catégories
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détail d'un produit
- `GET /api/categories/:id/products` - Produits par catégorie

### Expéditions
- `GET /api/shipments` - Liste des expéditions
- `POST /api/shipments` - Créer une expédition
- `GET /api/shipments/:id` - Détail d'une expédition
- `GET /api/shipments/track/:trackingNumber` - Tracking par numéro
- `PUT /api/shipments/:id/status` - Mettre à jour le statut
- `POST /api/shipments/:id/timeline` - Ajouter un événement

### Destinations
- `GET /api/destinations` - Liste des destinations
- `GET /api/destinations/:id/shipping-modes` - Modes d'expédition
- `POST /api/shipping/calculate` - Calculer le coût d'expédition

### Guides
- `GET /api/guides` - Liste des guides
- `GET /api/guides/:id` - Détail d'un guide
- `POST /api/guides/bookings` - Réserver un guide
- `GET /api/guides/bookings` - Mes réservations
- `PUT /api/guides/bookings/:id/status` - Changer le statut

### Visas
- `GET /api/visa-types` - Types de visas disponibles
- `GET /api/visa-types/:id` - Détail d'un type de visa
- `POST /api/visa/applications` - Créer une demande
- `GET /api/visa/applications` - Mes demandes
- `PUT /api/visa/applications/:id/status` - Changer le statut (admin)

### Blog & FAQ
- `GET /api/blog/posts` - Liste des articles
- `GET /api/blog/posts/:slug` - Détail d'un article
- `GET /api/faq` - Liste des FAQ

### Panier
- `GET /api/cart` - Mon panier
- `POST /api/cart/items` - Ajouter au panier
- `PUT /api/cart/items/:id` - Modifier la quantité
- `DELETE /api/cart/items/:id` - Retirer du panier
- `DELETE /api/cart` - Vider le panier

### Admin
- `GET /api/admin/stats` - Statistiques générales
- `GET /api/admin/users` - Gestion des utilisateurs
- `GET /api/admin/requests` - Toutes les demandes
- `GET /api/admin/shipments` - Toutes les expéditions

---

## Sécurité et Bonnes Pratiques

1. **Hashage des mots de passe**: Utiliser bcrypt ou argon2
2. **JWT pour l'authentification**: Token avec expiration
3. **Validation des entrées**: Sanitize toutes les entrées utilisateur
4. **Rate limiting**: Limiter les requêtes par IP
5. **CORS**: Configurer correctement les origines autorisées
6. **SQL Injection**: Utiliser des requêtes préparées
7. **Backup réguliers**: Sauvegardes automatiques quotidiennes

---

## Technologies Backend Recommandées

### Option 1: Node.js
- **Framework**: Express.js ou NestJS
- **ORM**: Prisma ou TypeORM
- **Validation**: Joi ou Zod
- **Auth**: JWT + bcrypt

### Option 2: PHP
- **Framework**: Laravel
- **ORM**: Eloquent
- **Validation**: Laravel Validation
- **Auth**: Laravel Sanctum

### Option 3: Python
- **Framework**: FastAPI ou Django
- **ORM**: SQLAlchemy ou Django ORM
- **Validation**: Pydantic
- **Auth**: JWT + passlib

---

## Variables d'Environnement

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nadom_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API
API_PORT=3001
API_BASE_URL=http://localhost:3001

# WhatsApp
WHATSAPP_NUMBER=+2250714158172

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Redis (optional pour cache)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Scripts SQL Utiles

### Statistiques rapides
```sql
-- Nombre de demandes par statut
SELECT status, COUNT(*) as count
FROM personal_shopping_requests
GROUP BY status;

-- Revenus totaux
SELECT SUM(quoted_price) as total_revenue
FROM personal_shopping_requests
WHERE quoted_price IS NOT NULL;

-- Expéditions en transit
SELECT COUNT(*) as in_transit
FROM shipments
WHERE status IN ('picked_up', 'in_transit', 'in_customs', 'out_for_delivery');
```

---

**Note**: Cette structure est basée sur l'analyse complète du frontend Nuxt.js. Adaptez-la selon vos besoins spécifiques et votre stack technique.
