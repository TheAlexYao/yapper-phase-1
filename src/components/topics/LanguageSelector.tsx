import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  return (
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-[180px] bg-white text-gray-800 border-2 border-[#38b6ff] rounded-md">
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
  );
};

export default LanguageSelector;