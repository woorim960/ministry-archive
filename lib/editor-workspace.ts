export type ClientDocument = { clientKey: string; id?: string };

export function serverClientKey(id: string) {
  return `server:${id}`;
}

export function createLocalClientKey() {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `local:${id}`;
}

export function upsertWorkingDocument<T extends ClientDocument>(documents: T[], document: T) {
  const existingIndex = documents.findIndex((item) => item.clientKey === document.clientKey);
  if (existingIndex < 0) return [document, ...documents];
  return documents.map((item, index) => index === existingIndex ? document : item);
}

export function removeWorkingDocument<T extends ClientDocument>(documents: T[], ...clientKeys: string[]) {
  const remove = new Set(clientKeys);
  return documents.filter((item) => !remove.has(item.clientKey));
}

export function mergeSavedDocuments<T extends ClientDocument>(documents: T[], document: T) {
  return [document, ...documents.filter((item) => item.id !== document.id)];
}

export function buildSidebarDocuments<T extends ClientDocument>(workingDocuments: T[], savedDocuments: T[]) {
  const workingByKey = new Map(workingDocuments.map((item) => [item.clientKey, item]));
  return {
    working: workingDocuments.filter((item) => !item.id),
    saved: savedDocuments.map((savedDocument) => {
      const workingDocument = workingByKey.get(savedDocument.clientKey);
      return {
        document: workingDocument || savedDocument,
        savedDocument,
        hasUnsavedChanges: Boolean(workingDocument),
      };
    }),
  };
}
