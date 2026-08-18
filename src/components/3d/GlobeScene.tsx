import { useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import { CDN } from "../../data/cdn";

const COUNTRIES = [
  { lat: -1.9403, lng: 29.8739 }, // Rwanda
  { lat: 51.5072, lng: -0.1276 }, // England
  { lat: 35.1264, lng: 33.4299 }, // Cyprus
];

export function GlobeScene({ lat, lng }: { lat?: number; lng?: number }) {
  const globeRef = useRef<any>(null);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().enableZoom = false;
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  useEffect(() => {
    const safeLat = lat || 0;
    const safeLng = lng || 0;

    if (globeRef.current && (safeLat !== 0 || safeLng !== 0)) {
      const controls = globeRef.current.controls();

      // 1. THE FLICK: Crank the rotation speed up to ~3 orbits per second
      // and pull the camera back so we can watch it spin.
      controls.autoRotate = true;
      controls.autoRotateSpeed = 180; 
      globeRef.current.pointOfView({ altitude: 3.2 }, 600);

      // 2. THE CATCH: After exactly 1 second of rapid spinning, 
      // reset the speed and swoop the camera down to the exact country.
      const timeoutId = setTimeout(() => {
        controls.autoRotateSpeed = 0.5; 
        globeRef.current.pointOfView({ lat: safeLat, lng: safeLng, altitude: 2.0 }, 1400);
      }, 1000); 

      // Cleanup prevents glitches if the user scrolls super fast
      return () => clearTimeout(timeoutId);
    }
  }, [lat, lng]);

  return (
    <div 
      className="drop-shadow-[0_0_40px_rgba(139,101,8,0.25)] rounded-full overflow-hidden" 
      style={{ width: 420, height: 420 }}
    >
      <Globe
        ref={globeRef}
        width={420}
        height={420}
        backgroundColor="rgba(0,0,0,0)"
        
        // Updated to explicitly match your exact file name
        globeImageUrl={`${CDN}/images/pirate-map.jpeg`} 
        
        pointsData={COUNTRIES}
        pointAltitude={0.02}
        pointRadius={(d: any) => (d.lat === lat && d.lng === lng ? 1.4 : 0.6)}
        pointColor={() => "#5D4037"} 
        
        ringsData={lat && lng ? [{ lat, lng }] : []}
        ringColor={() => "#8D6E63"} 
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}

        atmosphereColor="#C5A059"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}