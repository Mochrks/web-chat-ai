import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMessageProps {
    content: string;
}

export const MessageFormatter: React.FC<FormattedMessageProps> = ({ content }) => {
    return (
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};
