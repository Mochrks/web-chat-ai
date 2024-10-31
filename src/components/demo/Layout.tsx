import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/demo/Sidebar'
import { TextHoverEffect } from '../ui/text-hover-effect'
import { motion, AnimatePresence } from 'framer-motion'
import Ripple from "@/components/ui/ripple";
import { cn } from '@/lib/utils';
import Marquee from '../ui/marquee';

const reviews = [
    {
        name: "Jack",
        username: "@jack",
        body: "I've never seen anything like this before. It's amazing. I love it.",
        img: "https://avatar.vercel.sh/jack",
    },
    {
        name: "Jill",
        username: "@jill",
        body: "I don't know what to say. I'm speechless. This is amazing.",
        img: "https://avatar.vercel.sh/jill",
    },
    {
        name: "John",
        username: "@john",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/john",
    },
    {
        name: "Jane",
        username: "@jane",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jane",
    },
    {
        name: "Jenny",
        username: "@jenny",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/jenny",
    },
    {
        name: "James",
        username: "@james",
        body: "I'm at a loss for words. This is amazing. I love it.",
        img: "https://avatar.vercel.sh/james",
    },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
    img,
    name,
    username,
    body,
}: {
    img: string;
    name: string;
    username: string;
    body: string;
}) => {
    return (
        <figure
            className={cn(
                "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full" width="32" height="32" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{body}</blockquote>
        </figure>
    );
};


export default function Layout({ children }: { children: React.ReactNode }) {
    const [showIntro, setShowIntro] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex h-screen bg-foreground">
            <Sidebar />

            <main className="flex w-full mx-auto  antialiased bg-grid-white/[0.02] relative overflow-hidden">
                <Ripple />
                <AnimatePresence mode="wait">
                    {showIntro ? (
                        <div>
                            <div className="absolute flex h-fulll w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background md:shadow-xl">
                                <Marquee pauseOnHover className="[--duration:20s]">
                                    {firstRow.map((review) => (
                                        <ReviewCard key={review.username} {...review} />
                                    ))}
                                </Marquee>
                                <Marquee reverse pauseOnHover className="[--duration:20s]">
                                    {secondRow.map((review) => (
                                        <ReviewCard key={review.username} {...review} />
                                    ))}
                                </Marquee>
                            </div>
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="flex items-center justify-center h-full"
                            >
                                <TextHoverEffect text="AI TEST" />
                            </motion.div>

                        </div>

                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className=' mx-auto'
                        >
                            {children}
                        </motion.div>

                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}