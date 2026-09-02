/*
========================================
MY GALLERY (SESSION-LOCAL STORAGE)
========================================
* sessionStorage-backed, anonymous, fully local — no backend, no accounts,
* not visible to other users. Cleared when the tab/app closes, unlike
* evaluationStorage.js's localStorage (which is meant to persist). Mirrors
* evaluationStorage.js's readAll/try-catch/JSON-array-under-one-key shape.
*/

const STORAGE_KEY = "algorithmic-pattern-explorer.my-gallery";

function readAll() {
   try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
   } catch {
      return [];
   }
}

function writeAll(items) {
   try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
   } catch {
      // Private-browsing/quota failure: item just won't be there next read.
   }
}

export function getMyGalleryItems() {
   return readAll();
}

export function addMyGalleryItem({ title, entryId, params, thumbnailDataUrl }) {
   const items = readAll();
   const item = {
      id: `${entryId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      entryId,
      params,
      thumbnailDataUrl,
      savedAt: new Date().toISOString(),
   };
   items.push(item);
   writeAll(items);
   return item;
}

export function removeMyGalleryItem(id) {
   writeAll(readAll().filter((item) => item.id !== id));
}
