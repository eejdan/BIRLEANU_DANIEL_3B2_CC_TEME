import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppHeader } from './lib/AppHeader';
import { AnalyticsChartCard } from './lib/AnalyticsChartCard';
import { AnalyticsFocusScore } from './lib/AnalyticsFocusScore';
import { AnalyticsInsightCard } from './lib/AnalyticsInsightCard';
import { AnalyticsMetricCard } from './lib/AnalyticsMetricCard';
import { AnalyticsSummaryCards } from './lib/AnalyticsSummaryCards';
import { AnalyticsTitle } from './lib/AnalyticsTitle';
import { AuthScreen } from './lib/AuthScreen';
import {
  authenticateUser,
  createFreeUser,
  getInitials,
  initialUsersCsv,
  parseUsersCsv,
  usersToCsv
} from './lib/authCsv';
import { BottomNav } from './lib/BottomNav';
import { CalendarCard } from './lib/CalendarCard';
import { ConfirmDeleteModal } from './lib/ConfirmDeleteModal';
import { DaySchedule } from './lib/DaySchedule';
import { FloatingActionButton } from './lib/FloatingActionButton';
import { FocusTipCard } from './lib/FocusTipCard';
import { FocusLeaderboardModal } from './lib/FocusLeaderboardModal';
import { HomeAnalyticsCard } from './lib/HomeAnalyticsCard';
import { HomeGreetingCard } from './lib/HomeGreetingCard';
import { HobbyPreferencesCard } from './lib/HobbyPreferencesCard';
import { InsightDetailsModal } from './lib/InsightDetailsModal';
import { PremiumBenefitCard } from './lib/PremiumBenefitCard';
import { PremiumHero } from './lib/PremiumHero';
import { PricingPlans } from './lib/PricingPlans';
import { PremiumBanner } from './lib/PremiumBanner';
import { ProfileAccountCard } from './lib/ProfileAccountCard';
import { QuickActions } from './lib/QuickActions';
import { ScheduledTasks } from './lib/ScheduledTasks';
import { SuggestionCard } from './lib/SuggestionCard';
import { TaskInsightCard } from './lib/TaskInsightCard';
import { TaskSection } from './lib/TaskSection';
import { TaskEditorModal } from './lib/TaskEditorModal';
import { PaymentPortalModal, UpgradeConfirmModal } from './lib/UpgradeFlowModals';
import { colors } from './lib/theme';

const authPageData = {
  brand: {
    title: 'FocusFlow',
    subtitle: 'Planifica-ti ziua, protejeaza-ti focusul si lasa algoritmii sa organizeze ce consuma timp.'
  },
  login: {
    eyebrow: 'Bine ai revenit',
    title: 'Autentificare',
    subtitle: 'Accesul la planul free sau premium necesita un cont FocusFlow.',
    emailPlaceholder: 'User sau email',
    passwordPlaceholder: 'Parola',
    cta: 'Intra in cont',
    switchText: 'Nu ai cont?',
    switchAction: 'Creeaza unul'
  },
  signup: {
    eyebrow: 'Start inteligent',
    title: 'Creeaza cont',
    subtitle: 'Contul free include taskuri pe zile, calcul dimineata pentru tranzit si reclame.',
    namePlaceholder: 'Nume',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Parola',
    cta: 'Creeaza cont free',
    switchText: 'Ai deja cont?',
    switchAction: 'Autentifica-te'
  },
  highlights: [
    'Calendar si taskuri sincronizate',
    'Upgrade Premium pentru programare automata',
    'Datele raman pregatite pentru integrarea cu backend-ul'
  ]
};

const profilePageData = {
  user: {
    initials: 'AD',
    isPremium: false
  },
  hero: {
    title: 'Treci la Premium',
    subtitle: 'Maximizeaza-ti productivitatea si elimina orice bariera din fluxul tau de lucru.'
  },
  benefits: [
    {
      id: 'no-ads',
      icon: '⊘',
      title: 'Fara Reclame',
      description: 'Concentrare totala, fara intreruperi vizuale sau video pe parcursul sesiunilor de lucru.',
      visual: true,
      tone: 'tertiary'
    },
    {
      id: 'auto-organize',
      icon: '▣',
      title: 'Auto-Organizare',
      description: 'Algoritmi inteligenti care iti aranjeaza automat calendarul si sarcinile pentru eficienta optima.',
      visual: true,
      tone: 'primary'
    },
    {
      id: 'commute-live',
      icon: '▤',
      title: 'Naveta Live',
      description: 'Actualizari in timp real despre transport pentru a ajunge mereu la timp la intalniri.',
      tone: 'secondary'
    },
    {
      id: 'advanced-stats',
      icon: '⌁',
      title: 'Statistici Avansate',
      description: 'Analize profunde ale performantei tale saptamanale cu recomandari personalizate.',
      tone: 'error'
    }
  ],
  pricing: {
    title: 'Alege Planul tau',
    plans: [
      {
        id: 'monthly',
        name: 'Lunar',
        subtitle: 'Flexibilitate maxima',
        price: '29 RON',
        cadence: '/luna',
        features: ['Acces la toate functiile premium', 'Suport prioritar 24/7'],
        cta: 'Alege Plan',
        selected: false
      },
      {
        id: 'yearly',
        name: 'Anual',
        subtitle: 'Economiseste 30%',
        price: '249 RON',
        cadence: '/an',
        badge: 'Recomandat',
        features: ['Toate functiile Premium', '2 luni gratuite incluse', 'Teme exclusive Dark Mode'],
        cta: 'Alege Plan',
        selected: true
      }
    ],
    footer: 'Anuleaza oricand. Toate tranzactiile sunt securizate.'
  },
  productRules: {
    free: {
      ads: true,
      premiumCta: 'Free include reclame si limite pentru programarea automata.'
    },
    premium: {
      ads: false,
      premiumCta: 'Premium este fara reclame si deblocheaza automatizarea completa.'
    }
  }
};

const hobbyGroups = [
  {
    id: 'sports',
    title: 'Sporturi',
    items: [
      { id: 'running', label: 'Alergat', taskTitle: 'Alergare usoara', durationMinutes: 45 },
      { id: 'cycling', label: 'Ciclism', taskTitle: 'Tura scurta cu bicicleta', durationMinutes: 60 },
      { id: 'fitness', label: 'Fitness', taskTitle: 'Antrenament la sala', durationMinutes: 50 },
      { id: 'swimming', label: 'Inot', taskTitle: 'Sesiune de inot', durationMinutes: 45 },
      { id: 'yoga', label: 'Yoga', taskTitle: 'Yoga si stretching', durationMinutes: 30 }
    ]
  },
  {
    id: 'reading',
    title: 'Citit',
    items: [
      { id: 'fiction', label: 'Fictiune', taskTitle: 'Citit roman de fictiune', durationMinutes: 40 },
      { id: 'personal-growth', label: 'Dezvoltare personala', taskTitle: 'Citit dezvoltare personala', durationMinutes: 35 },
      { id: 'history', label: 'Istorie', taskTitle: 'Citit carte de istorie', durationMinutes: 40 },
      { id: 'technology', label: 'Tehnologie', taskTitle: 'Citit despre tehnologie', durationMinutes: 35 }
    ]
  },
  {
    id: 'outdoors',
    title: 'Plimbari',
    items: [
      { id: 'park-walk', label: 'Plimbare in parc', taskTitle: 'Plimbare in parc', durationMinutes: 35 },
      { id: 'city-walk', label: 'Explorare oras', taskTitle: 'Plimbare prin oras', durationMinutes: 45 },
      { id: 'nature-walk', label: 'Natura', taskTitle: 'Plimbare in natura', durationMinutes: 60 }
    ]
  },
  {
    id: 'creative',
    title: 'Creative',
    items: [
      { id: 'drawing', label: 'Desen', taskTitle: 'Sesiune de desen', durationMinutes: 40 },
      { id: 'music', label: 'Muzica', taskTitle: 'Exersat muzica', durationMinutes: 45 },
      { id: 'cooking', label: 'Gatit', taskTitle: 'Gatit ceva nou', durationMinutes: 60 },
      { id: 'photography', label: 'Fotografie', taskTitle: 'Iesire foto', durationMinutes: 50 }
    ]
  }
];

const hobbyLookup = hobbyGroups.reduce((acc, group) => {
  group.items.forEach((item) => {
    acc[item.id] = { ...item, groupId: group.id, groupTitle: group.title };
  });
  return acc;
}, {});

const mockFocusLeaderboard = [
  { name: 'Mara Ionescu', email: 'mara@focusflow.app', averageFocusScore: 94, completed: 68, total: 72 },
  { name: 'Vlad Popa', email: 'vlad@focusflow.app', averageFocusScore: 91, completed: 61, total: 68 },
  { name: 'Irina Stan', email: 'irina@focusflow.app', averageFocusScore: 89, completed: 57, total: 64 },
  { name: 'Radu Marin', email: 'radu@focusflow.app', averageFocusScore: 86, completed: 52, total: 61 },
  { name: 'Elena Dima', email: 'elena@focusflow.app', averageFocusScore: 83, completed: 49, total: 60 },
  { name: 'Tudor Ene', email: 'tudor@focusflow.app', averageFocusScore: 81, completed: 46, total: 57 },
  { name: 'Ioana Matei', email: 'ioana@focusflow.app', averageFocusScore: 78, completed: 43, total: 55 },
  { name: 'Alex Nica', email: 'alex@focusflow.app', averageFocusScore: 75, completed: 40, total: 53 },
  { name: 'Daria Luca', email: 'daria@focusflow.app', averageFocusScore: 72, completed: 38, total: 52 }
];

