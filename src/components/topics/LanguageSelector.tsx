import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'th-TH', name: 'Thai', flag: '🇹🇭' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor="language-select" className="text-sm text-gray-600">
        Select Target Language
      </label>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger id="language-select" className="w-[180px] bg-white text-gray-800 border-2 border-[#38b6ff] rounded-md">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-[#38b6ff]">
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
              <span>{lang.flag}</span> {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;