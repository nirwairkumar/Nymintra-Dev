import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const toggleLanguage = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center h-8 rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm p-0.5 shadow-sm hover:border-primary/40 transition-all duration-300 w-[84px]"
      aria-label={isHindi ? 'Switch to English' : 'हिन्दी में बदलें'}
      title={isHindi ? 'Switch to English' : 'हिन्दी में बदलें'}
    >
      {/* Sliding indicator */}
      <span
        className={`absolute top-0.5 h-7 w-[40px] rounded-full bg-primary/10 border border-primary/20 transition-all duration-300 ease-in-out ${
          isHindi ? 'translate-x-[40px]' : 'translate-x-0'
        }`}
      />
      
      {/* English label */}
      <span
        className={`relative z-10 w-[40px] text-center text-[11px] font-bold transition-all duration-300 ${
          !isHindi
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </span>
      
      {/* Hindi label */}
      <span
        className={`relative z-10 w-[40px] text-center text-xs font-bold transition-all duration-300 pt-[1px] ${
          isHindi
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
      >
        हिं
      </span>
    </button>
  );
}
