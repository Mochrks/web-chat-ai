import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageCircle, Settings, ChevronRight } from 'lucide-react'
import AnimatedGradientText from '../ui/animated-gradient-text'
import { cn } from '@/lib/utils'
import { RainbowButton } from '../ui/rainbow-button'
import logo from '../../../public/next.svg';
import MetallicPaint, { parseLogoImage } from './ShineLogo'


export default function Sidebar() {
    const [imageData, setImageData] = useState<ImageData | null>(null);

    useEffect(() => {
        async function loadDefaultImage() {
            try {
                const response = await fetch(logo);
                const blob = await response.blob();
                const file = new File([blob], "default.png", { type: blob.type });
                const { imageData } = await parseLogoImage(file);
                setImageData(imageData);
            } catch (err) {
                console.error("Error loading default image:", err);
            }
        }

        loadDefaultImage();
    }, []);


    return (
        <div className="w-[200px] bg-[rgb(23,23,23)] p-4 flex flex-col h-full gap-5">
            {imageData && (
                <div style={{ width: '100%', height: '100vh' }}>
                    <MetallicPaint
                        imageData={imageData}
                        params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }}
                    />
                </div>
            )}
            <AnimatedGradientText>
                🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
                <span
                    className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                    )}
                >
                    Introducing For Pied AI 🚀
                </span>
                <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedGradientText>

            {/* new chat */}
            <Button className="w-full mb-4 text-black rounded-xl" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
            </Button>
            {/* history */}
            <div className="flex-1 overflow-y-auto mt-2">
                <Button variant="ghost" className="w-full justify-start mb-2">
                    <MessageCircle className="mr-2 h-4 w-4" /> Previous Chat 1
                </Button>
                <Button variant="ghost" className="w-full justify-start mb-2">
                    <MessageCircle className="mr-2 h-4 w-4" /> Previous Chat 2
                </Button>
                <Button variant="ghost" className="w-full justify-start mb-2">
                    <MessageCircle className="mr-2 h-4 w-4" /> Previous Chat 3
                </Button>

            </div>

            <RainbowButton>Upgrade Plan</RainbowButton>
        </div>
    )
}