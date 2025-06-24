import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.events': 'Events',
    'nav.profile': 'Profile',
    'nav.friends': 'Friends',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.age': 'Age',
    'auth.location': 'Location',
    'auth.sports': 'Favorite Sports',
    'auth.skillLevel': 'Skill Level',
    'auth.bio': 'Bio',
    'auth.loginBtn': 'Sign In',
    'auth.registerBtn': 'Create Account',
    'auth.switchToRegister': 'Don\'t have an account? Register',
    'auth.switchToLogin': 'Already have an account? Login',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.discoverEvents': 'Discover Events',
    'dashboard.upcomingEvents': 'Your Upcoming Events',
    'dashboard.createEvent': 'Create Event',
    'dashboard.noEvents': 'No upcoming events found',
    'dashboard.joinEvent': 'Join Event',
    'dashboard.viewEvent': 'View Details',
    
    // Events
    'event.participants': 'participants',
    'event.maxParticipants': 'max participants',
    'event.free': 'Free',
    'event.price': 'DKK',
    'event.skillLevel': 'Skill Level',
    'event.organizer': 'Organizer',
    'event.date': 'Date',
    'event.time': 'Time',
    'event.location': 'Location',
    'event.description': 'Description',
    'event.join': 'Join Event',
    'event.leave': 'Leave Event',
    'event.chat': 'Event Chat',
    'event.sendMessage': 'Send message...',
    
    // Profile
    'profile.title': 'Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.sports': 'Sports',
    'profile.achievements': 'Achievements',
    'profile.stats': 'Statistics',
    'profile.eventsParticipated': 'Events Participated',
    'profile.eventsCreated': 'Events Created',
    
    // Skill Levels
    'skill.beginner': 'Beginner',
    'skill.intermediate': 'Intermediate',
    'skill.advanced': 'Advanced',
    'skill.all': 'All Levels',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.confirm': 'Confirm',
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.today': 'Today',
    'common.tomorrow': 'Tomorrow',
    'common.thisWeek': 'This Week'
  },
  da: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.events': 'Begivenheder',
    'nav.profile': 'Profil',
    'nav.friends': 'Venner',
    'nav.logout': 'Log ud',
    'nav.login': 'Log ind',
    'nav.register': 'Registrer',
    
    // Auth
    'auth.login': 'Log ind',
    'auth.register': 'Registrer',
    'auth.email': 'Email',
    'auth.password': 'Adgangskode',
    'auth.name': 'Fulde navn',
    'auth.age': 'Alder',
    'auth.location': 'Placering',
    'auth.sports': 'Favoritsport',
    'auth.skillLevel': 'Færdighedsniveau',
    'auth.bio': 'Biografi',
    'auth.loginBtn': 'Log ind',
    'auth.registerBtn': 'Opret konto',
    'auth.switchToRegister': 'Har du ikke en konto? Registrer',
    'auth.switchToLogin': 'Har du allerede en konto? Log ind',
    
    // Dashboard
    'dashboard.welcome': 'Velkommen tilbage',
    'dashboard.discoverEvents': 'Opdag begivenheder',
    'dashboard.upcomingEvents': 'Dine kommende begivenheder',
    'dashboard.createEvent': 'Opret begivenhed',
    'dashboard.noEvents': 'Ingen kommende begivenheder fundet',
    'dashboard.joinEvent': 'Deltag i begivenhed',
    'dashboard.viewEvent': 'Se detaljer',
    
    // Events
    'event.participants': 'deltagere',
    'event.maxParticipants': 'max deltagere',
    'event.free': 'Gratis',
    'event.price': 'DKK',
    'event.skillLevel': 'Færdighedsniveau',
    'event.organizer': 'Arrangør',
    'event.date': 'Dato',
    'event.time': 'Tid',
    'event.location': 'Placering',
    'event.description': 'Beskrivelse',
    'event.join': 'Deltag i begivenhed',
    'event.leave': 'Forlad begivenhed',
    'event.chat': 'Begivenhedschat',
    'event.sendMessage': 'Send besked...',
    
    // Profile
    'profile.title': 'Profil',
    'profile.editProfile': 'Rediger profil',
    'profile.sports': 'Sportsgrene',
    'profile.achievements': 'Præstationer',
    'profile.stats': 'Statistikker',
    'profile.eventsParticipated': 'Begivenheder deltaget',
    'profile.eventsCreated': 'Begivenheder oprettet',
    
    // Skill Levels
    'skill.beginner': 'Nybegynder',
    'skill.intermediate': 'Mellem',
    'skill.advanced': 'Øvet',
    'skill.all': 'Alle niveauer',
    
    // Common
    'common.save': 'Gem',
    'common.cancel': 'Annuller',
    'common.close': 'Luk',
    'common.loading': 'Indlæser...',
    'common.error': 'Der opstod en fejl',
    'common.success': 'Succes!',
    'common.confirm': 'Bekræft',
    'common.search': 'Søg...',
    'common.filter': 'Filter',
    'common.all': 'Alle',
    'common.today': 'I dag',
    'common.tomorrow': 'I morgen',
    'common.thisWeek': 'Denne uge'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'da')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};