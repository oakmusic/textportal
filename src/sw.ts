/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { saveSharedItem } from './utils/sharedStore';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept Web Share Target POST request
  if (event.request.method === 'POST' && (url.pathname === '/share-target' || url.pathname.endsWith('/share-target'))) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const files = formData.getAll('files') as File[];
          const singleFile = (formData.get('file') || (files.length > 0 ? files[0] : null)) as File | null;
          const title = (formData.get('title') as string) || '';
          const text = (formData.get('text') as string) || '';
          const shareUrl = (formData.get('url') as string) || '';

          await saveSharedItem({
            file: singleFile || undefined,
            fileName: singleFile?.name,
            fileType: singleFile?.type,
            fileSize: singleFile?.size,
            title,
            text,
            url: shareUrl,
            timestamp: Date.now(),
          });

          return Response.redirect('/send?shared=1', 303);
        } catch (err) {
          console.error('[SW] Error handling share target:', err);
          return Response.redirect('/send', 303);
        }
      })()
    );
  }
});
