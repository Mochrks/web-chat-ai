export type Language = "en" | "id";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => any;
}

export interface Translations {
    common: {
        loading: string;
        search: string;
        searchPlaceholder: string;
        newChat: string;
        history: string;
        settings: string;
        about: string;
        version: string;
        model: string;
        developer: string;
        role: string;
        actions: string;
        noResults: string;
        aboutDescription: string;
        getStarted: string;
    };
    chat: {
        greetings: string[];
        inputPlaceholder: string;
        initialPlaceholder: string;
        voiceListening: string;
        voiceStartDataPlaceholder: string;
        voiceStop: string;
        modelWarning: string;
        thinking: string;
        voiceInput: string;
        preview: string;
        created: string;
    };
    status: {
        systemOnline: string;
        highSpeed: string;
        selectModel: string;
        selectRole: string;
    };
}