const analyticsPageData = {
  user: {
    initials: 'AD',
    isPremium: false
  },
  title: 'Analiza Productivitate',
  subtitle: 'Performanta ta in saptamana 12 - 18 Iunie',
  focusScore: {
    label: 'Focus Score',
    score: 87,
    change: '+5%',
    progress: 87,
    description: 'Esti in top 10% dintre utilizatori saptamana aceasta.'
  },
  timeDistribution: {
    title: 'Distributia Timpului',
    period: 'Saptamanal',
    days: [
      { label: 'Lun', value: 70 },
      { label: 'Mar', value: 85 },
      { label: 'Mie', value: 90 },
      { label: 'Joi', value: 95 },
      { label: 'Vin', value: 65 },
      { label: 'Sam', value: 40 },
      { label: 'Dum', value: 30 }
    ]
  },
  commute: {
    icon: '▰',
    label: 'Smart Commute',
    value: '3h 45m',
    trend: '-15% vs sapt. trecuta',
    description: 'Timp economisit prin optimizarea rutei.',
    accent: 'tertiary'
  },
  completion: {
    label: 'Task-uri Finalizate',
    value: '46 / 50 obiective',
    percent: 92,
    status: 'Performanta excelenta',
    accent: 'success'
  },
  weeklyInsight: {
    title: 'Insight of the Week',
    text: 'Esti cu 24% mai productiv in intervalul 09:00 - 11:00. Incearca sa programezi sarcinile cele mai dificile in aceasta fereastra de timp pentru rezultate optime.',
    cta: 'Vezi detalii'
  },
  recentSessions: {
    title: 'Sesiuni Recente de Focus',
    items: [
      {
        id: 'ui-modules',
        icon: '<>',
        title: 'Dezvoltare Module UI',
        subtitle: 'Azi, 10:30 - 12:00',
        duration: '90 min',
        type: 'Deep Work',
        tone: 'blue'
      },
      {
        id: 'email-review',
        icon: '✉',
        title: 'Review Email-uri & Comunicare',
        subtitle: 'Azi, 08:00 - 08:45',
        duration: '45 min',
        type: 'Shallow Work',
        tone: 'amber'
      }
    ]
  },
  productRules: {
    free: {
      analytics: 'Utilizatorii free vad sumarul saptamanal si recomandarile generale.',
      ads: true
    },
    premium: {
      analytics: 'Premium deblocheaza insight-uri avansate, predictii si rapoarte fara reclame.',
      ads: false
    }
  }
};

const homePageData = {
  user: {
    name: 'Alex',
    initials: 'AD',
    isPremium: false
  },
  overview: {
    greeting: 'Buna dimineata, Alex.',
    subtitle: 'Esti gata pentru o zi productiva? Iata starea actuala.',
    metrics: [
      {
        id: 'weather',
        label: 'Bucuresti',
        value: '22°C',
        icon: '☼',
        tone: 'primary'
      },
      {
        id: 'commute',
        label: 'Naveta',
        value: '18 min',
        icon: '▰',
        tone: 'tertiary'
      }
    ]
  },
  smartAlarm: {
    title: 'Alarma Smart',
    description: 'Activata pentru 07:30. Detectarea fazei de somn activa.',
    enabled: true,
    sleepStatusLabel: 'Status Somn',
    sleepQuality: 84
  },
  schedule: {
    title: 'Ziua Mea (Program)',
    action: 'Adauga Eveniment',
    items: [
      {
        id: 'atlas',
        time: '09:30 - 10:30',
        title: 'Sedinta Proiect Atlas',
        description: 'Sincronizare saptamanala cu echipa de dezvoltare.',
        icon: '♙',
        tone: 'primary'
      },
      {
        id: 'q3-report',
        time: '11:00 - 12:30',
        title: 'Finalizare Raport Q3',
        description: 'Revizuirea cifrelor finale pentru prezentarea board-ului.',
        icon: '▤',
        tone: 'muted'
      },
      {
        id: 'lunch',
        time: '13:00 - 14:00',
        title: 'Pranz cu Echipa',
        description: 'Socializare la Bistro Central.',
        icon: '♨',
        tone: 'tertiary'
      },
      {
        id: 'deep-work',
        time: '14:30 - 17:00',
        title: 'Deep Work: Design UI',
        description: 'Focalizare maxima pe noile prototipuri FocusFlow.',
        icon: '✦',
        tone: 'focus',
        status: 'Mod focus activat',
        premiumOnly: true
      }
    ]
  },
  analytics: {
    title: 'Analitice',
    rows: [
      {
        id: 'focus',
        label: 'Focus Astazi',
        value: '5.2 ore',
        percent: 65,
        tone: 'primary'
      },
      {
        id: 'tasks',
        label: 'Sarcini Finalizate',
        value: '8/12',
        percent: 75,
        tone: 'tertiary'
      }
    ]
  },
  focusTip: {
    title: 'Sfatul Focus',
    text: '"Incearca tehnica Pomodoro pentru sarcina Design UI de la 14:30 pentru a mentine un ritm constant."'
  },
  quickActions: [
    {
      id: 'timer',
      title: 'Start Timer',
      icon: '⏱'
    },
    {
      id: 'note',
      title: 'Nota Rapida',
      icon: '▣'
    }
  ],
  productRules: {
    free: {
      transit: 'Tranzitul este calculat dimineata pentru utilizatorii free.',
      tasks: 'Taskurile free pot fi atasate zilei, fara ora si durata estimata.',
      ads: true
    },
    premium: {
      transit: 'Premium permite recalcularea tranzitului pe parcursul zilei.',
      tasks: 'Premium permite ora, durata estimata si programare automata.',
      ads: false
    }
  }
};

const calendarPageData = {
  user: {
    name: 'Daniel',
    initials: 'AD',
    plan: 'free',
    isPremium: false
  },
  calendar: {
    monthLabel: 'Octombrie 2023',
    selectedDay: 12,
    weekDays: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'],
    days: [
      { value: 25, muted: true },
      { value: 26, muted: true },
      { value: 27, muted: true },
      { value: 28, muted: true },
      { value: 29, muted: true },
      { value: 30, muted: true },
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10 },
      { value: 11 },
      { value: 12, selected: true },
      { value: 13 },
      { value: 14 },
      { value: 15 },
      { value: 16 },
      { value: 17 },
      { value: 18 },
      { value: 19 },
      { value: 20 },
      { value: 21 },
      { value: 22 }
    ]
  },
  suggestion: {
    label: 'Sugestie timp liber',
    message: 'Ai un interval liber de 2 ore intre ora 14:00 si 16:00.',
    actionTitle: 'Sesiune scurta de sport sau Yoga?',
    cta: 'Programeaza acum',
    premiumOnlyNote: 'Programarea automata pe ore si estimarea duratei sunt disponibile pentru Premium.'
  },
  rules: {
    free: {
      transit: 'Tranzitul se recalculeaza o data dimineata.',
      tasks: 'Taskurile sunt evenimente neprogramate, doar pe zile.',
      ads: true
    },
    premium: {
      transit: 'Tranzitul se poate recalcula in timpul zilei.',
      tasks: 'Taskurile pot avea ora, durata estimata si programare automata.',
      ads: false
    }
  },
  timeline: [
    {
      id: 'morning',
      time: '08:00 - 09:00',
      title: 'Meditatie & Cafea',
      description: 'Rutina de dimineata pentru claritate mentala.',
      category: 'Personal',
      type: 'personal'
    },
    {
      id: 'transit',
      time: '09:00 - 09:30',
      title: 'Tranzit',
      description: 'Deplasare catre birou',
      type: 'transit'
    },
    {
      id: 'focus',
      time: '09:30 - 13:00',
      title: 'Design UI - FocusFlow App',
      description: 'Focus profund pe sistemul de design si prototiparea cronologiei.',
      type: 'focus',
      people: ['D', 'A', '+2']
    },
    {
      id: 'review',
      time: '14:00 - 15:30',
      title: 'Review Sprint Q4',
      description: 'Analiza performantei ultimului trimestru si planificare obiective.',
      type: 'meeting',
      location: 'Sala de conferinte B',
      link: 'G-Meet'
    }
  ]
};

