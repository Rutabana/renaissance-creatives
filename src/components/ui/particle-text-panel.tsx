import { useEffect, useRef } from "react";
import { CDN } from "../../data/cdn";

// --- 1. The Physics Particle Class ---
class TextParticle {
  char: string;
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;

  constructor(char: string, x: number, y: number) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
  }

  update(birds: any[], canvas: HTMLCanvasElement) {
    let dx = 0;
    let dy = 0;
    let distance = 0;

    birds.forEach(bird => {
      const bx = bird.x + bird.size / 2;
      const by = bird.y + bird.size / 2;

      dx = bx - this.x;
      dy = by - this.y;
      distance = Math.sqrt(dx * dx + dy * dy);

      // Kept at 1.5 for a tighter, more cinematic "wind wake"
      const repelRadius = bird.size * 1; 
      
      if (distance < repelRadius) {
        const force = (repelRadius - distance) / repelRadius;
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;

        this.vx -= forceDirectionX * force * 4.5;
        this.vy -= forceDirectionY * force * 4.5;
      }
    });

    const springForce = 0.04; 
    this.vx += (this.originX - this.x) * springForce;
    this.vy += (this.originY - this.y) * springForce;

    const friction = 0.82; 
    this.vx *= friction;
    this.vy *= friction;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.char, this.x, this.y);
  }
}

// --- 2. The React Component ---
export function ParticleTextPanel({ text, isVisible }: { text: string; isVisible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TextParticle[]>([]);
  const birdImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    birdImagesRef.current = [`${CDN}/birds/bird1.png`, `${CDN}/birds/bird2.png`, `${CDN}/birds/bird3.png`].map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !isVisible) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Full Screen Canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 2. THE FIX: DOM Traversal Layout Math
    // Climb the DOM tree to find the exact, unchanging pixel distance 
    // from our text container to the sticky viewport wrapper.
    let offsetX = 0;
    let offsetY = 0;
    let el = container as HTMLElement | null;

    while (el) {
      offsetX += el.offsetLeft;
      offsetY += el.offsetTop;
      el = el.offsetParent as HTMLElement | null;
      // Stop climbing once we hit the sticky section
      if (el && el.classList && el.classList.contains('sticky')) {
        break; 
      }
    }

    // Shift canvas back by that exact offset so it perfectly overlays the screen
    canvas.style.left = `-${offsetX}px`;
    canvas.style.top = `-${offsetY}px`;

    // Grab the actual container width for wrapping text
    const rect = container.getBoundingClientRect();
    const maxWidth = offsetX + rect.width;

    const fontStr = '16px "Times New Roman", serif'; 
    ctx.font = fontStr;
    ctx.textBaseline = 'top';

    particlesRef.current = [];
    const words = text.split(' ');
    
    // Start drawing text at our rock-solid layout coordinates
    let currentX = offsetX;
    let currentY = offsetY;
    const lineHeight = 28;

    words.forEach(word => {
      const wordWidth = ctx.measureText(word + ' ').width;
      
      if (currentX + wordWidth > maxWidth) {
        currentX = offsetX; // Reset to our static left edge
        currentY += lineHeight;
      }
      
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const charWidth = ctx.measureText(char).width;
        particlesRef.current.push(new TextParticle(char, currentX, currentY));
        currentX += charWidth;
      }
      currentX += ctx.measureText(' ').width; 
    });

    let birds = [
      { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, vx: 5, vy: 2, speed: 4.5, size: 120, imgIndex: 0, facesLeftNatively: true, wanderAngle: Math.random() * Math.PI * 2 },
      { x: window.innerWidth * 0.8, y: window.innerHeight * 0.5, vx: -4, vy: 3, speed: 5.5, size: 65, imgIndex: 1, facesLeftNatively: false, wanderAngle: Math.random() * Math.PI * 2 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.8, vx: 2, vy: -5, speed: 12.0, size: 45, imgIndex: 2, facesLeftNatively: false, wanderAngle: Math.random() * Math.PI * 2 },
    ];

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontStr; 
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      
      birds.forEach(bird => {
        // Smooth Wander Steering
        bird.wanderAngle += (Math.random() - 0.5) * 0.3; 
        bird.vx += Math.cos(bird.wanderAngle) * 0.6; 
        bird.vy += Math.sin(bird.wanderAngle) * 0.6;

        // Center Gravity Bias
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const centerPull = 0.002; 
        bird.vx += (centerX - bird.x) * centerPull;
        bird.vy += (centerY - bird.y) * centerPull;

        // Boundary Steering
        const margin = 100; 
        const turnForce = 0.6; 
        if (bird.x < margin) bird.vx += turnForce;
        if (bird.x > canvas.width - margin) bird.vx -= turnForce;
        if (bird.y < margin) bird.vy += turnForce;
        if (bird.y > canvas.height - margin) bird.vy -= turnForce;

        // Normalize Vector
        let currentSpeed = Math.sqrt(bird.vx * bird.vx + bird.vy * bird.vy);
        if (currentSpeed === 0) currentSpeed = 0.01; 
        bird.vx = (bird.vx / currentSpeed) * bird.speed;
        bird.vy = (bird.vy / currentSpeed) * bird.speed;

        bird.x += bird.vx;
        bird.y += bird.vy;

        // Calculate Rotation & Draw
        let angle = Math.atan2(bird.vy, bird.vx);

        const img = birdImagesRef.current[bird.imgIndex];
        if (img && img.complete && img.naturalWidth !== 0) {
           ctx.save();
           ctx.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);
           ctx.rotate(angle);

           if (Math.abs(angle) > Math.PI / 2) {
               ctx.scale(1, -1);
           }
           if (bird.facesLeftNatively) {
               ctx.scale(-1, 1);
           }

           ctx.drawImage(img, -bird.size / 2, -bird.size / 2, bird.size, bird.size);
           ctx.restore();
        }
      });

      particlesRef.current.forEach(particle => {
        particle.update(birds, canvas);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, isVisible]);

  return (
    <div ref={containerRef} className="relative w-full mt-6" style={{ minHeight: "300px" }}>
      <canvas 
        ref={canvasRef} 
        className="absolute pointer-events-none z-40"
      />
    </div>
  );
}