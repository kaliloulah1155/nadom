/**
 * Ajoute les clés manquantes (psSteps, advantages, visa process/faq, importExport, guide, form) aux 3 locales.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(__dirname, '../i18n/locales')

const extra = {
  fr: {
    personalShopping: {
      newRequestSubtitle: 'Décrivez le produit que vous recherchez',
      noCountriesConfigured: 'Aucun pays configuré.',
      psSteps: [
        { title: 'Envoyez les images', description: 'Partagez des photos ou liens du produit que vous recherchez' },
        { title: 'Discussion WhatsApp', description: 'Échangez avec notre agent pour préciser vos besoins' },
        { title: 'Devis détaillé', description: 'Recevez un devis complet avec tous les frais' },
        { title: 'Paiement sécurisé', description: 'Validez et payez via nos moyens de paiement' },
        { title: 'Livraison', description: 'Recevez votre colis chez vous' },
      ],
      advantagesList: [
        { title: 'Sécurité', description: 'Vérification qualité avant expédition' },
        { title: 'Prix compétitifs', description: 'Négociation directe avec les fournisseurs' },
        { title: 'Support 24/7', description: 'Assistance via WhatsApp' },
        { title: 'Suivi en temps réel', description: 'Suivi de votre colis' },
      ],
      formExtra: {
        selectCategory: 'Sélectionnez une catégorie',
        noCategoriesAvailable: 'Aucune catégorie produit disponible (contactez le support)',
        productExample: 'Ex : Samsung Galaxy S24 Ultra 256 Go',
        describeDetail: 'Décrivez le produit en détail : couleur, taille, caractéristiques, références…',
        uploadMax: 'Téléversez des images du produit que vous recherchez (max 5 images)',
        fullName: 'Nom complet',
        fullNamePlaceholder: 'Prénom Nom',
        whatsappContact: 'Contact WhatsApp',
        submitSuccess: 'Demande envoyée avec succès !',
        submitError: 'Erreur lors de l\'envoi de la demande',
        validationCategory: 'Catégorie requise',
        validationTitle: 'Titre requis',
        validationDescription: 'Description requise',
        validationName: 'Nom complet requis',
        validationEmail: 'Email invalide',
        validationPhone: 'Numéro WhatsApp invalide',
        validationCategorySelect: 'Sélectionnez une catégorie',
        validationTitleShort: 'Titre trop court (min. 5 caractères)',
        validationDescriptionShort: 'Description trop courte (min. 20 caractères)',
        validationQuantity: 'Quantité invalide',
        validationBudget: 'Budget invalide',
        validationContact: 'Numéro de contact invalide',
        maxImages: 'Maximum 5 images autorisées',
        budgetTotalHint: 'Budget total (produit + expédition) — choisissez votre devise',
        contactHint: 'Un agent vous contactera via ce numéro',
        infoTitle: 'Comment ça se passe ?',
        infoBody: 'Après envoi, un agent vous contactera via WhatsApp sous 24-48 h pour préciser les détails et vous envoyer un devis.',
      },
    },
    importExport: {
      noCountriesConfigured: 'Aucun pays configuré.',
    },
    visa: {
      processSteps: [
        { title: 'Consultation', description: 'Évaluation de votre dossier et conseils personnalisés' },
        { title: 'Préparation', description: 'Constitution et vérification de votre dossier' },
        { title: 'Dépôt', description: 'Soumission de votre demande au consulat' },
        { title: 'Suivi', description: 'Suivi de votre dossier jusqu\'à l\'obtention' },
      ],
      faqItems: [
        { question: 'Combien de temps faut-il pour obtenir un visa ?', answer: 'Le délai varie selon le type de visa. Un visa tourisme prend généralement 5-7 jours ouvrables, tandis qu\'un visa travail peut prendre 15-20 jours.' },
        { question: 'Quels documents sont nécessaires ?', answer: 'Les documents de base incluent : passeport valide 6 mois, photos d\'identité, formulaire de demande. D\'autres documents peuvent être requis selon le type de visa.' },
        { question: 'Puis-je faire ma demande en ligne ?', answer: 'Non, la demande de visa chinois doit être faite en personne au consulat. Cependant, nous pouvons vous accompagner dans toutes les démarches.' },
        { question: 'Le visa est-il remboursable ?', answer: 'Les frais de visa ne sont pas remboursables en cas de refus. C\'est pourquoi nous vérifions soigneusement votre dossier avant dépôt.' },
      ],
    },
    guide: {
      accompanimentFallback: [
        { title: 'Visite de marchés', description: 'Accompagnement dans les grands marchés de gros en Chine' },
        { title: 'Visite d\'usines', description: 'Organisation de visites chez les fabricants et producteurs' },
        { title: 'Négociation', description: 'Assistance pour négocier les meilleurs prix avec les fournisseurs' },
        { title: 'Interprétation', description: 'Traduction professionnelle lors de vos réunions d\'affaires' },
        { title: 'Logistique locale', description: 'Gestion du transport local et des formalités' },
        { title: 'Planification', description: 'Organisation complète de votre voyage d\'affaires' },
      ],
    },
    tracking: {
      budget: 'Budget',
      description: 'Description',
    },
    faq: {
      general: 'Général',
    },
    about: {
      watchPromo: 'Découvrir nos services',
    },
    categories: {
      pod: {
        dairy: 'Laitier',
        staple: 'Vivrier',
        citrus: 'Agrumes',
        electronics: 'Électronique',
        clothing: 'Vêtements',
        phone: 'Téléphone',
        vehicle: 'Véhicule',
      },
    },
    auth: {
      personalShoppingFeature: 'Personal Shopping',
      emailRequired: "L'email est requis",
      emailInvalid: 'Email invalide',
      passwordRequired: 'Le mot de passe est requis',
      passwordShort: 'Le mot de passe doit contenir au moins 6 caractères',
    },
  },
  en: {
    personalShopping: {
      newRequestSubtitle: 'Describe the product you are looking for',
      noCountriesConfigured: 'No countries configured.',
      psSteps: [
        { title: 'Send images', description: 'Share photos or links of the product you are looking for' },
        { title: 'WhatsApp chat', description: 'Chat with our agent to clarify your needs' },
        { title: 'Detailed quote', description: 'Receive a complete quote with all fees' },
        { title: 'Secure payment', description: 'Validate and pay via our payment methods' },
        { title: 'Delivery', description: 'Receive your package at home' },
      ],
      advantagesList: [
        { title: 'Security', description: 'Quality check before shipping' },
        { title: 'Competitive prices', description: 'Direct negotiation with suppliers' },
        { title: '24/7 Support', description: 'Assistance via WhatsApp' },
        { title: 'Real-time tracking', description: 'Track your package' },
      ],
      formExtra: {
        selectCategory: 'Select a category',
        noCategoriesAvailable: 'No product categories available (contact support)',
        productExample: 'E.g. Samsung Galaxy S24 Ultra 256GB',
        describeDetail: 'Describe the product in detail: color, size, features, references…',
        uploadMax: 'Upload images of the product you are looking for (max 5 images)',
        fullName: 'Full name',
        fullNamePlaceholder: 'First Last',
        whatsappContact: 'WhatsApp Contact',
        submitSuccess: 'Request sent successfully!',
        submitError: 'Error while submitting the request',
        validationCategory: 'Category is required',
        validationTitle: 'Title is required',
        validationDescription: 'Description is required',
        validationName: 'Full name is required',
        validationEmail: 'Invalid email',
        validationPhone: 'Invalid WhatsApp number',
        validationCategorySelect: 'Select a category',
        validationTitleShort: 'Title too short (min. 5 characters)',
        validationDescriptionShort: 'Description too short (min. 20 characters)',
        validationQuantity: 'Invalid quantity',
        validationBudget: 'Invalid budget',
        validationContact: 'Invalid contact number',
        maxImages: 'Maximum 5 images allowed',
        budgetTotalHint: 'Total budget (product + shipping) — pick your currency',
        contactHint: 'An agent will contact you via this number',
        infoTitle: 'What happens next?',
        infoBody: 'After submission, an agent will contact you via WhatsApp within 24-48h to discuss details and send you a quote.',
      },
    },
    importExport: {
      noCountriesConfigured: 'No countries configured.',
    },
    visa: {
      processSteps: [
        { title: 'Consultation', description: 'Evaluation of your file and personalized advice' },
        { title: 'Preparation', description: 'Preparation and verification of your file' },
        { title: 'Submission', description: 'Submission of your application to the consulate' },
        { title: 'Follow-up', description: 'Follow-up until you receive your visa' },
      ],
      faqItems: [
        { question: 'How long does it take to get a visa?', answer: 'Processing time varies by visa type. Tourist visas usually take 5-7 business days; work visas may take 15-20 days.' },
        { question: 'What documents are required?', answer: 'Basic documents include a passport valid for 6 months, ID photos, and the application form. Additional documents may be required depending on visa type.' },
        { question: 'Can I apply online?', answer: 'No, Chinese visa applications must be submitted in person at the consulate. We can assist you with every step.' },
        { question: 'Is the visa refundable?', answer: 'Visa fees are not refundable if refused. We carefully review your file before submission.' },
      ],
    },
    guide: {
      accompanimentFallback: [
        { title: 'Market visits', description: 'Support in major wholesale markets in China' },
        { title: 'Factory visits', description: 'Visits to manufacturers and producers' },
        { title: 'Negotiation', description: 'Help negotiating the best prices with suppliers' },
        { title: 'Interpretation', description: 'Professional translation during business meetings' },
        { title: 'Local logistics', description: 'Local transport and formalities management' },
        { title: 'Planning', description: 'Full organization of your business trip' },
      ],
    },
    tracking: { budget: 'Budget', description: 'Description' },
    faq: { general: 'General' },
    about: { watchPromo: 'Watch promo video' },
    categories: {
      pod: {
        dairy: 'Dairy',
        staple: 'Staple foods',
        citrus: 'Citrus',
        electronics: 'Electronics',
        clothing: 'Clothing',
        phone: 'Phones',
        vehicle: 'Vehicles',
      },
    },
    auth: {
      personalShoppingFeature: 'Personal Shopping',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      passwordShort: 'Password must be at least 6 characters',
    },
  },
  zh: {
    personalShopping: {
      newRequestSubtitle: '描述您要寻找的产品',
      noCountriesConfigured: '尚未配置国家。',
      psSteps: [
        { title: '发送图片', description: '分享您要寻找产品的照片或链接' },
        { title: 'WhatsApp 沟通', description: '与我们的代理交流以明确您的需求' },
        { title: '详细报价', description: '收到包含所有费用的完整报价' },
        { title: '安全付款', description: '通过我们的付款方式确认并支付' },
        { title: '配送', description: '在家收到您的包裹' },
      ],
      advantagesList: [
        { title: '安全保障', description: '发货前质量检验' },
        { title: '有竞争力的价格', description: '直接与供应商议价' },
        { title: '24/7 客服', description: '通过 WhatsApp 协助' },
        { title: '实时跟踪', description: '跟踪您的包裹' },
      ],
      formExtra: {
        selectCategory: '选择分类',
        noCategoriesAvailable: '暂无产品分类（请联系客服）',
        productExample: '例如：Samsung Galaxy S24 Ultra 256GB',
        describeDetail: '详细描述产品：颜色、尺寸、特性、参考信息…',
        uploadMax: '上传您要寻找产品的图片（最多 5 张）',
        fullName: '全名',
        fullNamePlaceholder: '名 姓',
        whatsappContact: 'WhatsApp 联系方式',
        submitSuccess: '请求已成功发送！',
        submitError: '发送请求时出错',
        validationCategory: '请选择分类',
        validationTitle: '请填写标题',
        validationDescription: '请填写描述',
        validationName: '请填写全名',
        validationEmail: '电子邮件无效',
        validationPhone: 'WhatsApp 号码无效',
        validationCategorySelect: '请选择分类',
        validationTitleShort: '标题过短（至少 5 个字符）',
        validationDescriptionShort: '描述过短（至少 20 个字符）',
        validationQuantity: '数量无效',
        validationBudget: '预算无效',
        validationContact: '联系电话无效',
        maxImages: '最多允许 5 张图片',
        budgetTotalHint: '总预算（产品 + 运费）— 请选择货币',
        contactHint: '代理将通过此号码与您联系',
        infoTitle: '接下来会怎样？',
        infoBody: '提交后，代理将在 24-48 小时内通过 WhatsApp 与您联系，讨论细节并发送报价。',
      },
    },
    importExport: {
      noCountriesConfigured: '尚未配置国家。',
    },
    visa: {
      processSteps: [
        { title: '咨询', description: '评估您的材料并提供个性化建议' },
        { title: '准备', description: '整理并审核您的申请材料' },
        { title: '递交', description: '向领事馆提交您的申请' },
        { title: '跟进', description: '跟进申请直至取得签证' },
      ],
      faqItems: [
        { question: '办理签证需要多长时间？', answer: '时间因签证类型而异。旅游签证通常需要 5-7 个工作日，工作签证可能需要 15-20 天。' },
        { question: '需要哪些材料？', answer: '基本材料包括：有效期 6 个月的护照、证件照、申请表。根据签证类型可能需要其他材料。' },
        { question: '可以在线申请吗？', answer: '不可以，中国签证须本人到领事馆申请。我们可以在各步骤为您提供协助。' },
        { question: '签证费可退吗？', answer: '被拒后签证费不退。因此我们会在递交前仔细审核您的材料。' },
      ],
    },
    guide: {
      accompanimentFallback: [
        { title: '市场考察', description: '陪同参观中国大型批发市场' },
        { title: '工厂参观', description: '安排参观制造商和生产商' },
        { title: '商务谈判', description: '协助与供应商议价争取最优价格' },
        { title: '口译翻译', description: '商务会议专业翻译' },
        { title: '本地物流', description: '本地运输及手续办理' },
        { title: '行程规划', description: '全程安排您的商务行程' },
      ],
    },
    tracking: { budget: '预算', description: '描述' },
    faq: { general: '常规' },
    about: { watchPromo: '了解我们的服务' },
    categories: {
      pod: {
        dairy: '乳制品',
        staple: '主食',
        citrus: '柑橘',
        electronics: '电子产品',
        clothing: '服装',
        phone: '手机',
        vehicle: '车辆',
      },
    },
    auth: {
      personalShoppingFeature: '代购服务',
      emailRequired: '请填写电子邮件',
      emailInvalid: '电子邮件无效',
      passwordRequired: '请填写密码',
      passwordShort: '密码至少需要 6 个字符',
    },
  },
}

function deepMerge(t, s) {
  for (const k of Object.keys(s)) {
    if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) {
      if (!t[k]) t[k] = {}
      deepMerge(t[k], s[k])
    } else {
      t[k] = s[k]
    }
  }
}

for (const lang of ['fr', 'en', 'zh']) {
  const file = path.join(dir, `${lang}.json`)
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  deepMerge(data, extra[lang])
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('Patched', file)
}
