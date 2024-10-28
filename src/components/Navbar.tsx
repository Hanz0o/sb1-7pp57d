import { Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();

  return (
    <nav className={`bg-white shadow-lg fixed w-full z-50 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">YISB</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-red-600 transition">{t('nav.home')}</a>
            <a href="#about" className="text-gray-700 hover:text-red-600 transition">{t('nav.about')}</a>
            <a href="#programs" className="text-gray-700 hover:text-red-600 transition">{t('nav.programs')}</a>
            <a href="#contact" className="text-gray-700 hover:text-red-600 transition">{t('nav.contact')}</a>
            <LanguageSwitcher />
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-red-600">{t('nav.home')}</a>
            <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-red-600">{t('nav.about')}</a>
            <a href="#programs" className="block px-3 py-2 text-gray-700 hover:text-red-600">{t('nav.programs')}</a>
            <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-red-600">{t('nav.contact')}</a>
          </div>
        </div>
      )}
    </nav>
  );
}