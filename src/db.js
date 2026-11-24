const DB_NAME = "mtg-tournament-organizer";
const DB_VERSION = 1;
const EXPORT_VERSION = 1;
// If you add/rename an object store, add it here too so export/import stay in sync.
const STORE_NAMES = ["people", "sessions"];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("people")) {
        db.createObjectStore("people", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(storeName, mode, run) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const request = run(tx.objectStore(storeName));
        tx.oncomplete = () => resolve(request.result);
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function getAllPeople() {
  return withStore("people", "readonly", (store) => store.getAll());
}

export function addPerson(name) {
  return withStore("people", "readwrite", (store) => store.add({ name }));
}

export function deletePerson(id) {
  return withStore("people", "readwrite", (store) => store.delete(id));
}

export function addSession(session) {
  return withStore("sessions", "readwrite", (store) => store.add(session));
}

export function getSession(id) {
  return withStore("sessions", "readonly", (store) => store.get(id));
}

export function putSession(session) {
  return withStore("sessions", "readwrite", (store) => store.put(session));
}

export function deleteSession(id) {
  return withStore("sessions", "readwrite", (store) => store.delete(id));
}

export function getAllSessions() {
  return withStore("sessions", "readonly", (store) => store.getAll());
}

export function exportData() {
  return Promise.all([getAllPeople(), getAllSessions()]).then(([people, sessions]) => ({
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    people,
    sessions,
  }));
}

// Replaces all local data with the contents of a previously exported file.
export function importData(data) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAMES, "readwrite");
        STORE_NAMES.forEach((storeName) => {
          const store = tx.objectStore(storeName);
          store.clear();
          (data[storeName] || []).forEach((record) => store.put(record));
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}
