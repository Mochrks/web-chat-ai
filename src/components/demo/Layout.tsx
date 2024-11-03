import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/demo/Sidebar'
import { TextHoverEffect } from '../ui/text-hover-effect'
import { motion, AnimatePresence } from 'framer-motion'
import Ripple from "@/components/ui/ripple";
import { cn } from '@/lib/utils';
import Marquee from '../ui/marquee';
import Image from 'next/image';
import { Button } from '../ui/button';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Key, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { VelocityScroll } from '../ui/scroll-based-velocity';


const reviews = [
    {
        name: "Alice",
        username: "@alice",
        body: "This AI is a game changer! It has transformed my daily tasks into a breeze.",
        img: "https://avatar.vercel.sh/alice",
    },
    {
        name: "Bob",
        username: "@bob",
        body: "Absolutely fantastic! The responses are quick and incredibly accurate.",
        img: "https://avatar.vercel.sh/bob",
    },
    {
        name: "Charlie",
        username: "@charlie",
        body: "I was skeptical at first, but this AI exceeded my expectations. Highly recommend!",
        img: "https://avatar.vercel.sh/charlie",
    },
    {
        name: "Diana",
        username: "@diana",
        body: "The best AI chat experience I've ever had! It feels so human-like.",
        img: "https://avatar.vercel.sh/diana",
    },
    {
        name: "Ethan",
        username: "@ethan",
        body: "Impressive technology! It understands my queries perfectly.",
        img: "https://avatar.vercel.sh/ethan",
    },
    {
        name: "Fiona",
        username: "@fiona",
        body: "I love how intuitive this AI is. It makes conversations so engaging.",
        img: "https://avatar.vercel.sh/fiona",
    },
    {
        name: "George",
        username: "@george",
        body: "A remarkable tool for productivity! It saves me so much time.",
        img: "https://avatar.vercel.sh/george",
    },
    {
        name: "Hannah",
        username: "@hannah",
        body: "This AI is like having a personal assistant. It's simply amazing!",
        img: "https://avatar.vercel.sh/hannah",
    },
    {
        name: "Ian",
        username: "@ian",
        body: "The level of understanding is astonishing. I'm impressed!",
        img: "https://avatar.vercel.sh/ian",
    },
    {
        name: "Julia",
        username: "@julia",
        body: "I can't imagine my life without this AI now. It's that good!",
        img: "https://avatar.vercel.sh/julia",
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
                <Image className="rounded-full" width="32" height="32" alt="" src={img} />
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

    const handleLogout = () => {
        // Here you would typically handle the logout process
        console.log("Logout requested")
    }

    return (
        <div className="flex h-screen bg-foreground">
            {/* sidebar */}
            <div className='hidden lg:block'>
                <Sidebar />
            </div>

            {/* navbar */}
            <div className='flex flex-col w-full h-full'>
                <header className="shadow-sm">
                    <div className='flex flex-row '>
                        <div className="flex w-full py-4 px-4 sm:px-6 lg:px-8 justify-end items-end ">
                            <div className="flex items-center ">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="ml-4 cursor-pointer">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className='bg-[rgb(23,23,23)] text-white'>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span> Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </header>

                {/* main content */}
                <main className="flex h-full w-full mx-auto  antialiased bg-grid-white/[0.02] relative overflow-hidden">
                    <Ripple />
                    <AnimatePresence mode="wait">
                        {showIntro ? (
                            <div className='w-full h-full'>
                                <div className="absolute flex h-fulll w-full flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
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
                                    className="flex items-center justify-center h-full "
                                >
                                    <TextHoverEffect text="Pied AI" />
                                </motion.div>

                            </div>

                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className=' mx-auto w-full h-full'
                            >
                                {children}
                            </motion.div>

                        )}
                    </AnimatePresence>
                </main>
            </div >

        </div >
    )
}