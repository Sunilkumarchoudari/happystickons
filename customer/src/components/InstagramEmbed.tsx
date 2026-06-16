"use client";
import { useEffect } from 'react';

export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    // If the widget script is already loaded, process the embed immediately
    const instgrm = (window as any).instgrm;
    if (instgrm && instgrm.Embeds) {
      try {
        instgrm.Embeds.process();
      } catch (e) {
        console.error('Failed to process Instagram embed', e);
      }
    } else {
      // Ensure script is loaded exactly once
      let script = document.getElementById('instagram-embed-script') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      }
      
      const handleLoad = () => {
        const instgrmObj = (window as any).instgrm;
        if (instgrmObj && instgrmObj.Embeds) {
          try {
            instgrmObj.Embeds.process();
          } catch (e) {
            console.error('Failed to process Instagram embed on load', e);
          }
        }
      };

      script.addEventListener('load', handleLoad);
      return () => {
        script.removeEventListener('load', handleLoad);
      };
    }
  }, [url]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
      {/* Invisible link overlay to make the whole post clickable and redirect to origin */}
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'block' }}
        title="View Reel on Instagram"
      ></a>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`${url}?utm_source=ig_embed&amp;utm_campaign=loading`}
          data-instgrm-version="14"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: 'var(--glass-shadow)',
            margin: '1px',
            maxWidth: '320px',
            minWidth: '320px',
            padding: '0',
            width: '100%',
            fontFamily: 'var(--font-quicksand), sans-serif'
          }}
        >
          {/* Beautiful Fallback Card while Instagram script compiles */}
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ backgroundColor: 'var(--accent)', borderRadius: '50%', height: '40px', width: '40px', marginRight: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '1.2rem' }}>
                📸
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ backgroundColor: 'var(--secondary)', borderRadius: '4px', height: '14px', marginBottom: '6px', width: '120px', opacity: 0.6 }}></div>
                <div style={{ backgroundColor: 'var(--accent)', borderRadius: '4px', height: '12px', width: '80px', opacity: 0.5 }}></div>
              </div>
            </div>
            <div style={{ height: '180px', background: 'rgba(236, 231, 218, 0.6)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', marginBottom: '16px', border: '1px dashed var(--glass-border)' }}>
              🌷
            </div>
            <div style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              View Post on Instagram
            </div>
          </div>
        </blockquote>
      </div>
    </div>
  );
}
