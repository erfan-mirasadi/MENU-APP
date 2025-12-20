"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function SmartMedia({
  files, // { image_url, animation_url_ios, animation_url_android }
  alt,
  className,
  autoPlay = true,
  isVisible: externalIsVisible = null, // اگر از بیرون کنترل بشه
}) {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const mediaRef = useRef(null);

  const iosUrl = files?.animation_url_ios;
  const androidUrl = files?.animation_url_android;
  const hasVideo = !!(iosUrl || androidUrl);

  // اگر ویزیبیلیتی از بیرون نیومد، خودش محاسبه کنه
  const isVisible =
    externalIsVisible !== null ? externalIsVisible : internalIsVisible;

  useEffect(() => {
    if (!hasVideo || !autoPlay || externalIsVisible !== null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternalIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (mediaRef.current) observer.observe(mediaRef.current);

    return () => observer.disconnect();
  }, [hasVideo, autoPlay, externalIsVisible]);

  if (hasVideo && isVisible) {
    return (
      <div
        ref={mediaRef}
        className={`relative overflow-hidden w-full h-full ${className || ""}`}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain animate-in fade-in duration-700"
        >
          {iosUrl && (
            <source src={iosUrl} type='video/quicktime; codecs="hvc1"' />
          )}
          {androidUrl && <source src={androidUrl} type="video/webm" />}
        </video>
      </div>
    );
  }

  return (
    <div ref={mediaRef} className={`relative w-full h-full ${className || ""}`}>
      <Image
        src={files?.image_url}
        alt={alt || "product"}
        fill
        sizes="(max-width: 768px) 100vw, 300px"
        className="object-contain"
        priority={false}
      />
    </div>
  );
}
