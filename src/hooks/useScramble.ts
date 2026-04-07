import { useEffect, useState } from "react";

export function useScramble(text: string, duration: number = 800) {
    const [displayOutput, setDisplayOutput] = useState(text);
    const chars = "!<>-_\\/[]{}—=+*^?#________";

    useEffect(() => {
        let frame = 0;
        const totalFrames = 30;
        const interval = setInterval(() => {
            const scrambled = text.split('').map((char, i) => {
                if (char === ' ') return ' ';
                // Gradually reveal original characters based on progress
                if (frame / totalFrames > i / text.length) return text[i];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');

            setDisplayOutput(scrambled);
            frame++;
            if (frame >= totalFrames) clearInterval(interval);
        }, duration / totalFrames);

        return () => clearInterval(interval);
    }, [text]);

    return displayOutput;
}