const tasksPageData = {
  user: {
    initials: 'AD',
    isPremium: false
  },
  insight: {
    progress: 65,
    title: 'Insight Zilnic',
    description:
      'Esti pe drumul cel bun! Ai finalizat majoritatea sarcinilor de mare prioritate. Concentreaza-te pe ultimele doua task-uri pentru a atinge starea de "Deep Flow" inainte de finalul zilei.',
    signal: 'Productivitate ridicata'
  },
  premium: {
    eyebrow: 'Premium AI',
    title: 'Automatizeaza fluxul tau de lucru',
    description: 'Deblocheaza prioritizarea inteligenta si rezumatele automate ale sedintelor.',
    cta: 'Upgrade Acum'
  },
  productRules: {
    free: {
      taskScheduling: 'Taskurile free raman neprogramate pe ore si pot fi atasate unei zile.',
      ads: true
    },
    premium: {
      taskScheduling: 'Premium permite ora, durata estimata si programare automata.',
      ads: false
    }
  },
  sections: [
    {
      id: 'today',
      title: 'Azi',
      accent: 'primary',
      count: 4,
      action: 'Vezi tot',
      layout: 'cards',
      tasks: [
        {
          id: 'dashboard',
          title: 'Finalizare Proiect Dashboard',
          label: 'Focus',
          priority: 'focus',
          time: '14:00',
          subtasks: '12 sub-taskuri'
        },
        {
          id: 'auth-review',
          title: 'Review Cod - Modul Autentificare',
          label: 'Urgent',
          priority: 'urgent',
          time: '16:30'
        },
        {
          id: 'design-sync',
          title: 'Sincronizare Echipa Design',
          label: 'Terminat',
          priority: 'done',
          completedAt: 'Finalizat la 09:30'
        }
      ]
    },
    {
      id: 'week',
      title: 'Saptamana aceasta',
      accent: 'tertiary',
      layout: 'compact',
      tasks: [
        {
          id: 'q3-report',
          title: 'Raport trimestrial Q3',
          subtitle: 'Vineri, 24 Octombrie',
          icon: '▣',
          people: ['D', 'A', '+3']
        }
      ]
    },
    {
      id: 'backlog',
      title: 'Fara data',
      accent: 'outline',
      layout: 'plain',
      tasks: [
        {
          id: 'api-docs',
          title: 'Actualizare documentatie API',
          subtitle: 'Idee de task pentru backlog'
        },
        {
          id: 'ui-research',
          title: 'Cercetare noi framework-uri UI',
          subtitle: 'Explorare pentru proiectul de anul viitor'
        }
      ]
    }
  ]
};

const navItems = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'calendar', label: 'Calendar', icon: '□' },
  { key: 'tasks', label: 'Tasks', icon: '✓' },
  { key: 'analytics', label: 'Analytics', icon: '▥' },
  { key: 'profile', label: 'Profile', icon: '♙' }
];

const monthNames = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie'
];

const initialScheduledTasks = [
  {
    id: 'scheduled-atlas',
    title: 'Sedinta Proiect Atlas',
    description: 'Sincronizare saptamanala cu echipa de dezvoltare.',
    date: '2023-10-12',
    startTime: '09:30',
    endTime: '10:30',
    location: 'G-Meet',
    locationCoords: { lat: 44.4397, lng: 26.0963 },
    label: 'Focus',
    importance: 'medium'
  },
  {
    id: 'scheduled-q3',
    title: 'Finalizare Raport Q3',
    description: 'Revizuirea cifrelor finale pentru prezentarea board-ului.',
    date: '2023-10-12',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Birou',
    locationCoords: { lat: 44.4268, lng: 26.1025 },
    label: 'Raport',
    importance: 'high'
  },
  {
    id: 'scheduled-lunch',
    title: 'Pranz cu Echipa',
    description: 'Socializare la Bistro Central.',
    date: '2023-10-13',
    startTime: '13:00',
    endTime: '14:00',
    location: 'Bistro Central',
    locationCoords: { lat: 44.4361, lng: 26.1027 },
    label: 'Personal',
    importance: 'low'
  },
  {
    id: 'scheduled-design',
    title: 'Deep Work: Design UI',
    description: 'Focalizare maxima pe noile prototipuri FocusFlow.',
    date: '2023-10-13',
    startTime: '14:30',
    endTime: '17:00',
    location: 'Mod focus',
    locationCoords: { lat: 44.4479, lng: 26.0979 },
    label: 'Focus',
    importance: 'high'
  },
  {
    id: 'scheduled-mon-planning',
    title: 'Planificare sprint',
    description: 'Setare obiective si prioritati pentru saptamana.',
    date: '2023-10-09',
    startTime: '09:00',
    endTime: '10:15',
    location: 'Birou',
    locationCoords: { lat: 44.4268, lng: 26.1025 },
    label: 'Focus',
    importance: 'high',
    completedAt: 'luni'
  },
  {
    id: 'scheduled-mon-admin',
    title: 'Rezolvare documente administrative',
    description: 'Acte, confirmari si emailuri importante.',
    date: '2023-10-09',
    startTime: '12:30',
    endTime: '13:10',
    location: 'Facultate',
    locationCoords: { lat: 44.4359, lng: 26.1025 },
    label: 'Administrativ',
    importance: 'medium'
  },
  {
    id: 'scheduled-tue-study',
    title: 'Invatare React Native',
    description: 'Lucru pe componente responsive si state management.',
    date: '2023-10-10',
    startTime: '08:30',
    endTime: '10:00',
    location: 'Acasa',
    locationCoords: { lat: 44.4107, lng: 26.1121 },
    label: 'Studiu',
    importance: 'high',
    completedAt: 'marti'
  },
  {
    id: 'scheduled-tue-lab',
    title: 'Laborator Cloud Computing',
    description: 'Exercitii pentru proiect si deploy.',
    date: '2023-10-10',
    startTime: '11:15',
    endTime: '13:00',
    location: 'Facultate',
    locationCoords: { lat: 44.4359, lng: 26.1025 },
    label: 'Facultate',
    importance: 'urgent',
    completedAt: 'marti'
  },
  {
    id: 'scheduled-tue-gym',
    title: 'Antrenament seara',
    description: 'Sesiune scurta pentru energie.',
    date: '2023-10-10',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Sala Fitness',
    locationCoords: { lat: 44.4512, lng: 26.0835 },
    label: 'Personal',
    importance: 'low'
  },
  {
    id: 'scheduled-wed-client',
    title: 'Call client prototip',
    description: 'Feedback pe flow-ul premium si calendar.',
    date: '2023-10-11',
    startTime: '10:00',
    endTime: '10:45',
    location: 'G-Meet',
    locationCoords: { lat: 44.4397, lng: 26.0963 },
    label: 'Focus',
    importance: 'medium',
    failedAt: 'miercuri'
  },
  {
    id: 'scheduled-wed-research',
    title: 'Research Google Routes',
    description: 'Documentare despre rute, matrice si costuri API.',
    date: '2023-10-11',
    startTime: '15:00',
    endTime: '16:20',
    location: 'Biblioteca Centrala',
    locationCoords: { lat: 44.4414, lng: 26.0969 },
    label: 'Studiu',
    importance: 'medium',
    completedAt: 'miercuri'
  },
  {
    id: 'scheduled-thu-review',
    title: 'Review cod componente',
    description: 'Curatare UI si validare comportamente.',
    date: '2023-10-12',
    startTime: '16:00',
    endTime: '16:50',
    location: 'Acasa',
    locationCoords: { lat: 44.4107, lng: 26.1121 },
    label: 'Focus',
    importance: 'high'
  },
  {
    id: 'scheduled-thu-reading',
    title: 'Citit notite curs',
    description: 'Recapitulare pentru seminar.',
    date: '2023-10-12',
    startTime: '20:00',
    endTime: '20:40',
    location: 'Acasa',
    locationCoords: { lat: 44.4107, lng: 26.1121 },
    label: 'Studiu',
    importance: 'low'
  },
  {
    id: 'scheduled-fri-demo',
    title: 'Demo aplicatie',
    description: 'Prezentare flow-uri principale.',
    date: '2023-10-13',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Facultate',
    locationCoords: { lat: 44.4359, lng: 26.1025 },
    label: 'Facultate',
    importance: 'urgent'
  },
  {
    id: 'scheduled-fri-fix',
    title: 'Fix bug analytics',
    description: 'Ajustari formule si grafice.',
    date: '2023-10-13',
    startTime: '10:45',
    endTime: '12:00',
    location: 'Birou',
    locationCoords: { lat: 44.4268, lng: 26.1025 },
    label: 'Focus',
    importance: 'high'
  },
  {
    id: 'scheduled-fri-family',
    title: 'Cina familie',
    description: 'Timp personal planificat.',
    date: '2023-10-13',
    startTime: '19:30',
    endTime: '21:00',
    location: 'Restaurant Verde',
    locationCoords: { lat: 44.4598, lng: 26.1102 },
    label: 'Personal',
    importance: 'low'
  },
  {
    id: 'scheduled-sat-cleanup',
    title: 'Cleanup proiect',
    description: 'Organizare fisiere si verificare build.',
    date: '2023-10-14',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Acasa',
    locationCoords: { lat: 44.4107, lng: 26.1121 },
    label: 'Focus',
    importance: 'medium',
    completedAt: 'sambata'
  },
  {
    id: 'scheduled-sat-walk',
    title: 'Plimbare Herastrau',
    description: 'Pauza activa in weekend.',
    date: '2023-10-14',
    startTime: '17:00',
    endTime: '18:10',
    location: 'Parcul Herastrau',
    locationCoords: { lat: 44.4709, lng: 26.0824 },
    label: 'Personal',
    importance: 'low'
  },
  {
    id: 'scheduled-sun-weekly',
    title: 'Retro saptamanal',
    description: 'Ce a mers bine si ce trebuie mutat.',
    date: '2023-10-15',
    startTime: '18:00',
    endTime: '18:45',
    location: 'Acasa',
    locationCoords: { lat: 44.4107, lng: 26.1121 },
    label: 'Personal',
    importance: 'medium'
  }
];

