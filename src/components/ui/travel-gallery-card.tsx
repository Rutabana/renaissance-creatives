import MuxPlayer from "@mux/mux-player-react";

interface TravelGalleryCardProps {
  playbackId: string;
  className?: string;
  width?: number;
  height?: number;
}

export function TravelGalleryCard({
  playbackId,
  className = "",
  width = 240,
  height = 320,
}: TravelGalleryCardProps) {
  return (
    <div
      className={`absolute z-40 overflow-hidden rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/5 backdrop-blur-sm ${className}`}
      style={{ width, height }}
    >
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay="muted"
        loop
        muted
        playsInline
        disableTracking
        style={{
          '--controls': 'none',
          '--media-object-fit': 'cover',
          '--media-object-position': 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0
        } as any} 
      />
    </div>
  );
}