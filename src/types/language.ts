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
  settings: {
    profile: string;
    account: string;
    voice: string;
    storage: string;
    chat: string;
    dataControl: string;
    personalization: string;
    language: string;
    // Profile
    editProfile: string;
    displayName: string;
    bio: string;
    saveChanges: string;
    // Account
    email: string;
    plan: string;
    freePlan: string;
    proPlan: string;
    upgradeNow: string;
    dangerZone: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    // Voice
    voiceLanguage: string;
    voiceSpeed: string;
    voicePitch: string;
    autoSpeak: string;
    autoSpeakDesc: string;
    // Storage
    used: string;
    total: string;
    clearCache: string;
    clearCacheDesc: string;
    exportData: string;
    // Chat settings
    deleteAllChats: string;
    deleteAllChatsDesc: string;
    archiveAll: string;
    archiveAllDesc: string;
    archiveChat: string;
    archiveChatDesc: string;
    confirmDelete: string;
    // Data control
    dataRetention: string;
    dataRetentionDesc: string;
    allowAnalytics: string;
    allowAnalyticsDesc: string;
    downloadData: string;
    downloadDataDesc: string;
    // Personalization
    theme: string;
    fontSize: string;
    compactMode: string;
    compactModeDesc: string;
    sendWithEnter: string;
    sendWithEnterDesc: string;
    // Language
    selectLanguage: string;
    currentLanguage: string;
  };
}
