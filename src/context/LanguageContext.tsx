import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "@/locales/en";
import { id } from "@/locales/id";
import { STORAGE_KEYS } from "@/constants/app";
import type { Language, LanguageContextType, Translations } from "@/types/language";

export type { Language, Translations };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { en, id };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE) as Language;
        if (savedLang && (savedLang === "en" || savedLang === "id")) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
    };

    const t = (path: string): any => {
        const keys = path.split(".");
        let current: any = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key missing: ${path} for language ${language}`);
                return path;
            }
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
