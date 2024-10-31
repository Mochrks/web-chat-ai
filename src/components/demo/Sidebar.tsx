import React from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageCircle, Settings, ChevronRight } from 'lucide-react'
import AnimatedGradientText from '../ui/animated-gradient-text'
import { cn } from '@/lib/utils'

export default function Sidebar() {
    return (
        <div className="w-[200px] bg-[rgb(23,23,23)] p-4 flex flex-col h-full">
            {/* <Button className="w-full mb-4 text-black rounded-lg" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button> */}
            <AnimatedGradientText>
                🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
                <span
                    className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                    )}
                >
                    Introducing For AI TEST
                </span>
                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>
            {/* history */}
            <div className="flex-1 overflow-y-auto">

                {/* <Button variant="ghost" className="w-full justify-start mb-2">
                    <MessageCircle className="mr-2 h-4 w-4" /> Previous Chat 1
                </Button>
                <Button variant="ghost" className="w-full justify-start mb-2">
                    <MessageCircle className="mr-2 h-4 w-4" /> Previous Chat 2
                </Button> */}
            </div>
            <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
        </div>
    )
}