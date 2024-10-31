import React from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageCircle, Settings } from 'lucide-react'

export default function Sidebar() {
    return (
        <div className="w-[200px] bg-[rgb(23,23,23)] p-4 flex flex-col h-full">
            <Button className="w-full mb-4 text-black rounded-lg" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>
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