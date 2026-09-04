import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ParticlesCursorAnimation from "./ParticlesCursorAnimation";

export const HeroScene: React.FC = () => {
  const [isUnmounting, setIsUnmounting] = useState(false);

  useEffect(() => {
    const handleUnmount = () => setIsUnmounting(true);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsUnmounting(true);
      } else {
        setIsUnmounting(false);
      }
    };
    window.addEventListener("beforeunload", handleUnmount);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnmount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1",
        maxHeight: "460px",
        position: "relative",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 35 }}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        }}
        style={{
          width: "100%",
          height: "100%",
          opacity: isUnmounting ? 0 : 1,
          transition: "opacity 0.2s ease",
          background: "#000000",
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ParticlesCursorAnimation />
      </Canvas>
    </div>
  );
};

export default HeroScene;
