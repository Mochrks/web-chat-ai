import React from 'react'
import Sidebar from '@/components/demo/Sidebar'


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-foreground">
            <Sidebar />
            <main className="flex-1  max-w-2xl mx-auto overflow-hidden">
                {children}
            </main>
        </div>
    )
}