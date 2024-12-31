import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/constants/languages";

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
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
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <SelectItem key={code} value={code} className="flex items-center gap-2">
              <span>{lang.flag}</span> {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;