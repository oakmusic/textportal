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
