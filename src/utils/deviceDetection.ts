import { useState, useEffect } from 'react';

/**
 * Detekuje, zda je zařízení mobilní telefon (ne tablet)
 * Tablety obvykle mají šířku >= 768px, telefony < 768px
 */
export function isMobilePhone(): boolean {
  // Zkontrolovat šířku obrazovky
  const width = window.innerWidth;
  
  // Telefony obvykle mají šířku < 768px
  // Tablety obvykle mají šířku >= 768px
  if (width >= 768) {
    return false; // Tablet nebo desktop
  }
  
  // Pro zařízení < 768px zkontrolovat, zda je to skutečně telefon
  // Můžeme použít další indikátory:
  // - Touch support (telefony i tablety mají touch)
  // - User agent (méně spolehlivé)
  // - Aspect ratio (telefony jsou obvykle užší)
  
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const aspectRatio = window.innerWidth / window.innerHeight;
  
  // Pokud má touch a je to úzké zařízení (aspect ratio < 1.5), pravděpodobně telefon
  // Tablety obvykle mají aspect ratio blíže k 1 nebo větší než 1.5
  if (hasTouch && aspectRatio < 1.5 && width < 768) {
    return true; // Pravděpodobně telefon
  }
  
  // Pokud nemá touch, není to mobilní zařízení
  if (!hasTouch) {
    return false;
  }
  
  // Pro zařízení s touch a šířkou < 768px předpokládáme telefon
  return width < 768;
}

/**
 * Hook pro React komponenty - detekuje mobilní telefon s reakcí na změny velikosti okna
 */
export function useIsMobilePhone(): boolean {
  const [isMobile, setIsMobile] = useState(() => isMobilePhone());
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobilePhone());
    };
    
    // Zkontrolovat ihned
    checkDevice();
    
    // Zkontrolovat při změně velikosti okna
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    // Fallback: zkontrolovat po malé prodlevě (některá zařízení potřebují čas)
    const timeout1 = setTimeout(checkDevice, 100);
    const timeout2 = setTimeout(checkDevice, 500);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);
  
  return isMobile;
}

