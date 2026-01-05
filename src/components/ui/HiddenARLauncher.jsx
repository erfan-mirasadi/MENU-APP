"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

const HiddenARLauncher = forwardRef(({ activeModelUrl }, ref) => {
  const modelViewerRef = useRef(null);
  const [isARActive, setIsARActive] = useState(false);

  useImperativeHandle(ref, () => ({
    launchAR: async () => {
      // 1. Load Library & Configure Decoders
      // We do this BEFORE setting active state to ensure the <model-viewer>
      // element is upgraded with the correct configuration immediately upon mounting.
      try {
        let ModelViewerClass = customElements.get("model-viewer");
        
        if (!ModelViewerClass) {
          const module = await import("@google/model-viewer");
          ModelViewerClass = module.ModelViewerElement;
        }

        // ✅ Config Global Decoders (Idempotent safe)
        if (ModelViewerClass) {
          ModelViewerClass.meshoptDecoderLocation = "/libs/meshopt/meshopt_decoder.js";
          ModelViewerClass.ktx2TranscoderLocation = "/libs/basis/";
        }
      } catch (err) {
        console.error("Failed to load/configure model-viewer:", err);
        return;
      }

      // 2. Activate Component (Render)
      setIsARActive(true);

      // 3. Wait for DOM update & Custom Element upgrade
      setTimeout(() => {
        const viewer = modelViewerRef.current;
        if (viewer?.activateAR) {
          viewer.activateAR();
        } else {
          console.warn("AR launcher ready but activateAR not available yet.");
        }
      }, 100);
    }
  }));

  // Log errors only when active
  useEffect(() => {
    if (!isARActive) return;
    
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleError = (e) => {
      console.error("🔴 AR Error:", e.detail);
    };

    viewer.addEventListener("error", handleError);
    return () => viewer.removeEventListener("error", handleError);
  }, [isARActive]);

  if (!activeModelUrl || !isARActive) return null;

  return (
    <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
      <model-viewer
        ref={modelViewerRef}
        src={activeModelUrl}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        loading="eager" 
        meshopt-decoder-path="/libs/meshopt/meshopt_decoder.module.js"
        ktx2-transcoder-path="/libs/basis/"
      >
      </model-viewer>
    </div>
  );
});

HiddenARLauncher.displayName = "HiddenARLauncher";

export default HiddenARLauncher;