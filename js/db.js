const DB_NAME = 'TaskFlowDB';
const DB_VERSION = 1;
let dbInstance = null;

export const DB = {
    init: () => new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject('IndexedDB tidak didukung.');
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'username' });
            if (!db.objectStoreNames.contains('session')) db.createObjectStore('session', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('tasks')) {
                const ts = db.createObjectStore('tasks', { keyPath: 'id' });
                ts.createIndex('userId', 'userId', { unique: false });
                ts.createIndex('status', 'status', { unique: false });
            }
            if (!db.objectStoreNames.contains('activity')) {
                const as = db.createObjectStore('activity', { keyPath: 'id' });
                as.createIndex('userId', 'userId', { unique: false });
            }
            if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
        };
        request.onsuccess = (e) => { dbInstance = e.target.result; resolve(dbInstance); };
        request.onerror = (e) => reject(e.target.errorCode);
    }),
    add: (store, data) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readwrite');
        const req = tx.objectStore(store).add(data);
        req.onsuccess = () => res(data);
        req.onerror = () => rej(req.error);
    }),
    put: (store, data) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readwrite');
        const req = tx.objectStore(store).put(data);
        req.onsuccess = () => res(data);
        req.onerror = () => rej(req.error);
    }),
    get: (store, key) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    }),
    getAll: (store) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    }),
    delete: (store, key) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readwrite');
        const req = tx.objectStore(store).delete(key);
        req.onsuccess = () => res(key);
        req.onerror = () => rej(req.error);
    }),
    clear: (store) => new Promise((res, rej) => {
        const tx = dbInstance.transaction(store, 'readwrite');
        const req = tx.objectStore(store).clear();
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
    })
};