const appToday = '2023-10-12';
const mockMapCenter = { lat: 44.4268, lng: 26.1025 };
const presetLocations = {
  'G-Meet': { lat: 44.4397, lng: 26.0963 },
  Birou: { lat: 44.4268, lng: 26.1025 },
  'Bistro Central': { lat: 44.4361, lng: 26.1027 },
  'Mod focus': { lat: 44.4479, lng: 26.0979 },
  Acasa: { lat: 44.4107, lng: 26.1121 },
  Facultate: { lat: 44.4359, lng: 26.1025 }
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function generateCalendar(monthDate, selectedDate, tasks) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const mondayStartOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayStartOffset);

  return {
    monthLabel: `${monthNames[month]} ${year}`,
    selectedDay: Number(selectedDate.slice(-2)),
    weekDays: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'],
    days: Array.from({ length: 35 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const date = formatDateKey(day);
      return {
        value: day.getDate(),
        date,
        muted: day.getMonth() !== month,
        selected: date === selectedDate,
        hasTasks: tasks.some((task) => task.date === date),
        hasFailed: tasks.some((task) => task.date === date && task.failedAt)
      };
    })
  };
}

function getWeekRange(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: formatDateKey(start), end: formatDateKey(end) };
}

function taskTone(task) {
  if (task.importance === 'urgent') return 'focus';
  if (task.importance === 'high') return 'tertiary';
  if (task.importance === 'low') return 'muted';
  return 'primary';
}

function formatTaskTime(task) {
  if (task.startTime && task.endTime) return `${task.startTime} - ${task.endTime}`;
  if (task.startTime) return task.startTime;
  return 'Pe zi';
}

function timeToMinutesValue(time) {
  if (!time) return 0;
  const [hours = '0', minutes = '0'] = `${time}`.split(':');
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) return 0;
  return parsedHours * 60 + parsedMinutes;
}

function minutesToTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return '00:00';
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours}`.padStart(2, '0') + ':' + `${minutes}`.padStart(2, '0');
}

function hashLocationName(name) {
  return `${name}`.split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 0);
}

function randomCoordsNearCenter(locationName) {
  const hash = hashLocationName(locationName || 'Locatie');
  const radiusKm = 1 + (hash % 5000) / 100;
  const angle = ((hash / 997) % 360) * (Math.PI / 180);
  const latOffset = (radiusKm / 111) * Math.cos(angle);
  const lngOffset = (radiusKm / (111 * Math.cos(mockMapCenter.lat * Math.PI / 180))) * Math.sin(angle);

  return {
    lat: Number((mockMapCenter.lat + latOffset).toFixed(6)),
    lng: Number((mockMapCenter.lng + lngOffset).toFixed(6))
  };
}

function coordsForLocation(locationName) {
  if (!locationName) return null;
  return presetLocations[locationName] || randomCoordsNearCenter(locationName);
}

function enrichTaskLocation(task) {
  const locationCoords = task.locationCoords || coordsForLocation(task.location);

  return {
    ...task,
    locationCoords: locationCoords || null,
    locationUrl: task.locationUrl || (
      locationCoords
        ? `https://www.google.com/maps/search/?api=1&query=${locationCoords.lat},${locationCoords.lng}`
        : ''
    )
  };
}

function haversineKm(origin, destination) {
  if (!origin || !destination) return 0;
  const earthKm = 6371;
  const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
  const dLng = (destination.lng - origin.lng) * (Math.PI / 180);
  const lat1 = origin.lat * (Math.PI / 180);
  const lat2 = destination.lat * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateRouteBetween(previousTask, nextTask) {
  const origin = previousTask.locationCoords || coordsForLocation(previousTask.location);
  const destination = nextTask.locationCoords || coordsForLocation(nextTask.location);
  if (!origin || !destination || !previousTask.endTime || !nextTask.startTime) return null;

  const airKm = haversineKm(origin, destination);
  const roadKm = airKm * 1.35;
  if (roadKm < 0.2) return null;
  const carMinutes = Math.max(6, Math.ceil((roadKm / 28) * 60) + 5);
  const walkingMinutes = Math.max(8, Math.ceil((roadKm / 5) * 60) + 3);
  const nextStartMinutes = timeToMinutesValue(nextTask.startTime);
  const previousEndMinutes = timeToMinutesValue(previousTask.endTime);
  if (nextStartMinutes <= previousEndMinutes) return null;
  const availableMinutes = Math.max(0, nextStartMinutes - previousEndMinutes);
  const isTight = availableMinutes < carMinutes;
  const idealStartMinutes = nextStartMinutes - carMinutes;
  const startMinutes = Math.max(previousEndMinutes, idealStartMinutes);
  const endMinutes = Math.min(startMinutes + carMinutes, nextStartMinutes);
  const walkingEndMinutes = isTight ? nextStartMinutes : startMinutes;
  const walkingStartMinutes = walkingEndMinutes - walkingMinutes;

  const carRoute = {
    id: `route-${previousTask.id}-${nextTask.id}`,
    type: 'route',
    title: `Plecare spre ${nextTask.location}`,
    time: `${minutesToTime(startMinutes)} - ${minutesToTime(endMinutes)}`,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
    status: `${previousTask.location} -> ${nextTask.location} - masina - ${roadKm.toFixed(1)} km - ${carMinutes}m`,
    tone: 'muted',
    icon: '>',
    distanceKm: roadKm,
    durationMinutes: carMinutes,
    availableMinutes,
    isTight,
    travelMode: 'car'
  };

  const walkingRoute = !isTight && walkingStartMinutes >= previousEndMinutes
    ? {
        id: `walk-${previousTask.id}-${nextTask.id}`,
        type: 'route',
        title: `Mers pe jos spre ${nextTask.location}`,
        time: `${minutesToTime(walkingStartMinutes)} - ${minutesToTime(walkingEndMinutes)}`,
        startTime: minutesToTime(walkingStartMinutes),
        endTime: minutesToTime(walkingEndMinutes),
        status: `${previousTask.location} -> ${nextTask.location} - pe jos - ${roadKm.toFixed(1)} km - ${walkingMinutes}m`,
        tone: 'walk',
        icon: 'walk',
        distanceKm: roadKm,
        durationMinutes: walkingMinutes,
        availableMinutes,
        travelMode: 'walk'
      }
    : null;

  return {
    car: isTight ? null : carRoute,
    walk: walkingRoute,
    warning: isTight
      ? {
          requiredMinutes: carMinutes,
          availableMinutes
        }
      : null,
    durationMinutes: carRoute.durationMinutes,
    availableMinutes: carRoute.availableMinutes,
    isTight: carRoute.isTight
  };
}

function buildPremiumTimelineItems(tasks) {
  const timedTasks = tasks.filter((task) => task.startTime);
  const untimedTasks = tasks.filter((task) => !task.startTime);
  const sortedTasks = timedTasks
    .map(enrichTaskLocation)
    .sort((a, b) => timeToMinutesValue(a.startTime) - timeToMinutesValue(b.startTime));
  const items = [];

  sortedTasks.forEach((task, index) => {
    let taskForTimeline = task;

    if (index > 0) {
      const route = estimateRouteBetween(sortedTasks[index - 1], task);
      if (route?.walk) items.push(route.walk);
      if (route?.car) items.push(route.car);
      if (route?.warning) {
        taskForTimeline = {
          ...task,
          travelWarning: route.warning
        };
      }
    }
    items.push(taskToScheduleItem(taskForTimeline));
  });

  return [...items, ...untimedTasks.map((task) => taskToScheduleItem(enrichTaskLocation(task)))];
}

function findTaskScheduleConflict(candidate, tasks, editingTaskId) {
  if (!candidate.startTime || !candidate.endTime) return '';
  const candidateStart = timeToMinutesValue(candidate.startTime);
  const candidateEnd = timeToMinutesValue(candidate.endTime);

  if (candidateEnd <= candidateStart) {
    return 'Ora de final trebuie sa fie dupa ora de inceput.';
  }

  const sameDayTasks = tasks.filter((task) => task.date === candidate.date && task.id !== editingTaskId && task.startTime && task.endTime);
  const overlap = sameDayTasks.find((task) => {
    const start = timeToMinutesValue(task.startTime);
    const end = timeToMinutesValue(task.endTime);
    return candidateStart < end && candidateEnd > start;
  });

  if (overlap) {
    return `Taskul se suprapune cu "${overlap.title}" (${formatTaskTime(overlap)}).`;
  }

  return '';
}

function taskToScheduleItem(task) {
  const dateLabel = task.date === appToday ? '' : `${task.date} - `;

  return {
    id: task.id,
    time: `${dateLabel}${formatTaskTime(task)}`,
    startTime: task.startTime,
    endTime: task.endTime,
    location: task.location,
    locationUrl: task.locationUrl,
    locationCoords: task.locationCoords,
    completedAt: task.completedAt,
    failedAt: task.failedAt,
    travelWarning: task.travelWarning,
    title: task.title,
    description: task.description || [task.label, task.location].filter(Boolean).join(' • '),
    icon: task.importance === 'urgent' ? '!' : task.importance === 'high' ? '*' : '•',
    tone: taskTone(task),
    status: task.completedAt ? `Finalizat ${task.completedAt}` : task.failedAt ? `Ratat ${task.failedAt}` : task.location
  };
}

function taskToSectionTask(task) {
  return {
    ...task,
    priority: task.completedAt ? 'done' : task.failedAt ? 'urgent' : task.importance === 'urgent' ? 'urgent' : 'focus',
    time: formatTaskTime(task),
    subtasks: [task.date, task.location].filter(Boolean).join(' • ')
  };
}

function buildDailyInsight(tasks, dateKey) {
  const todayTasks = tasks.filter((task) => task.date === dateKey);
  const total = todayTasks.length;
  const completed = todayTasks.filter((task) => task.completedAt).length;
  const failed = todayTasks.filter((task) => task.failedAt).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const range = getWeekRange(dateKey);
  const earlyCompleted = tasks.filter((task) => task.date > dateKey && task.date <= range.end && task.completedAt).length;

  let description = 'Adauga taskuri pentru azi si incepe cu unul mic, usor de dus pana la capat.';
  let signal = 'Start pregatit';

  if (total > 0 && progress < 35) {
    description = 'Esti la inceputul zilei. Alege taskul cel mai clar si marcheaza primul progres fara presiune.';
    signal = 'Incalzire buna';
  } else if (progress < 75) {
    description = 'Ai intrat in ritm. Continua cu taskurile importante si lasa cele mici pentru pauzele scurte.';
    signal = 'Ritm stabil';
  } else if (progress < 100) {
    description = 'Mai ai putin pana la final. Inchide ultimele taskuri si ziua ramane curata.';
    signal = 'Aproape gata';
  } else if (total > 0) {
    description = 'Ai finalizat toate taskurile de azi. Excelent, poti folosi restul zilei pentru mentenanta sau odihna.';
    signal = 'Zi finalizata';
  }

  if (failed > 0) {
    description = `${description} Ai ${failed} taskuri ratate care merita reprogramate in calendar.`;
    signal = 'Necesita replanificare';
  }

  if (earlyCompleted > 0) {
    description = `${description} Bonus: ai finalizat anticipat ${earlyCompleted} taskuri din zilele urmatoare si ti-ai eliberat programul.`;
    signal = 'Avans castigat';
  }

  return {
    progress,
    title: 'Insight Zilnic',
    description,
    signal,
    completed,
    total,
    failed,
    earlyCompleted
  };
}

function minutesBetween(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) return 0;
  return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
}

function safePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function filterTasksForAnalyticsPeriod(tasks, period) {
  const today = new Date(`${appToday}T00:00:00`);

  if (period === 'month') {
    const month = today.getMonth();
    const year = today.getFullYear();
    return tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(`${task.date}T00:00:00`);
      return taskDate.getMonth() === month && taskDate.getFullYear() === year;
    });
  }

  const range = getWeekRange(appToday);
  return tasks.filter((task) => task.date >= range.start && task.date <= range.end);
}

function buildAnalytics(tasks, period) {
  const periodTasks = filterTasksForAnalyticsPeriod(tasks, period);
  const total = periodTasks.length;
  const completed = periodTasks.filter((task) => task.completedAt).length;
  const failed = periodTasks.filter((task) => task.failedAt).length;
  const plannedMinutes = periodTasks.reduce((sum, task) => sum + minutesBetween(task.startTime, task.endTime), 0);
  const doneMinutes = periodTasks
    .filter((task) => task.completedAt)
    .reduce((sum, task) => sum + minutesBetween(task.startTime, task.endTime), 0);
  const completionRate = plannedMinutes ? safePercent((doneMinutes / plannedMinutes) * 100) : 0;
  const taskCompletionRate = total ? safePercent((completed / total) * 100) : 0;
  const commuteMinutes = estimateRouteMinutesForTasks(periodTasks);
  const labelMix = buildLabelMix(periodTasks, commuteMinutes);
  const streak = period === 'month' ? Math.max(0, Math.round(taskCompletionRate / 9)) : Math.max(0, Math.round(taskCompletionRate / 28));
  const bestHour = getBestDoneHour(periodTasks);
  const streakTarget = 85;
  const focusScore = buildFocusScore({
    plannedMinutes,
    doneMinutes,
    total,
    completed,
    failedMinutes: periodTasks.filter((task) => task.failedAt).reduce((sum, task) => sum + minutesBetween(task.startTime, task.endTime), 0),
    commuteMinutes
  });

  return {
    period,
    completionRate,
    completed,
    total,
    failed,
    plannedHours: plannedMinutes / 60,
    doneHours: doneMinutes / 60,
    commuteMinutes,
    streak,
    bestHour,
    focusScore,
    preview: {
      title: 'Analitice',
      completionRate,
      taskCompletionRate,
      labelMix,
      streak,
      streakTarget,
      periodLabel: period === 'month' ? 'luna asta' : 'saptamana asta',
      rows: [
        { id: 'hours', label: 'Completion rate ore', value: `${completionRate}%`, percent: completionRate, tone: 'primary', detail: `${formatHours(doneMinutes)} / ${formatHours(plannedMinutes)}` },
        { id: 'tasks', label: 'Taskuri completate', value: `${completed}/${total}`, percent: taskCompletionRate, tone: 'tertiary', detail: `${taskCompletionRate}% din taskuri` }
      ]
    },
    summaryCards: [
      {
        id: 'hours',
        type: 'progress',
        title: 'Completion rate pe ore',
        value: `${completionRate}%`,
        percent: completionRate,
        detail: `${formatHours(doneMinutes)} realizate din ${formatHours(plannedMinutes)} planificate.`,
        tone: 'primary'
      },
      {
        id: 'tasks',
        type: 'progress',
        title: 'Taskuri completate',
        value: `${completed}/${total}`,
        percent: taskCompletionRate,
        detail: taskCompletionRate >= 80 ? 'Foarte bine, majoritatea taskurilor sunt inchise.' : 'Inca mai sunt taskuri care pot fi recuperate.',
        tone: 'tertiary'
      },
      {
        id: 'mix',
        type: 'pie',
        title: 'Impartirea planificarii',
        value: `${formatHours(plannedMinutes + commuteMinutes)}`,
        detail: 'Procent din timpul planificat pe drum, work, personal si alte labeluri.',
        segments: labelMix
      },
      {
        id: 'streak',
        type: 'streak',
        title: period === 'month' ? 'Month streak' : 'Week streak',
        value: `${streak} zile`,
        percent: safePercent((streak / (period === 'month' ? 30 : 7)) * 100),
        detail: `${period === 'month' ? 'Luna asta' : 'Saptamana asta'} ai avut ${streak} zile cu completion rate peste ${streakTarget}%.`
      }
    ],
    distribution: {
      title: period === 'month' ? 'Distributia lunii' : 'Distributia saptamanii',
      period: period === 'month' ? 'Lunar' : 'Saptamanal',
      days: buildDistribution(periodTasks, period)
    },
    commute: {
      icon: '>',
      label: 'Timp pe drum',
      value: formatHours(commuteMinutes),
      trend: commuteMinutes ? 'calculat din locatii' : 'fara drumuri',
      description: 'Estimare mock pregatita pentru integrarea cu backend-ul si traficul live.'
    },
    completion: {
      label: 'Task-uri Finalizate',
      value: `${completed} / ${total} obiective`,
      percent: taskCompletionRate,
      status: taskCompletionRate >= 80 ? 'Streak activ' : 'Mai este loc de recuperare'
    },
    insight: {
      title: period === 'month' ? 'Insight of the Month' : 'Insight of the Week',
      text: bestHour
        ? `Ai fost cel mai productiv in jurul orei ${bestHour}:00, unde ai cele mai multe taskuri marcate Done. Programeaza acolo taskurile grele.`
        : 'Nu exista inca suficiente taskuri finalizate pe ore ca sa aleg un interval castigator.',
      cta: 'Vezi detalii'
    }
  };
}

