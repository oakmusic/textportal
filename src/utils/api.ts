export async function sendText(text: string): Promise<{ code: string; url: string }> {
  const res = await fetch('/.netlify/functions/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send text');
  }
  
  return res.json();
}

export async function receiveText(code: string): Promise<any> {
  const res = await fetch('/.netlify/functions/receive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to receive text');
  }
  
  return res.json();
}

export async function getMessageInfo(code: string): Promise<{ success: boolean; text: string; ttlRemaining: number }> {
  const res = await fetch(`/.netlify/functions/message?code=${encodeURIComponent(code)}`);
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get message info');
  }
  
  return res.json();
}

export async function uploadFile(file: File): Promise<{ code: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/.netlify/functions/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to upload file');
  }

  return res.json();
}
