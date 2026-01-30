import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

export default function InputArea() {
    const [input, setInput] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle sending the message here
        // Handle sending the message here
        setInput('')
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex items-end space-x-2">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 min-h-[80px]"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}