function getBestDoneHour(tasks) {
  const counts = tasks.reduce((acc, task) => {
    if (!task.completedAt || !task.startTime) return acc;
    const hour = Number(task.startTime.split(':')[0]);
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : '';
}

function buildFocusScore({ plannedMinutes, doneMinutes, total, completed, failedMinutes, commuteMinutes }) {
  const workRatio = plannedMinutes ? doneMinutes / plannedMinutes : 0;
  const taskRatio = total ? completed / total : 0;
  const commuteUtility = plannedMinutes ? Math.min(1, commuteMinutes / Math.max(1, plannedMinutes + commuteMinutes)) : 0;
  const missedPenalty = plannedMinutes ? Math.min(35, (failedMinutes / plannedMinutes) * 45) : 0;
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(workRatio * 58 + taskRatio * 26 + commuteUtility * 16 - missedPenalty)
    )
  );
  const safeScore = Number.isFinite(score) ? score : 0;
  const change = safeScore >= 80 ? '+ focus bun' : safeScore >= 55 ? '+ stabil' : '- risc';

  return {
    label: 'Focus Score',
    score: safeScore,
    change,
    progress: safeScore,
    description:
      safeScore >= 80
        ? 'Scor puternic: ai convertit multe ore planificate in lucru real, iar drumurile au fost integrate eficient.'
        : safeScore >= 55
          ? 'Scor stabil: ai progres bun, dar taskurile ratate sau orele neinchise trag rezultatul in jos.'
          : 'Scor fragil: ai nevoie de mai multe ore finalizate si de mai putine taskuri ratate.'
  };
}

function estimateRouteMinutesForTasks(tasks) {
  const byDate = tasks.reduce((groups, task) => {
    if (!task.startTime || !task.endTime) return groups;
    groups[task.date] = [...(groups[task.date] || []), enrichTaskLocation(task)];
    return groups;
  }, {});

  return Object.values(byDate).reduce((sum, dayTasks) => {
    const sorted = dayTasks.sort((a, b) => timeToMinutesValue(a.startTime) - timeToMinutesValue(b.startTime));
    return sum + sorted.reduce((daySum, task, index) => {
      if (index === 0) return daySum;
      const route = estimateRouteBetween(sorted[index - 1], task);
      return daySum + (route?.durationMinutes || 0);
    }, 0);
  }, 0);
}

function buildLabelMix(tasks, commuteMinutes) {
  const palette = ['#c0c1ff', '#ffb783', '#9ee7d8', '#ffb4ab', '#b9c8de', '#d7b7ff', '#f4d35e', '#a7f3d0'];
  const totals = tasks.reduce((acc, task) => {
    const label = task.label || 'Altele';
    acc[label] = (acc[label] || 0) + minutesBetween(task.startTime, task.endTime);
    return acc;
  }, {});
  const baseSegments = Object.entries(totals).map(([label, minutes], index) => ({
    label,
    minutes,
    color: palette[(index + 1) % palette.length]
  }));
  const routeSegment = commuteMinutes
    ? [{ label: 'Drum', minutes: commuteMinutes, color: '#ff8f3d' }]
    : [];
  const all = [...routeSegment, ...baseSegments];
  const totalMinutes = all.reduce((sum, item) => sum + item.minutes, 0) || 1;

  return all.map((item) => {
    const minutes = Number.isFinite(item.minutes) ? item.minutes : 0;

    return {
      ...item,
      minutes,
      percent: safePercent((minutes / totalMinutes) * 100),
      value: formatHours(minutes)
    };
  });
}

function buildDistribution(tasks, period) {
  const labels = period === 'month'
    ? ['S1', 'S2', 'S3', 'S4']
    : ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];
  const maxMinutes = Math.max(60, tasks.reduce((sum, task) => sum + minutesBetween(task.startTime, task.endTime), 0));

  return labels.map((label, index) => {
    const bucketTasks = tasks.filter((task) => {
      if (!task.date) return false;
      const taskDate = new Date(`${task.date}T00:00:00`);
      const bucket = period === 'month'
        ? Math.min(3, Math.floor((taskDate.getDate() - 1) / 7))
        : (taskDate.getDay() + 6) % 7;
      return bucket === index;
    });
    const taskMinutes = bucketTasks.reduce((sum, task) => sum + minutesBetween(task.startTime, task.endTime), 0);
    const routeMinutes = estimateRouteMinutesForTasks(bucketTasks);
    const totalMinutes = taskMinutes + routeMinutes;

    return {
      label,
      taskMinutes,
      routeMinutes,
      taskPercent: safePercent((taskMinutes / maxMinutes) * 100),
      routePercent: safePercent((routeMinutes / maxMinutes) * 100),
      value: safePercent((totalMinutes / maxMinutes) * 100)
    };
  });
}

function formatHours(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}`.padStart(2, '0') + ':' + `${secs}`.padStart(2, '0');
}

function formatShortDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function buildAnalyticsSubtitle(period) {
  if (period === 'month') {
    const date = new Date(`${appToday}T00:00:00`);
    return `Performanta ta in luna ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  const range = getWeekRange(appToday);
  return `Performanta ta in saptamana ${formatShortDate(range.start)} - ${formatShortDate(range.end)}`;
}

function buildHourlyInsight(tasks, period) {
  const hours = Array.from({ length: 14 }, (_, index) => 8 + index);
  const multiplier = period === 'month' ? 4 : 1;

  return hours.map((hour) => {
    const bucket = tasks.filter((task) => Number(`${task.startTime || '0'}`.split(':')[0]) === hour);
    return {
      hour: `${hour}`,
      done: bucket.filter((task) => task.completedAt).length * multiplier,
      failed: bucket.filter((task) => task.failedAt).length * multiplier
    };
  });
}

function findFreeSlot(tasks, dateKey, durationMinutes) {
  const dayStart = 8 * 60;
  const dayEnd = 21 * 60;
  const busy = tasks
    .filter((task) => task.date === dateKey && task.startTime && task.endTime)
    .map((task) => ({
      start: timeToMinutesValue(task.startTime),
      end: timeToMinutesValue(task.endTime)
    }))
    .sort((a, b) => a.start - b.start);

  let cursor = dayStart;
  for (const block of busy) {
    if (block.start - cursor >= durationMinutes) {
      return { startTime: minutesToTime(cursor), endTime: minutesToTime(cursor + durationMinutes) };
    }
    cursor = Math.max(cursor, block.end);
  }

  if (dayEnd - cursor >= durationMinutes) {
    return { startTime: minutesToTime(cursor), endTime: minutesToTime(cursor + durationMinutes) };
  }

  return { startTime: minutesToTime(Math.max(dayStart, dayEnd - durationMinutes)), endTime: minutesToTime(dayEnd) };
}

function buildHobbySuggestion(selectedHobbies, dateKey, tasks) {
  const selectedItems = selectedHobbies.map((id) => hobbyLookup[id]).filter(Boolean);
  const item = selectedItems[0] || hobbyGroups[0].items[0];
  const slot = findFreeSlot(tasks, dateKey, item.durationMinutes);

  return {
    label: 'Sugestie hobby',
    message: `Ai un interval liber ${slot.startTime} - ${slot.endTime}.`,
    actionTitle: item.taskTitle,
    hobbyLabel: item.label,
    durationMinutes: item.durationMinutes,
    timeLabel: `${slot.startTime} - ${slot.endTime}`,
    cta: 'Programeaza',
    task: {
      title: item.taskTitle,
      date: dateKey,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: item.groupId === 'reading' || item.groupId === 'creative' ? 'Acasa' : 'Parcul Herastrau',
      label: 'Hobby',
      importance: 'low'
    }
  };
}

