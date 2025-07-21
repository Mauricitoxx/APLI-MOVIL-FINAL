import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
const DB_VERSION = 2;

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('Usuario')) {
        const store = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        store.createIndex('mail', 'mail', { unique: true });
        store.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
      }
      if (!database.objectStoreNames.contains('Nivel')) {
        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('NivelXUsuario')) {
        database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('Herramienta')) {
        database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('Vida')) {
        database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('Palabras')) {
        const store = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        store.createIndex('palabra', 'palabra', { unique: true });
      }
      const expectedStores = ['Usuario', 'Nivel', 'NivelXUsuario', 'Herramienta', 'Vida', 'Palabras'];
        for (const storeName of expectedStores) {
          if (!database.objectStoreNames.contains(storeName)) {
            throw new Error('Falta el objectStore: ${storeName}');
          }
        }
    }
  });

  const db = await dbPromise;

  // Insertar datos de prueba si las tablas están vacías
  const tx = db.transaction(['Usuario', 'Nivel', 'NivelXUsuario', 'Herramienta', 'Vida', 'Palabras'], 'readwrite');

  const insertIfEmpty = async (storeName: string, defaultItems: any[]) => {
    const store = tx.objectStore(storeName);
    const count = await store.count();
    if (count === 0) {
      for (const item of defaultItems) await store.add(item);
    }
  };

  await insertIfEmpty('Usuario', [
    { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
    { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
  ]);

  await insertIfEmpty('Nivel', [{ recompensa: 100 }, { recompensa: 200 }]);
  await insertIfEmpty('NivelXUsuario', [
    { puntaje: 10, tiempo: 60, palabra: 'ejemplo', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 }
  ]);
  await insertIfEmpty('Herramienta', [{ tipo: 'pista', cantidad: 3, IdUsuario: 1 }]);
  await insertIfEmpty('Vida', [{ cantidad: 5, IdUsuario: 1 }]);
  await insertIfEmpty('Palabras', [{ palabra: 'ejemplo' }, { palabra: 'prueba' }]);

  await tx.done;
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    throw new Error('La base de datos no está inicializada. Llama a setupIndexedDB() primero.');
  }
  return await dbPromise;
};