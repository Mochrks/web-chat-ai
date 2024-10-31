import React from 'react';

interface FormattedMessageProps {
    content: string;
}

export const MessageFormatter: React.FC<FormattedMessageProps> = ({ content }) => {
    // Fungsi untuk mengubah teks menjadi paragraf dan list yang terformat
    const formatContent = (text: string) => {
        // Pisahkan berdasarkan baris baru
        const sections = text.split('\n\n');

        return sections.map((section, index) => {
            // Deteksi jika ini adalah judul
            if (section.startsWith('Spring Boot adalah')) {
                return (
                    <h2 key={index} className="text-xl font-bold mb-4">
                        {section}
                    </h2>
                );
            }

            // Deteksi jika ini adalah list dengan angka
            if (section.match(/^\d+\./)) {
                const listItems = section.split(/\d+\.\s+/).filter(Boolean);
                return (
                    <ul key={index} className="list-none space-y-3 mb-4">
                        {listItems.map((item, itemIndex) => {
                            // Proses bold text yang dibungkus dengan **
                            const boldProcessed = item.split(/\*\*(.*?)\*\*/).map((part, partIndex) => {
                                if (partIndex % 2 === 1) {
                                    return <span key={partIndex} className="font-bold">{part}</span>;
                                }
                                return part;
                            });

                            return (
                                <li key={itemIndex} className="flex space-x-2">
                                    <span className="font-bold min-w-[24px]">{itemIndex + 1}.</span>
                                    <span>{boldProcessed}</span>
                                </li>
                            );
                        })}
                    </ul>
                );
            }

            // Paragraf biasa
            return (
                <p key={index} className="mb-4">
                    {section}
                </p>
            );
        });
    };

    return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
            {formatContent(content)}
        </div>
    );
};