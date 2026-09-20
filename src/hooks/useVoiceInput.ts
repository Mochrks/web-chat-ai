import { useState, useRef, useCallback } from "react";

interface UseVoiceInputReturn {
    isListening: boolean;
    listeningText: string;
    startListening: () => void;
    stopListening: () => void;
    finalTranscript: string | null;
    clearTranscript: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
    const [isListening, setIsListening] = useState(false);
    const [listeningText, setListeningText] = useState("");
    const [finalTranscript, setFinalTranscript] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef("");

    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setListeningText("");
            transcriptRef.current = "";
        };

        recognition.onend = () => {
            setIsListening(false);
            if (transcriptRef.current) {
                setFinalTranscript(transcriptRef.current);
            }
            setListeningText("");
            transcriptRef.current = "";
        };

        recognition.onresult = (event: any) => {
            const results = Array.from(event.results);
            const transcript = results
                .map((result: any) => result[0].transcript)
                .join("");
            setListeningText(transcript);
            transcriptRef.current = transcript;
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const clearTranscript = useCallback(() => {
        setFinalTranscript(null);
    }, []);

    return {
        isListening,
        listeningText,
        startListening,
        stopListening,
        finalTranscript,
        clearTranscript,
    };
}
