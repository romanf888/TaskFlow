// Image compression utility for TaskFlow Windows
// Compresses base64 data URLs to prevent inflating Firestore documents beyond the 1 MB limit

export async function compressImageDataUrl(
  dataUrl: string, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.75
): Promise<string> {
  // Return non-base64 URLs or small Data URLs directly
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.length < 50000) {
    return dataUrl;
  }

  // Skip SVG Data URLs as they are vector XML
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        // Only return compressed if it actually reduced size
        if (compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      } catch (e) {
        console.warn('[imageCompressor] Compression failed, returning original:', e);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
