export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((res, rej) => {
      document.execCommand('copy') ? res(true) : rej();
      textArea.remove();
    });
  } catch (err) {
    console.error('Failed to copy', err);
    return false;
  }
}

export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.isSecureContext || typeof ClipboardItem === 'undefined') {
      return false;
    }

    const fetchImageAsPng = async (): Promise<Blob> => {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      if (blob.type === 'image/png') {
        return blob;
      }
      
      return new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to convert image'));
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    };

    const blobPromise = fetchImageAsPng();

    try {
      // Safari requires the Promise to be passed directly to ClipboardItem
      // This ensures navigator.clipboard.write is called synchronously
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blobPromise
        })
      ]);
      return true;
    } catch (e: any) {
      // Firefox does not support Promises in ClipboardItem yet, but its user gesture token
      // survives the await. We catch the synchronous TypeError and try the fallback.
      const blob = await blobPromise;
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}
