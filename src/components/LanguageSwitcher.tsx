import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}