export type ModelCategory = "llm" | "image" | "video" | "audio";

export interface AIModelConfig {
  id: string;
  name: string;
  category: ModelCategory;
  categoryLabel: string;
  description: string;
  tag?: string;
}

export const MODEL_CONFIGS: AIModelConfig[] = [
  // ── LLM (Teks, Percakapan & Kode) ──
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    category: "llm",
    categoryLabel: "LLM",
    description: "Model cepat, cerdas dan serbaguna untuk percakapan & penalaran",
    tag: "Default",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    category: "llm",
    categoryLabel: "LLM",
    description: "Kecerdasan tinggi & performa mutakhir untuk segala perintah",
    tag: "New",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    category: "llm",
    categoryLabel: "LLM",
    description: "Penalaran mendalam untuk kode kompleks dan logika tingkat lanjut",
    tag: "Pro",
  },
  {
    id: "gemma-4-31b-it",
    name: "Gemma 4 31B IT",
    category: "llm",
    categoryLabel: "LLM",
    description: "Model instruksi open-weight Google dengan performa optimal",
    tag: "Open",
  },

  // ── Gambar (Image Generation & Multimodal Vision) ──
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image",
    category: "image",
    categoryLabel: "Image",
    description: "Spesialis analisis visual, pemahaman gambar dan grafis AI",
    tag: "Vision",
  },
  {
    id: "gemini-3.1-flash-image",
    name: "Gemini 3.1 Flash Image",
    category: "image",
    categoryLabel: "Image",
    description: "Generasi dan manipulasi gambar AI dengan resolusi tinggi",
    tag: "Creative",
  },
  {
    id: "gemini-3-pro-image",
    name: "Gemini 3 Pro Image",
    category: "image",
    categoryLabel: "Image",
    description: "Sintesis gambar profesional dengan detail fotorealistis",
    tag: "HD",
  },

  // ── Video (Multimodal Video Processing & Stream) ──
  {
    id: "gemini-omni-1.1-flash",
    name: "Gemini Omni 1.1 Flash",
    category: "video",
    categoryLabel: "Video",
    description: "Analisis video multimodal dan pemahaman konteks dinamis",
    tag: "Video",
  },
  {
    id: "gemini-omni-flash-preview",
    name: "Gemini Omni Flash Preview",
    category: "video",
    categoryLabel: "Video",
    description: "Pemrosesan video realtime dan interaksi visual dinamis",
    tag: "Stream",
  },

  // ── Suara / Audio (TTS, Dialog & Transkripsi) ──
  {
    id: "gemini-3.8-flash-tts",
    name: "Gemini 3.8 Flash TTS",
    category: "audio",
    categoryLabel: "Audio",
    description: "Text-to-Speech berkualitas tinggi dengan intonasi natural",
    tag: "TTS",
  },
  {
    id: "gemini-2.5-flash-preview-tts",
    name: "Gemini 2.5 Flash TTS",
    category: "audio",
    categoryLabel: "Audio",
    description: "Percakapan dialog suara alami dan ekspresif",
    tag: "Voice",
  },
  {
    id: "gemini-3.5-transcribe",
    name: "Gemini 3.5 Transcribe",
    category: "audio",
    categoryLabel: "Audio",
    description: "Transkripsi audio & rekaman suara ke teks berakurasi tinggi",
    tag: "Speech",
  },
];

export const MODELS: string[] = MODEL_CONFIGS.map((m) => m.name);
export const DEFAULT_MODEL = "Gemini 2.5 Flash";
