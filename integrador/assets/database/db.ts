import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
// ¡IMPORTANTE! Asegúrate de que esta versión sea MAYOR a la última que usaste.
// Por ejemplo, si tu última versión fue 10, pon 11.
const DB_VERSION = 18;

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`DB Upgrade: from ${oldVersion} to ${newVersion}`);

      if (oldVersion < 1) { // Creación inicial de todos los stores
        console.log('DB Upgrade: Creating initial stores (Version 1)');
        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        usuarioStore.createIndex('id', 'id', { unique: true });

        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });

        const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
        nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario');

        const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
        herramientaStore.createIndex('IdUsuario', 'IdUsuario');

        const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
        vidaStore.createIndex('IdUsuario', 'IdUsuario');

        const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        palabrasStore.createIndex('palabra', 'palabra', { unique: true });
      }

      // Asegurar que el índice compuesto único exista para versiones posteriores (ej. desde v9)
      if (oldVersion < 9 && newVersion >= 9 && database.objectStoreNames.contains('NivelXUsuario')) {
          console.log('DB Upgrade: Adding/Recreating unique index for NivelXUsuario (Version 9)');
          const nivelXUsuarioStore = transaction.objectStore('NivelXUsuario');
          if (nivelXUsuarioStore.indexNames.contains('IdUsuario_IdNivel')) {
              nivelXUsuarioStore.deleteIndex('IdUsuario_IdNivel');
          }
          nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }
    }
  });

  const db = await dbPromise;

  const tx = db.transaction(['Usuario', 'Nivel', 'NivelXUsuario', 'Herramienta', 'Vida', 'Palabras'], 'readwrite');

  const insertIfEmpty = async (storeName: string, defaultItems: any[]) => {
    const store = tx.objectStore(storeName);
    const count = await store.count();
    if (count === 0) {
      console.log(`Inserting default items into ${storeName}`);
      for (const item of defaultItems) {
        try {
          await store.add(item);
        } catch (e: any) {
          console.warn(`Could not add item to ${storeName}:`, item, e.name, e.message);
          if (e.name === 'ConstraintError') {
              console.warn(`Likely duplicate key for ${storeName}:`, item);
          }
        }
      }
    } else {
      console.log(`${storeName} already has ${count} items.`);
    }
  };

  await insertIfEmpty('Usuario', [
    { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
    { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
  ]);

  await insertIfEmpty('Nivel', [{ recompensa: 100 }, { recompensa: 200 }]);

  // BLOQUE DE DEPURACIÓN TEMPORAL: NO SE INSERTAN NIVELES COMPLETADOS PARA USUARIOS SEMBRADOS
  // Esto ayuda a aislar si el problema es con `registrarUsuario` o los datos sembrados.
  /*
  await insertIfEmpty('NivelXUsuario', [
    { puntaje: 10, tiempo: 60, palabra: 'ejemplo', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 },
    { puntaje: 20, tiempo: 50, palabra: 'casa', intento: 1, recompensa_intento: '60', IdUsuario: 2, IdNivel: 1 },
    { puntaje: 30, tiempo: 40, palabra: 'luna', intento: 1, recompensa_intento: '70', IdUsuario: 2, IdNivel: 2 },
    { puntaje: 40, tiempo: 30, palabra: 'flor', intento: 1, recompensa_intento: '80', IdUsuario: 2, IdNivel: 3 }
  ]);
  */

  await insertIfEmpty('Herramienta', [
    { tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
    { tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
  ]);

  await insertIfEmpty('Vida', [
    { cantidad: 5, IdUsuario: 1 },
    { cantidad: 3, IdUsuario: 2 }
  ]);

  await insertIfEmpty('Palabras', [
    { palabra: 'ejemplo' }, { palabra: 'prueba' }, { palabra: 'sol' }, { palabra: 'mar' }, { palabra: 'pez' },
    { palabra: 'luz' }, { palabra: 'ojo' }, { palabra: 'voz' }, { palabra: 'te' }, { palabra: 'pan' },
    { palabra: 'rio' }, { palabra: 'sal' }, { palabra: 'casa' }, { palabra: 'luna' }, { palabra: 'flor' },
    { palabra: 'toro' }, { palabra: 'piel' }, { palabra: 'cine' }, { palabra: 'tren' }, { palabra: 'mesa' },
    { palabra: 'vino' }, { palabra: 'cielo' }, { palabra: 'perro' }, { palabra: 'planta' }, { palabra: 'nube' },
    { palabra: 'sueño' }, { palabra: 'papel' }, { palabra: 'reloj' }, { palabra: 'playa' }, { palabra: 'viento' },
    { palabra: 'amigo' }, { palabra: 'bosque' }, { palabra: 'calor' }, { palabra: 'camino' }, { palabra: 'tierra' },
    { palabra: 'mirar' }, { palabra: 'mundo' },
  ]);
  await tx.done;
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    throw new Error('La base de datos no está inicializada. Llama a setupIndexedDB() primero.');
  }
  return await dbPromise;
};