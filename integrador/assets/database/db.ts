import { openDB, type IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase | null = null;

const DB_NAME = 'AppDB';
const DB_VERSION = 13;

export const setupIndexedDB = async (): Promise<void> => {
  console.log('Inicializando BD...');
  if (dbInstance) return;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {

      if (!database.objectStoreNames.contains('Usuario')) {
        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        usuarioStore.createIndex('id', 'id', { unique: true });
      }

      if (!database.objectStoreNames.contains('Nivel')){
        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });
      }

      if (!database.objectStoreNames.contains('NivelXUsuario')){
        const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
        nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario');
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }

      if (!database.objectStoreNames.contains('Herramienta')){
        const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
        herramientaStore.createIndex('IdUsuario', 'IdUsuario');
      }

      if (!database.objectStoreNames.contains('Vida')){
        const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
        vidaStore.createIndex('IdUsuario', 'IdUsuario');
      }

      if (!database.objectStoreNames.contains('Palabras')){
        const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        palabrasStore.createIndex('palabra', 'palabra', { unique: true });
      }
    }
  });

  // Insertar datos de prueba si las tablas están vacías
  const tx = dbInstance.transaction(['Usuario', 'Nivel', 'NivelXUsuario', 'Herramienta', 'Vida', 'Palabras'], 'readwrite');

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
    { puntaje: 10, tiempo: 60, palabra: 'sol', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 },
    { puntaje: 80, tiempo: 20, palabra: 'mar', intento: 1, recompensa_intento: '30', IdUsuario: 2, IdNivel: 2 }
  ]);

  await insertIfEmpty('Herramienta', [
    { tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
    { tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
  ]);

  await insertIfEmpty('Vida', [{ cantidad: 5, IdUsuario: 1 }, { cantidad: 1, IdUsuario: 2 }]);

  await insertIfEmpty('Palabras', [ 
    { palabra: 'ejemplo' }, { palabra: 'prueba' }, { palabra: 'sol' }, { palabra: 'mar' }, { palabra: 'pez' }, { palabra: 'luz' }, { palabra: 'ojo' }, { palabra: 'voz' }, { palabra: 'te' }, { palabra: 'pan' }, { palabra: 'río' }, 
    { palabra: 'sal' }, { palabra: 'casa' }, { palabra: 'luna' }, { palabra: 'flor' }, { palabra: 'toro' }, { palabra: 'piel' }, { palabra: 'cine' }, { palabra: 'tren' }, { palabra: 'mesa' }, { palabra: 'vino' }, { palabra: 'nube' },
    { palabra: 'cielo' }, { palabra: 'perro' }, { palabra: 'planta' }, { palabra: 'sueño' }, { palabra: 'papel' }, { palabra: 'reloj' }, { palabra: 'playa' }, { palabra: 'amigo' }, { palabra: 'calor' },
    { palabra: 'camino' }, { palabra: 'tierra' }, { palabra: 'mirar' }, { palabra: 'mundo' }, { palabra: 'viento' }, { palabra: 'bosque' },
    { palabra: 'mamá' }, { palabra: 'sofá' }, { palabra: 'café' }, { palabra: 'ratón' }, { palabra: 'avión' }, { palabra: 'compás' }, { palabra: 'jamás' },
    { palabra: 'cantó' }, { palabra: 'lápiz' }, { palabra: 'árbol' }, { palabra: 'bebé' }, { palabra: 'menú' }, { palabra: 'fácil' }, { palabra: 'débil' },
    { palabra: 'allá' }, { palabra: 'inglés' }, { palabra: 'francés' }, { palabra: 'cortó' }, { palabra: 'bastó' },
    { palabra: 'cóndor' }, { palabra: 'papá' }, { palabra: 'régimen' }, { palabra: 'fútbol' },
    { palabra: 'dólar' }, { palabra: 'túnel' }, { palabra: 'límite' },
    { palabra: 'césped' }, { palabra: 'ángel' }, { palabra: 'tórax' }, { palabra: 'éxito' }, { palabra: 'héroe' }, { palabra: 'razón' }, { palabra: 'táctil' },
  ]);
  await tx.done;
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbInstance) {
    throw new Error('La base de datos no está inicializada. Llama a setupIndexedDB() primero.');
  }
  return await dbInstance;
};