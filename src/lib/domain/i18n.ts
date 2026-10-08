import { LANGUAGES, type Language } from './content';

/**
 * Internationalisation de l'interface (i18n) et direction d'écriture (RTL).
 *
 * Le vocabulaire du contenu pédagogique (FR-14) et celui de l'interface sont
 * alignés sur les mêmes langues. Seul l'arabe s'affiche de droite à gauche.
 */

export type Locale = Language;
export type Direction = 'ltr' | 'rtl';
export type MessageParams = Record<string, string | number>;

export const LOCALES = LANGUAGES;

export const DEFAULT_LOCALE: Locale = 'fr';
export const FALLBACK_LOCALE: Locale = 'fr';

export const RTL_LOCALES: readonly Locale[] = ['ar'];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export interface LocaleSources {
  cookie?: string | null;
  userLocale?: string | null;
  acceptLanguage?: string | null;
}

/**
 * Ordre de priorité de résolution : cookie explicite > préférence du compte >
 * en-tête `Accept-Language` > locale par défaut.
 */
export function resolveLocalePrecedence(
  sources: LocaleSources,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (isLocale(sources.cookie)) return sources.cookie;
  if (isLocale(sources.userLocale)) return sources.userLocale;
  return resolveLocale(sources.acceptLanguage, fallback);
}

export function isRtl(locale: Locale): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}

export function direction(locale: Locale): Direction {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/**
 * Sélectionne la locale supportée la mieux classée dans un en-tête
 * `Accept-Language`. Retombe sur `fallback` si aucune langue n'est reconnue.
 */
export function resolveLocale(
  acceptLanguage: string | null | undefined,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (!acceptLanguage) return fallback;

  const parsed: { tag: string; q: number }[] = [];
  for (const part of acceptLanguage
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)) {
    const segments = part.split(';');
    const tag = (segments[0] ?? '').trim().toLowerCase();
    let q = 1;
    for (const param of segments.slice(1)) {
      const eq = param.indexOf('=');
      if (eq === -1) continue;
      const k = param.slice(0, eq).trim().toLowerCase();
      if (k === 'q') {
        const n = Number.parseFloat(param.slice(eq + 1));
        if (!Number.isNaN(n)) q = n;
      }
    }
    parsed.push({ tag, q });
  }

  parsed.sort((a, b) => b.q - a.q);

  for (const { tag } of parsed) {
    if (!tag || tag === '*') continue;
    const base = tag.split('-')[0] ?? '';
    if (isLocale(base)) return base;
  }

  return fallback;
}

export function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Traduit une clé dans la locale demandée, avec repli français puis clé brute. */
export function translate(locale: Locale, key: string, params?: MessageParams): string {
  const template =
    MESSAGES[locale]?.[key] ?? MESSAGES[FALLBACK_LOCALE]?.[key] ?? key;
  return interpolate(template, params);
}

/**
 * Insère `lang` et `dir` sur la balise `<html>` d'une page SSR, en remplaçant
 * les attributs existants s'ils sont déjà présents.
 */
export function applyHtmlLocale(html: string, locale: Locale): string {
  const dir = direction(locale);
  return html.replace(/<html([^>]*)>/, (_match, attrs: string) => {
    const cleaned = attrs
      .replace(/\s+lang="[^"]*"/, '')
      .replace(/\s+dir="[^"]*"/, '');
    return `<html${cleaned} lang="${locale}" dir="${dir}">`;
  });
}

