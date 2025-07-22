import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
const DB_VERSION = 6;

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
    // Elimina todos los object stores existentes
    for (const name of Array.from(database.objectStoreNames)) {
      database.deleteObjectStore(name);
    }

    // Crear stores de cero
    const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
    usuarioStore.createIndex('mail', 'mail', { unique: true });
    usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });

    database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });

    const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
    nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario');

    const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
    herramientaStore.createIndex('IdUsuario', 'IdUsuario');

    const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
    vidaStore.createIndex('IdUsuario', 'IdUsuario');

    const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
    palabrasStore.createIndex('palabra', 'palabra', { unique: true });
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

  await insertIfEmpty('Herramienta', [
    { tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
    { tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
  ]);
  await insertIfEmpty('Vida', [{ cantidad: 5, IdUsuario: 1 }]);

  await insertIfEmpty('Palabras', [
    { palabra: 'ejemplo' }, 
    { palabra: 'prueba' },
    { palabra: 'sol' },
    { palabra: 'mar' },
    { palabra: 'pez' },
    { palabra: 'luz' },
    { palabra: 'ojo' },
    { palabra: 'voz' },
    { palabra: 'te' },
    { palabra: 'pan' },
    { palabra: 'rio' },
    { palabra: 'sal' },
    { palabra: 'casa' },
    { palabra: 'luna' },
    { palabra: 'flor' },
    { palabra: 'toro' },
    { palabra: 'piel' },
    { palabra: 'cine' },
    { palabra: 'tren' },
    { palabra: 'mesa' },
    { palabra: 'vino' },
    { palabra: 'cielo' },
    { palabra: 'perro' },
    { palabra: 'planta' },
    { palabra: 'nube' },
    { palabra: 'sueño' },
    { palabra: 'papel' },
    { palabra: 'reloj' },
    { palabra: 'playa' },
    { palabra: 'viento' },
    { palabra: 'amigo' },
    { palabra: 'bosque' },
    { palabra: 'calor' },
    { palabra: 'camino' },
    { palabra: 'tierra' },
    { palabra: 'mirar' },
    { palabra: 'mundo' },
  ]);
  await tx.done;
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    throw new Error('La base de datos no está inicializada. Llama a setupIndexedDB() primero.');
  }
  return await dbPromise;
};