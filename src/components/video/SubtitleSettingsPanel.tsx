import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Captions } from 'lucide-react';

interface SubtitleLanguage {
  code: string;
  label: string;
}

interface SubtitleSettingsPanelProps {
  isOpen: boolean;
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onClose: () => void;
}

const SUBTITLE_LANGUAGES: SubtitleLanguage[] = [
  { code: 'off', label: 'Off' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'sw', label: 'Swahili' },
];

export const SubtitleSettingsPanel: React.FC<SubtitleSettingsPanelProps> = ({
  isOpen,
  currentLanguage,
  onLanguageChange,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Captions className="h-4 w-4 text-white" />
          <h3 className="text-white font-semibold text-sm">Subtitles</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {SUBTITLE_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              onLanguageChange(lang.code);
              onClose();
            }}
            className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-800 transition-colors ${
              lang.code === currentLanguage ? 'bg-primary/20' : ''
            }`}
          >
            <span className="text-white text-sm">{lang.label}</span>
            {lang.code === currentLanguage && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