export const MESSAGES: Record<Locale, Record<string, string>> = {
  fr: {
    'common.email': 'Email',
    'common.name': 'Nom',
    'common.password': 'Mot de passe',
    'common.title': 'Titre',
    'common.create': 'Créer',
    'common.delete': 'Supprimer',
    'common.rename': 'Renommer',
    'common.hide': 'Masquer',
    'common.show': 'Afficher',
    'common.hidden': 'caché',
    'common.lessons': 'leçons',
    'brand.name': 'GeberLMS',
    'brand.tagline': 'Learning Management System — Helveticore OÜ',
    'lang.label': 'Langue',
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'lang.de': 'Deutsch',
    'nav.catalog': 'Catalogue',
    'nav.logout': 'Déconnexion',
    'login.title': 'Connexion',
    'login.submit': 'Se connecter',
    'learner.title': 'Mes cours',
    'learner.noCourses': 'Aucun cours inscrit.',
    'learner.submitQuiz': 'Valider le quiz',
    'learner.emptyQuiz': 'Quiz sans question.',
    'learner.markDone': 'Marquer terminée',
    'learner.myDocs': 'Mes documents',
    'learner.file': 'Fichier',
    'learner.lessonOptional': 'Leçon (optionnel)',
    'learner.none': '— aucune —',
    'learner.upload': 'Déposer',
    'learner.noDocs': 'Aucun document déposé.',
    'learner.quizResult': 'Quiz corrigé : {correct}/{total} bonnes réponses — {percentage} %.',
    'learner.uploaded': 'Document déposé.',
    'learner.progressSaved': 'Progression enregistrée.',
    'tutor.title': 'Tableau de bord tuteur',
    'tutor.noLearners': 'Aucun apprenant financé.',
    'users.title': 'Créer un compte',
    'users.role': 'Rôle',
    'users.learner': 'Apprenant',
    'users.tutor': 'Tuteur',
    'users.selfPayer': 'Auto-payeur',
    'users.created': 'Compte créé.',
    'coupons.title': 'Coupons',
    'coupons.new': 'Nouveau coupon',
    'coupons.code': 'Code',
    'coupons.type': 'Type',
    'coupons.percent': '%',
    'coupons.amount': 'montant',
    'coupons.value': 'Valeur',
    'coupons.expiration': 'Expiration',
    'coupons.maxUses': 'Utilisations max',
    'coupons.existing': 'Existants',
    'coupons.none': 'Aucun coupon.',
    'coupons.disabled': 'désactivé',
    'coupons.uses': 'utilisations',
    'coupons.expires': 'expire le {date}',
    'enroll.title': 'Inscrire un apprenant à un cours',
    'enroll.email': 'Email apprenant',
    'enroll.course': 'Cours',
    'enroll.coupon': 'Coupon (optionnel)',
    'enroll.submit': 'Inscrire',
    'enroll.created': 'Inscription créée — total {amount} €.',
    'payments.title': 'Inscriptions & paiements',
    'payments.none': 'Aucune inscription.',
    'payments.markPaid': 'Marquer payé (Payoneer)',
    'payments.confirmed': 'Paiement confirmé — facture {number}.',
    'quizzes.title': 'Questions de quiz',
    'quizzes.noLessons': 'Aucune leçon de type quiz.',
    'quizzes.topic': 'Sujet',
    'quizzes.count': 'Nombre',
    'quizzes.generate': 'Générer (IA)',
    'quizzes.addQuestion': 'Ajouter une question',
    'quizzes.prompt': 'Énoncé',
    'quizzes.choices': 'Choix (un par ligne)',
    'quizzes.correctIndex': 'Index bonne réponse (0 = premier)',
    'quizzes.points': 'Points',
    'quizzes.add': 'Ajouter',
    'quizzes.none': 'Aucune question.',
    'quizzes.answer': 'réponse {index}',
    'quizzes.generated': '{count} question(s) générée(s).',
    'courses.title': 'Gestion du catalogue',
    'courses.new': 'Nouveau cours',
    'courses.slug': 'Slug',
    'courses.language': 'Langue',
    'courses.price': 'Prix (centimes)',
    'courses.modules': 'Modules',
    'courses.moduleTitle': 'Titre du module',
    'courses.addModule': 'Ajouter un module',
    'courses.lessonTitle': 'Titre de la leçon',
    'courses.addLesson': 'Ajouter une leçon',
    'courses.resourceTitle': 'Titre de la ressource',
    'courses.addResource': 'Ajouter une ressource',
    'status.not_started': 'Non commencé',
    'status.in_progress': 'En cours',
    'status.completed': 'Terminé',
    'status.pending': 'En attente',
    'status.active': 'Actif',
    'status.expired': 'Expiré',
    'status.revoked': 'Révoqué',
  },
  en: {
    'common.email': 'Email',
    'common.name': 'Name',
    'common.password': 'Password',
    'common.title': 'Title',
    'common.create': 'Create',
    'common.delete': 'Delete',
    'common.rename': 'Rename',
    'common.hide': 'Hide',
    'common.show': 'Show',
    'common.hidden': 'hidden',
    'common.lessons': 'lessons',
    'brand.name': 'GeberLMS',
    'brand.tagline': 'Learning Management System — Helveticore OÜ',
    'lang.label': 'Language',
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'lang.de': 'Deutsch',
    'nav.catalog': 'Catalog',
    'nav.logout': 'Log out',
    'login.title': 'Login',
    'login.submit': 'Log in',
    'learner.title': 'My courses',
    'learner.noCourses': 'No courses enrolled.',
    'learner.submitQuiz': 'Submit quiz',
    'learner.emptyQuiz': 'Quiz with no questions.',
    'learner.markDone': 'Mark complete',
    'learner.myDocs': 'My documents',
    'learner.file': 'File',
    'learner.lessonOptional': 'Lesson (optional)',
    'learner.none': '— none —',
    'learner.upload': 'Upload',
    'learner.noDocs': 'No documents uploaded.',
    'learner.quizResult': 'Quiz graded: {correct}/{total} correct — {percentage} %.',
    'learner.uploaded': 'Document uploaded.',
    'learner.progressSaved': 'Progress saved.',
    'tutor.title': 'Tutor dashboard',
    'tutor.noLearners': 'No funded learners.',
    'users.title': 'Create account',
    'users.role': 'Role',
    'users.learner': 'Learner',
    'users.tutor': 'Tutor',
    'users.selfPayer': 'Self-payer',
    'users.created': 'Account created.',
    'coupons.title': 'Coupons',
    'coupons.new': 'New coupon',
    'coupons.code': 'Code',
    'coupons.type': 'Type',
    'coupons.percent': '%',
    'coupons.amount': 'amount',
    'coupons.value': 'Value',
    'coupons.expiration': 'Expiry',
    'coupons.maxUses': 'Max uses',
    'coupons.existing': 'Existing',
    'coupons.none': 'No coupons.',
    'coupons.disabled': 'disabled',
    'coupons.uses': 'uses',
    'coupons.expires': 'expires {date}',
    'enroll.title': 'Enroll a learner in a course',
    'enroll.email': 'Learner email',
    'enroll.course': 'Course',
    'enroll.coupon': 'Coupon (optional)',
    'enroll.submit': 'Enroll',
    'enroll.created': 'Enrollment created — total {amount} €.',
    'payments.title': 'Enrollments & payments',
    'payments.none': 'No enrollments.',
    'payments.markPaid': 'Mark paid (Payoneer)',
    'payments.confirmed': 'Payment confirmed — invoice {number}.',
    'quizzes.title': 'Quiz questions',
    'quizzes.noLessons': 'No quiz-type lessons.',
    'quizzes.topic': 'Topic',
    'quizzes.count': 'Count',
    'quizzes.generate': 'Generate (AI)',
    'quizzes.addQuestion': 'Add question',
    'quizzes.prompt': 'Prompt',
    'quizzes.choices': 'Choices (one per line)',
    'quizzes.correctIndex': 'Correct answer index (0 = first)',
    'quizzes.points': 'Points',
    'quizzes.add': 'Add',
    'quizzes.none': 'No questions.',
    'quizzes.answer': 'answer {index}',
    'quizzes.generated': '{count} question(s) generated.',
    'courses.title': 'Catalog management',
    'courses.new': 'New course',
    'courses.slug': 'Slug',
    'courses.language': 'Language',
    'courses.price': 'Price (cents)',
    'courses.modules': 'Modules',
    'courses.moduleTitle': 'Module title',
    'courses.addModule': 'Add module',
    'courses.lessonTitle': 'Lesson title',
    'courses.addLesson': 'Add lesson',
    'courses.resourceTitle': 'Resource title',
    'courses.addResource': 'Add resource',
    'status.not_started': 'Not started',
    'status.in_progress': 'In progress',
    'status.completed': 'Completed',
    'status.pending': 'Pending',
    'status.active': 'Active',
    'status.expired': 'Expired',
    'status.revoked': 'Revoked',
  },
  ar: {
    'common.email': 'البريد الإلكتروني',
    'common.name': 'الاسم',
    'common.password': 'كلمة المرور',
    'common.title': 'العنوان',
    'common.create': 'إنشاء',
    'common.delete': 'حذف',
    'common.rename': 'إعادة تسمية',
    'common.hide': 'إخفاء',
    'common.show': 'إظهار',
    'common.hidden': 'مخفي',
    'common.lessons': 'دروس',
    'brand.name': 'GeberLMS',
    'brand.tagline': 'Learning Management System — Helveticore OÜ',
    'lang.label': 'اللغة',
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'lang.de': 'Deutsch',
    'nav.catalog': 'الفهرس',
    'nav.logout': 'تسجيل الخروج',
    'login.title': 'تسجيل الدخول',
    'login.submit': 'تسجيل الدخول',
    'learner.title': 'دوراتي',
    'learner.noCourses': 'لا توجد دورات مسجلة.',
    'learner.submitQuiz': 'إرسال الاختبار',
    'learner.emptyQuiz': 'اختبار بدون أسئلة.',
    'learner.markDone': 'تعليم كمكتمل',
    'learner.myDocs': 'مستنداتي',
    'learner.file': 'ملف',
    'learner.lessonOptional': 'الدرس (اختياري)',
    'learner.none': '— لا شيء —',
    'learner.upload': 'رفع',
    'learner.noDocs': 'لم يتم رفع أي مستند.',
    'learner.quizResult': 'تم تصحيح الاختبار: {correct}/{total} إجابات صحيحة — {percentage} %.',
    'learner.uploaded': 'تم رفع المستند.',
    'learner.progressSaved': 'تم حفظ التقدم.',
    'tutor.title': 'لوحة تحكم المعلم',
    'tutor.noLearners': 'لا يوجد متعلمون ممولون.',
    'users.title': 'إنشاء حساب',
    'users.role': 'الدور',
    'users.learner': 'متعلم',
    'users.tutor': 'معلم',
    'users.selfPayer': 'دافع ذاتي',
    'users.created': 'تم إنشاء الحساب.',
    'coupons.title': 'الكوبونات',
    'coupons.new': 'كوبون جديد',
    'coupons.code': 'الرمز',
    'coupons.type': 'النوع',
    'coupons.percent': '%',
    'coupons.amount': 'مبلغ',
    'coupons.value': 'القيمة',
    'coupons.expiration': 'تاريخ الانتهاء',
    'coupons.maxUses': 'أقصى عدد للاستخدام',
    'coupons.existing': 'الحالية',
    'coupons.none': 'لا توجد كوبونات.',
    'coupons.disabled': 'معطل',
    'coupons.uses': 'استخدامات',
    'coupons.expires': 'ينتهي في {date}',
    'enroll.title': 'تسجيل متعلم في دورة',
    'enroll.email': 'البريد الإلكتروني للمتعلم',
    'enroll.course': 'الدورة',
    'enroll.coupon': 'كوبون (اختياري)',
    'enroll.submit': 'تسجيل',
    'enroll.created': 'تم إنشاء التسجيل — الإجمالي {amount} €.',
    'payments.title': 'التسجيلات والمدفوعات',
    'payments.none': 'لا توجد تسجيلات.',
    'payments.markPaid': 'تعليم كمدفوع (Payoneer)',
    'payments.confirmed': 'تم تأكيد الدفع — فاتورة {number}.',
    'quizzes.title': 'أسئلة الاختبار',
    'quizzes.noLessons': 'لا توجد دروس من نوع اختبار.',
    'quizzes.topic': 'الموضوع',
    'quizzes.count': 'العدد',
    'quizzes.generate': 'توليد (ذكاء اصطناعي)',
    'quizzes.addQuestion': 'إضافة سؤال',
    'quizzes.prompt': 'نص السؤال',
    'quizzes.choices': 'الخيارات (واحد في كل سطر)',
    'quizzes.correctIndex': 'فهرس الإجابة الصحيحة (0 = الأولى)',
    'quizzes.points': 'النقاط',
    'quizzes.add': 'إضافة',
    'quizzes.none': 'لا توجد أسئلة.',
    'quizzes.answer': 'الإجابة {index}',
    'quizzes.generated': 'تم توليد {count} سؤال.',
    'courses.title': 'إدارة الكتالوج',
    'courses.new': 'دورة جديدة',
    'courses.slug': 'Slug',
    'courses.language': 'اللغة',
    'courses.price': 'السعر (سنتات)',
    'courses.modules': 'الوحدات',
    'courses.moduleTitle': 'عنوان الوحدة',
    'courses.addModule': 'إضافة وحدة',
    'courses.lessonTitle': 'عنوان الدرس',
    'courses.addLesson': 'إضافة درس',
    'courses.resourceTitle': 'عنوان المصدر',
    'courses.addResource': 'إضافة مصدر',
    'status.not_started': 'لم يبدأ',
    'status.in_progress': 'قيد التقدم',
    'status.completed': 'مكتمل',
    'status.pending': 'معلق',
    'status.active': 'نشط',
    'status.expired': 'منتهي',
    'status.revoked': 'ملغى',
  },
  de: {
    'common.email': 'E-Mail',
    'common.name': 'Name',
    'common.password': 'Passwort',
    'common.title': 'Titel',
    'common.create': 'Erstellen',
    'common.delete': 'Löschen',
    'common.rename': 'Umbenennen',
    'common.hide': 'Ausblenden',
    'common.show': 'Anzeigen',
    'common.hidden': 'ausgeblendet',
    'common.lessons': 'Lektionen',
    'brand.name': 'GeberLMS',
    'brand.tagline': 'Learning Management System — Helveticore OÜ',
    'lang.label': 'Sprache',
    'lang.fr': 'Français',
    'lang.en': 'English',
    'lang.ar': 'العربية',
    'lang.de': 'Deutsch',
    'nav.catalog': 'Katalog',
    'nav.logout': 'Abmelden',
    'login.title': 'Anmeldung',
    'login.submit': 'Anmelden',
    'learner.title': 'Meine Kurse',
    'learner.noCourses': 'Keine Kurse eingeschrieben.',
    'learner.submitQuiz': 'Quiz abschicken',
    'learner.emptyQuiz': 'Quiz ohne Fragen.',
    'learner.markDone': 'Als erledigt markieren',
    'learner.myDocs': 'Meine Dokumente',
    'learner.file': 'Datei',
    'learner.lessonOptional': 'Lektion (optional)',
    'learner.none': '— keine —',
    'learner.upload': 'Hochladen',
    'learner.noDocs': 'Keine Dokumente hochgeladen.',
    'learner.quizResult': 'Quiz ausgewertet: {correct}/{total} richtig — {percentage} %.',
    'learner.uploaded': 'Dokument hochgeladen.',
    'learner.progressSaved': 'Fortschritt gespeichert.',
    'tutor.title': 'Tutor-Dashboard',
    'tutor.noLearners': 'Keine finanzierten Lernenden.',
    'users.title': 'Konto erstellen',
    'users.role': 'Rolle',
    'users.learner': 'Lernender',
    'users.tutor': 'Tutor',
    'users.selfPayer': 'Selbstzahler',
    'users.created': 'Konto erstellt.',
    'coupons.title': 'Gutscheine',
    'coupons.new': 'Neuer Gutschein',
    'coupons.code': 'Code',
    'coupons.type': 'Typ',
    'coupons.percent': '%',
    'coupons.amount': 'Betrag',
    'coupons.value': 'Wert',
    'coupons.expiration': 'Ablauf',
    'coupons.maxUses': 'Max. Verwendungen',
    'coupons.existing': 'Vorhanden',
    'coupons.none': 'Keine Gutscheine.',
    'coupons.disabled': 'deaktiviert',
    'coupons.uses': 'Verwendungen',
    'coupons.expires': 'läuft am {date} ab',
    'enroll.title': 'Lernenden für einen Kurs einschreiben',
    'enroll.email': 'E-Mail des Lernenden',
    'enroll.course': 'Kurs',
    'enroll.coupon': 'Gutschein (optional)',
    'enroll.submit': 'Einschreiben',
    'enroll.created': 'Einschreibung erstellt — gesamt {amount} €.',
    'payments.title': 'Einschreibungen & Zahlungen',
    'payments.none': 'Keine Einschreibungen.',
    'payments.markPaid': 'Als bezahlt markieren (Payoneer)',
    'payments.confirmed': 'Zahlung bestätigt — Rechnung {number}.',
    'quizzes.title': 'Quizfragen',
    'quizzes.noLessons': 'Keine Lektion vom Typ Quiz.',
    'quizzes.topic': 'Thema',
    'quizzes.count': 'Anzahl',
    'quizzes.generate': 'Generieren (KI)',
    'quizzes.addQuestion': 'Frage hinzufügen',
    'quizzes.prompt': 'Fragestellung',
    'quizzes.choices': 'Antworten (eine pro Zeile)',
    'quizzes.correctIndex': 'Index der richtigen Antwort (0 = erste)',
    'quizzes.points': 'Punkte',
    'quizzes.add': 'Hinzufügen',
    'quizzes.none': 'Keine Fragen.',
    'quizzes.answer': 'Antwort {index}',
    'quizzes.generated': '{count} Frage(n) generiert.',
    'courses.title': 'Katalogverwaltung',
    'courses.new': 'Neuer Kurs',
    'courses.slug': 'Slug',
    'courses.language': 'Sprache',
    'courses.price': 'Preis (Cent)',
    'courses.modules': 'Module',
    'courses.moduleTitle': 'Modultitel',
    'courses.addModule': 'Modul hinzufügen',
    'courses.lessonTitle': 'Lektionstitel',
    'courses.addLesson': 'Lektion hinzufügen',
    'courses.resourceTitle': 'Ressourcentitel',
    'courses.addResource': 'Ressource hinzufügen',
    'status.not_started': 'Nicht begonnen',
    'status.in_progress': 'In Bearbeitung',
    'status.completed': 'Abgeschlossen',
    'status.pending': 'Ausstehend',
    'status.active': 'Aktiv',
    'status.expired': 'Abgelaufen',
    'status.revoked': 'Widerrufen',
  },
};
