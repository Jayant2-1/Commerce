import { useEffect, useRef } from 'react';

export default function AuthVideoBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => {});
    };

    play();
    video.addEventListener('loadeddata', play);
    video.addEventListener('canplay', play);

    return () => {
      video.removeEventListener('loadeddata', play);
      video.removeEventListener('canplay', play);
    };
  }, []);

  return (
    <div className="auth-video-bg" aria-hidden="true">
      <video ref={videoRef} autoPlay muted loop playsInline className="bg-video">
        <source src="/images/16.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
