import { Rocket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t, language } = useLanguage();

  return (
    <div id="home" className={`relative bg-gradient-to-r from-red-600 to-red-800 pt-16 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <Rocket className="h-16 w-16 text-white mx-auto mb-8" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <a
            href="#programs"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition"
          >
            {t('hero.cta')}
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-16"
          fill="white"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.45,22.34,121.09,43.44,321.39,56.44Z" />
        </svg>
      </div>
    </div>
  );
}