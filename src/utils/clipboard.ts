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

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    } catch (e) {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const pngBlob = await new Promise<Blob | null>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b), 'image/png');
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      if (pngBlob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob
          })
        ]);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Failed to copy image to clipboard', err);
    return false;
  }
}