function buildFocusLeaderboard(user, analytics) {
  const currentEntry = user
    ? {
        name: user.name,
        email: user.email,
        averageFocusScore: analytics.focusScore.score,
        completed: analytics.completed,
        total: analytics.total
      }
    : null;

  return [...mockFocusLeaderboard, currentEntry]
    .filter(Boolean)
    .sort((a, b) => b.averageFocusScore - a.averageFocusScore)
    .slice(0, 10);
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [usersCsv, setUsersCsv] = useState(initialUsersCsv);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [selectedDate, setSelectedDate] = useState('2023-10-12');
  const [calendarMonth, setCalendarMonth] = useState(new Date(2023, 9, 1));
  const [calendarMode, setCalendarMode] = useState('day');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  const [insightModalOpen, setInsightModalOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [insightPeriod, setInsightPeriod] = useState('week');
  const [taskDraftDate, setTaskDraftDate] = useState('2023-10-12');
  const [scheduledTasks, setScheduledTasks] = useState(initialScheduledTasks);
  const [taskLabels, setTaskLabels] = useState(['Focus', 'Raport', 'Personal', 'Urgent']);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskDraftTemplate, setTaskDraftTemplate] = useState(null);
  const [taskFormError, setTaskFormError] = useState('');
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNotes, setQuickNotes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeStep, setUpgradeStep] = useState(null);
  const [selectedHobbies, setSelectedHobbies] = useState(['running', 'fiction', 'park-walk']);
  const users = useMemo(() => parseUsersCsv(usersCsv), [usersCsv]);
  const isPremium = currentUser?.subscription === 'premium';
  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = setInterval(() => setTimerSeconds((seconds) => seconds + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);
  const appUser = currentUser
    ? {
        ...currentUser,
        initials: getInitials(currentUser.name),
        isPremium
      }
    : homePageData.user;
  const calendarPlanRules = isPremium ? calendarPageData.rules.premium : calendarPageData.rules.free;
  const derivedHomePageData = useMemo(
    () => ({
      ...homePageData,
      overview: {
        ...homePageData.overview,
        greeting: `Buna dimineata, ${appUser.name}.`
      }
    }),
    [appUser.name]
  );
  const activeUser = appUser;
  const currentNavItems = useMemo(
    () => navItems.map((item) => ({ ...item, active: item.key === activePage })),
    [activePage]
  );
  const dynamicCalendar = useMemo(
    () => generateCalendar(calendarMonth, selectedDate, scheduledTasks),
    [calendarMonth, selectedDate, scheduledTasks]
  );
  const visibleScheduledTasks = useMemo(() => {
    const tasksForMode = calendarMode === 'day'
      ? scheduledTasks.filter((task) => task.date === selectedDate)
      : scheduledTasks.filter((task) => {
          const range = getWeekRange(selectedDate);
          return task.date >= range.start && task.date <= range.end;
        });

    return [...tasksForMode].sort((a, b) =>
      `${a.date} ${formatTaskTime(a)}`.localeCompare(`${b.date} ${formatTaskTime(b)}`)
    );
  }, [calendarMode, scheduledTasks, selectedDate]);
  const homeSchedule = useMemo(() => {
    const todayTasks = scheduledTasks.filter((task) => task.date === appToday);
    const scheduleItems = isPremium
      ? buildPremiumTimelineItems(todayTasks)
      : todayTasks.map(taskToScheduleItem);

    return {
      title: 'Cronologia zilei',
      action: todayTasks.length ? `${todayTasks.length} taskuri` : 'Niciun task',
      items: scheduleItems
    };
  }, [isPremium, scheduledTasks]);
  const dailyTaskInsight = useMemo(() => buildDailyInsight(scheduledTasks, appToday), [scheduledTasks]);
  const missedTasks = useMemo(() => scheduledTasks.filter((task) => task.failedAt), [scheduledTasks]);
  const dynamicAnalytics = useMemo(() => buildAnalytics(scheduledTasks, analyticsPeriod), [analyticsPeriod, scheduledTasks]);
  const analyticsSubtitle = useMemo(() => buildAnalyticsSubtitle(analyticsPeriod), [analyticsPeriod]);
  const focusLeaderboard = useMemo(
    () => buildFocusLeaderboard(currentUser, dynamicAnalytics),
    [currentUser, dynamicAnalytics]
  );
  const hourlyInsight = useMemo(() => buildHourlyInsight(scheduledTasks, insightPeriod), [insightPeriod, scheduledTasks]);
  const hobbySuggestion = useMemo(
    () => buildHobbySuggestion(selectedHobbies, selectedDate, scheduledTasks),
    [selectedHobbies, selectedDate, scheduledTasks]
  );
  const taskSections = useMemo(() => {
    const todayTasks = scheduledTasks
      .filter((task) => task.date === appToday)
      .sort((a, b) => formatTaskTime(a).localeCompare(formatTaskTime(b)))
      .map(taskToSectionTask);
    const tomorrow = new Date(`${appToday}T00:00:00`);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = formatDateKey(tomorrow);
    const nextDayTasks = scheduledTasks
      .filter((task) => task.date === tomorrowKey)
      .sort((a, b) => formatTaskTime(a).localeCompare(formatTaskTime(b)))
      .map(taskToSectionTask);

    return [
      {
        id: 'today-real',
        title: 'Azi',
        accent: 'primary',
        count: todayTasks.length,
        action: 'Adauga',
        date: appToday,
        layout: 'cards',
        tasks: todayTasks
      },
      {
        id: 'tomorrow-real',
        title: 'Maine',
        accent: 'tertiary',
        count: nextDayTasks.length,
        action: 'Adauga',
        date: tomorrowKey,
        layout: 'cards',
        tasks: nextDayTasks
      }
    ];
  }, [scheduledTasks]);

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setAuthError('');
  };

  const handleAuthSubmit = (form) => {
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password || (authMode === 'signup' && !form.name.trim())) {
      setAuthError('Completeaza toate campurile.');
      return;
    }

    if (authMode === 'login') {
      const user = authenticateUser(users, email, password);
      if (!user) {
        setAuthError('User sau parola gresita. Incearca userfree/1234 sau userpremium/4321.');
        return;
      }

      setCurrentUser(user);
      setAuthError('');
      setIsAuthenticated(true);
      setActivePage('home');
      return;
    }

    const result = createFreeUser(users, form);
    if (result.error) {
      setAuthError(result.error);
      return;
    }

    setUsersCsv(result.csv);
    setCurrentUser(result.user);
    setAuthError('');
    setIsAuthenticated(true);
    setActivePage('home');
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'timer') {
      setTimerRunning((running) => !running);
      return;
    }

    if (actionId === 'note') {
      setQuickNoteOpen((open) => !open);
    }
  };

  const saveQuickNote = () => {
    const note = quickNoteText.trim();
    if (!note) return;

    setQuickNotes((notes) => [
      {
        id: `note-${Date.now()}`,
        text: note,
        time: formatTimer(timerSeconds)
      },
      ...notes
    ]);
    setQuickNoteText('');
    setQuickNoteOpen(false);
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setTaskDraftTemplate(null);
    setTaskFormError('');
    setTaskDraftDate(selectedDate);
    setTaskModalOpen(true);
  };

  const openNewTaskModalForDate = (date) => {
    setEditingTask(null);
    setTaskDraftTemplate(null);
    setTaskFormError('');
    setTaskDraftDate(date);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    const original = scheduledTasks.find((item) => item.id === task.id) || task;
    setTaskDraftTemplate(null);
    setEditingTask(original);
    setTaskFormError('');
    setTaskModalOpen(true);
  };

  const toggleHobby = (hobbyId) => {
    setSelectedHobbies((current) =>
      current.includes(hobbyId)
        ? current.filter((id) => id !== hobbyId)
        : [...current, hobbyId]
    );
  };

  const scheduleHobbySuggestion = (suggestion) => {
    setEditingTask(null);
    setTaskDraftTemplate(suggestion.task);
    setTaskDraftDate(suggestion.task.date || selectedDate);
    setTaskFormError('');
    setTaskModalOpen(true);
  };

  const saveTask = (taskForm) => {
    if (taskForm.label && !taskLabels.includes(taskForm.label)) {
      setTaskLabels((current) => [...current, taskForm.label]);
    }

    const taskWithLocation = enrichTaskLocation(taskForm);
    const editingId = editingTask?.id || taskWithLocation.id;
    const scheduleError = isPremium ? findTaskScheduleConflict({ ...taskWithLocation, id: editingId }, scheduledTasks, editingTask?.id) : '';

    if (scheduleError) {
      setTaskFormError(scheduleError);
      return;
    }

    if (editingTask) {
      setScheduledTasks((current) =>
        current.map((task) => (
          task.id === editingTask.id
            ? { ...task, ...taskWithLocation, id: editingTask.id, failedAt: editingTask.failedAt || editingTask.reprogramming ? '' : task.failedAt }
            : task
        ))
      );
    } else {
      setScheduledTasks((current) => [
        ...current,
        {
          ...taskWithLocation,
          id: `task-${Date.now()}`
        }
      ]);
    }

    setTaskModalOpen(false);
    setEditingTask(null);
    setTaskDraftTemplate(null);
    setTaskFormError('');
  };

  const deleteTask = (taskId) => {
    setScheduledTasks((current) => current.filter((task) => task.id !== taskId));
    setTaskModalOpen(false);
    setEditingTask(null);
    setTaskDraftTemplate(null);
    setTaskFormError('');
    setPendingDeleteTaskId(null);
  };

  const requestDeleteTask = (taskId) => {
    setPendingDeleteTaskId(taskId);
  };

  const rescheduleMissedTask = (task) => {
    setEditingTask({ ...task, reprogramming: true });
    setTaskDraftTemplate(null);
    setTaskFormError('');
    setTaskModalOpen(true);
  };

  const completeTask = (taskId) => {
    setScheduledTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completedAt: task.completedAt ? '' : 'acum',
              failedAt: ''
            }
          : task
      )
    );
  };

  const failTask = (taskId) => {
    setScheduledTasks((current) =>
      current.map((task) =>
        task.id === taskId && !task.completedAt
          ? {
              ...task,
              failedAt: task.failedAt || 'azi'
            }
          : task
      )
    );
  };

  const selectCalendarDay = (day) => {
    setSelectedDate(day.date);
    setCalendarMonth(new Date(`${day.date}T00:00:00`));
  };

  const startUpgrade = (plan = profilePageData.pricing.plans.find((item) => item.selected)) => {
    setSelectedPlan(plan);
    setUpgradeStep('confirm');
  };

  const confirmUpgrade = () => {
    setUpgradeStep('payment');
  };

  const completePayment = () => {
    const upgraded = { ...currentUser, subscription: 'premium' };
    setCurrentUser(upgraded);
    setUsersCsv(usersToCsv(users.map((user) => (user.email === upgraded.email ? upgraded : user))));
    setUpgradeStep(null);
    setSelectedPlan(null);
    setActivePage('profile');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.appShell}>
          <AuthScreen
            data={authPageData}
            mode={authMode}
            error={authError}
            onModeChange={handleModeChange}
            onSubmit={handleAuthSubmit}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.appShell}>
        <AppHeader
          title="FocusFlow"
          initials={activeUser.initials}
          showLeaderboard={isPremium}
          showClose={activePage === 'profile'}
          hideAvatar={activePage === 'profile'}
          onAvatarPress={() => setActivePage('profile')}
          onClosePress={() => setActivePage('home')}
          onLeaderboardPress={() => setLeaderboardOpen(true)}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activePage === 'home' ? (
            <>
              <HomeGreetingCard overview={derivedHomePageData.overview} />
              {quickNotes.length ? (
                <View style={styles.quickNotesList}>
                  <Text style={styles.quickNoteTitle}>Note rapide</Text>
                  {quickNotes.map((note) => (
                    <View key={note.id} style={styles.quickNoteItem}>
                      <Text style={styles.quickNoteMeta}>Timer {note.time}</Text>
                      <Text style={styles.quickNoteText}>{note.text}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <DaySchedule schedule={homeSchedule} isPremium={isPremium} onDone={completeTask} onFail={failTask} />
              <HomeAnalyticsCard analytics={dynamicAnalytics.preview} onDetails={() => setActivePage('analytics')} />
              <FocusTipCard tip={derivedHomePageData.focusTip} />
              <QuickActions
                actions={derivedHomePageData.quickActions}
                timerRunning={timerRunning}
                timerLabel={formatTimer(timerSeconds)}
                onAction={handleQuickAction}
              />
              {quickNoteOpen ? (
                <View style={styles.quickNoteCard}>
                  <Text style={styles.quickNoteTitle}>Nota rapida</Text>
                  <TextInput
                    value={quickNoteText}
                    onChangeText={setQuickNoteText}
                    placeholder="Scrie o idee, reminder sau observatie..."
                    placeholderTextColor="rgba(199,196,215,0.55)"
                    multiline
                    style={styles.quickNoteInput}
                  />
                  <TouchableOpacity activeOpacity={0.86} style={styles.quickNoteButton} onPress={saveQuickNote}>
                    <Text style={styles.quickNoteButtonText}>Salveaza nota</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </>
          ) : activePage === 'analytics' ? (
            <>
              <AnalyticsTitle title={analyticsPageData.title} subtitle={analyticsSubtitle} />
              <View style={styles.analyticsSegments}>
                {[
                  { key: 'week', label: 'Saptamana' },
                  { key: 'month', label: 'Luna' }
                ].map((period) => (
                  <TouchableOpacity
                    key={period.key}
                    activeOpacity={0.86}
                    onPress={() => setAnalyticsPeriod(period.key)}
                    style={[styles.analyticsSegment, analyticsPeriod === period.key && styles.analyticsSegmentActive]}
                  >
                    <Text style={[styles.analyticsSegmentText, analyticsPeriod === period.key && styles.analyticsSegmentTextActive]}>
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <AnalyticsFocusScore focusScore={dynamicAnalytics.focusScore} />
              <AnalyticsSummaryCards cards={dynamicAnalytics.summaryCards} completionMetric={dynamicAnalytics.completion} />
              <AnalyticsMetricCard metric={dynamicAnalytics.commute} variant="commute" />
              <AnalyticsChartCard distribution={dynamicAnalytics.distribution} />
              <AnalyticsInsightCard insight={dynamicAnalytics.insight} onDetails={() => setInsightModalOpen(true)} />
            </>
          ) : activePage === 'profile' ? (
            <>
              <ProfileAccountCard user={appUser} csvPreview={usersToCsv(users)} />
              {isPremium ? (
                <HobbyPreferencesCard
                  groups={hobbyGroups}
                  selected={selectedHobbies}
                  onToggle={toggleHobby}
                />
              ) : null}
              <PremiumHero
                hero={
                  isPremium
                    ? {
                        title: 'Cont Premium activ',
                        subtitle: 'Ai acces la programare pe ore, automatizare si experienta fara reclame.'
                      }
                    : profilePageData.hero
                }
              />
              <View style={styles.benefits}>
                {profilePageData.benefits.map((benefit) => (
                  <PremiumBenefitCard key={benefit.id} benefit={benefit} />
                ))}
              </View>
              {!isPremium && <PricingPlans pricing={profilePageData.pricing} onSelectPlan={startUpgrade} />}
            </>
          ) : activePage === 'calendar' ? (
            <>
              <CalendarCard
                calendar={dynamicCalendar}
                onSelectDay={selectCalendarDay}
                onPreviousMonth={() => setCalendarMonth((current) => addMonths(current, -1))}
                onNextMonth={() => setCalendarMonth((current) => addMonths(current, 1))}
              />
              <SuggestionCard
                suggestion={calendarPageData.suggestion}
                hobbySuggestion={hobbySuggestion}
                planRules={calendarPlanRules}
                isPremium={isPremium}
                missedTasks={missedTasks}
                onDeleteMissed={requestDeleteTask}
                onRescheduleMissed={rescheduleMissedTask}
                onScheduleSuggestion={scheduleHobbySuggestion}
              />
              <ScheduledTasks
                title={calendarMode === 'week' ? 'Programul saptamanii' : `Program ${selectedDate}`}
                mode={calendarMode}
                tasks={visibleScheduledTasks}
                isPremium={isPremium}
                onModeChange={setCalendarMode}
                onEdit={openEditTaskModal}
                onDone={completeTask}
                onDelete={requestDeleteTask}
                onCreate={openNewTaskModal}
              />
            </>
          ) : (
            <>
              <TaskInsightCard insight={dailyTaskInsight} />
              {!isPremium && <PremiumBanner premium={tasksPageData.premium} onUpgrade={() => {
                setActivePage('profile');
                startUpgrade();
              }} />}
              <View style={styles.taskSections}>
                {taskSections.map((section) => (
                  <TaskSection
                    key={section.id}
                    section={section}
                    onEditTask={openEditTaskModal}
                    onDoneTask={completeTask}
                    onDeleteTask={requestDeleteTask}
                    onAction={(section) => openNewTaskModalForDate(section.date || appToday)}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
        {(activePage === 'home' || activePage === 'tasks') && (
          <FloatingActionButton rounded={activePage === 'home'} onPress={openNewTaskModal} />
        )}
        <BottomNav items={currentNavItems} onSelect={setActivePage} />
        <TaskEditorModal
          visible={taskModalOpen}
          task={editingTask}
          draftTask={taskDraftTemplate}
          labels={taskLabels}
          selectedDate={taskDraftDate}
          isPremium={isPremium}
          error={taskFormError}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
            setTaskDraftTemplate(null);
            setTaskFormError('');
          }}
          onSave={saveTask}
          onDelete={requestDeleteTask}
        />
        <ConfirmDeleteModal
          visible={Boolean(pendingDeleteTaskId)}
          taskTitle={scheduledTasks.find((task) => task.id === pendingDeleteTaskId)?.title}
          onCancel={() => setPendingDeleteTaskId(null)}
          onConfirm={() => deleteTask(pendingDeleteTaskId)}
        />
        <UpgradeConfirmModal
          visible={upgradeStep === 'confirm'}
          plan={selectedPlan}
          onCancel={() => setUpgradeStep(null)}
          onConfirm={confirmUpgrade}
        />
        <PaymentPortalModal
          visible={upgradeStep === 'payment'}
          plan={selectedPlan}
          onCancel={() => setUpgradeStep('confirm')}
          onPay={completePayment}
        />
        <InsightDetailsModal
          visible={insightModalOpen}
          period={insightPeriod}
          data={hourlyInsight}
          onPeriodChange={setInsightPeriod}
          onClose={() => setInsightModalOpen(false)}
        />
        <FocusLeaderboardModal
          visible={leaderboardOpen}
          entries={focusLeaderboard}
          currentUserEmail={currentUser?.email}
          periodLabel={monthNames[new Date(`${appToday}T00:00:00`).getMonth()]}
          onClose={() => setLeaderboardOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 112,
    gap: 20
  },
  taskSections: {
    gap: 34
  },
  benefits: {
    gap: 12
  },
  analyticsSegments: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.surface
  },
  analyticsSegment: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999
  },
  analyticsSegmentActive: {
    backgroundColor: colors.secondaryContainer
  },
  analyticsSegmentText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '900'
  },
  analyticsSegmentTextActive: {
    color: colors.secondary
  },
  quickNoteCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 14,
    gap: 10
  },
  quickNoteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900'
  },
  quickNoteInput: {
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.background,
    color: colors.text,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    fontWeight: '600'
  },
  quickNoteButton: {
    minHeight: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  quickNoteButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '900'
  },
  quickNotesList: {
    gap: 10
  },
  quickNoteItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 12
  },
  quickNoteMeta: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 5
  },
  quickNoteText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600'
  }
});
