import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.programs': 'Programs',
    'nav.contact': 'Contact',
    'hero.title': 'Youth and Innovation Squad Bahrain',
    'hero.subtitle': 'Empowering Bahraini youth through innovation, technology, and leadership development',
    'hero.cta': 'Explore Our Programs',
    // Add more translations as needed
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'عن المبادرة',
    'nav.programs': 'البرامج',
    'nav.contact': 'اتصل بنا',
    'hero.title': 'فريق الشباب والابتكار البحرين',
    'hero.subtitle': 'تمكين الشباب البحريني من خلال الابتكار والتكنولوجيا وتطوير القيادة',
    'hero.cta': 'استكشف برامجنا',
    // Add more translations as needed
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}