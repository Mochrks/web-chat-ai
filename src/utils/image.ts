import type { ImagePart } from "@/types/chat";

export async function fileToGenerativePart(file: File): Promise<ImagePart> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(",")[1];
            resolve({
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function buildImageDataUrl(part: ImagePart): string {
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
}

export function parseBase64Image(
    dataUrl: string
): { mimeType: string; base64Data: string } | null {
    const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
    if (!match) return null;
    const [, mimeType, base64Data] = match;
    return { mimeType, base64Data };
}
