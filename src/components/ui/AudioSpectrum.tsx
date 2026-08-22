import React, { useEffect, useRef } from 'react';

interface AudioSpectrumProps {
  isListening: boolean;
}

export function AudioSpectrum({ isListening }: AudioSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (isListening) {
      startSpectrum();
    } else {
      stopSpectrum();
    }

    return () => stopSpectrum();
  }, [isListening]);

  const startSpectrum = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; 
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      draw();
    } catch (err) {
      console.error("Error accessing microphone for spectrum", err);
    }
  };

  const stopSpectrum = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisual = () => {
      requestRef.current = requestAnimationFrame(drawVisual);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 65; // Matches the size of the mic button (112px / 2 = 56px, plus some padding)
      const barsToDraw = 60; // Number of bars around the circle
      const barWidth = 4;
      const maxBarHeight = 80; // How far the bars shoot out

      for (let i = 0; i < barsToDraw; i++) {
        // We map the 60 bars to the lower frequency spectrum (usually more active with voice)
        // We'll wrap the data so it mirrors on both sides for symmetry, or just wrap around
        // To make it symmetric (left and right):
        const dataIndex = Math.floor(Math.abs(i - (barsToDraw / 2)) * (bufferLength * 0.4 / (barsToDraw / 2)));
        const value = dataArray[dataIndex];
        
        const barHeight = (value / 255) * maxBarHeight;

        const angle = (i * (Math.PI * 2)) / barsToDraw;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Reddish color to match the mic button
        const intensity = value / 255;
        const alpha = 0.2 + intensity * 0.8;
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        
        // Draw bar extending outwards
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-barWidth / 2, radius, barWidth, Math.max(4, barHeight), [2, 2, 2, 2]);
        } else {
            ctx.fillRect(-barWidth / 2, radius, barWidth, Math.max(4, barHeight));
        }
        ctx.fill();
        
        ctx.restore();
      }
    };

    drawVisual();
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={320} 
      height={320} 
      className="w-[320px] h-[320px] pointer-events-none"
    />
  );
}
