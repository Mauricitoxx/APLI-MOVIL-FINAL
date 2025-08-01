import { openDB, type IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase | null = null;
const DB_NAME = 'AppDB';
const DB_VERSION = 26; 

export const setupIndexedDB = async (): Promise<void> => {
  console.log('Inicializando BD...');
  if (dbInstance) return;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`DB Upgrade: from ${oldVersion} to ${newVersion}`);

      if (!database.objectStoreNames.contains('Usuario')) {
        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        usuarioStore.createIndex('id', 'id', { unique: true });
      }

      if (!database.objectStoreNames.contains('Nivel')) {
        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });
      }

      if (!database.objectStoreNames.contains('NivelXUsuario')) {
        const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
        nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario');
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }

      if (!database.objectStoreNames.contains('Herramienta')) {
        const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
        herramientaStore.createIndex('IdUsuario', 'IdUsuario');
      }

      if (!database.objectStoreNames.contains('Vida')) {
        const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
        vidaStore.createIndex('IdUsuario', 'IdUsuario');
      }

      if (!database.objectStoreNames.contains('Palabras')) {
        const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        palabrasStore.createIndex('palabra', 'palabra', { unique: true });
      }

      if (oldVersion < 9 && newVersion >= 9 && database.objectStoreNames.contains('NivelXUsuario')) {
        console.log('DB Upgrade: Adding/Recreating unique index for NivelXUsuario (Version 9+ upgrade path)');
        const nivelXUsuarioStore = transaction.objectStore('NivelXUsuario');
        if (nivelXUsuarioStore.indexNames.contains('IdUsuario_IdNivel')) {
          nivelXUsuarioStore.deleteIndex('IdUsuario_IdNivel');
        }
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }
    }
  });

  const insertIfEmpty = async (storeName: string, defaultItems: any[]) => {
    if (!dbInstance) throw new Error("DB no inicializada.");
    const tx = dbInstance.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const count = await store.count();
    if (count === 0) {
      console.log(`Seeding initial data into ${storeName}`);
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
      await tx.done;
    } else {
      console.log(`${storeName} already has ${count} items. Skipping seeding.`);
      try { tx.abort(); } catch(e) {};
    }
  };

  // Insertar datos de prueba si las tablas están vacías
  try {
    const defaultData = {
      Usuario: [
        { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
        { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
      ],
      Nivel: [{ recompensa: 100 }, { recompensa: 200 }],
      NivelXUsuario: [
        { puntaje: 10, tiempo: 60, palabra: 'sol', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 },
        { puntaje: 80, tiempo: 20, palabra: 'mar', intento: 1, recompensa_intento: '30', IdUsuario: 2, IdNivel: 2 }
      ],
      Herramienta: [
        { tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
        { tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
        { tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
        { tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
      ],
      Vida: [
        { cantidad: 5, IdUsuario: 1 },
        { cantidad: 3, IdUsuario: 2 }
      ],
      Palabras: [
        { palabra: 'ejemplo' }, { palabra: 'prueba' }, { palabra: 'sol' }, { palabra: 'mar' }, { palabra: 'pez' },
        { palabra: 'luz' }, { palabra: 'ojo' }, { palabra: 'voz' }, { palabra: 'te' }, { palabra: 'pan' },
        { palabra: 'rio' }, { palabra: 'sal' }, { palabra: 'casa' }, { palabra: 'luna' }, { palabra: 'flor' },
        { palabra: 'toro' }, { palabra: 'piel' }, { palabra: 'cine' }, { palabra: 'tren' }, { palabra: 'mesa' },
        { palabra: 'vino' }, { palabra: 'cielo' }, { palabra: 'perro' }, { palabra: 'planta' }, { palabra: 'nube' },
        { palabra: 'sueño' }, { palabra: 'papel' }, { palabra: 'reloj' }, { palabra: 'playa' }, { palabra: 'viento' },
        { palabra: 'amigo' }, { palabra: 'bosque' }, { palabra: 'calor' }, { palabra: 'camino' }, { palabra: 'tierra' },
        { palabra: 'mirar' }, { palabra: 'mundo' }, { palabra: 'comida' }, { palabra: 'musica' }, { palabra: 'banana' },
        { palabra: 'arboles' }, { palabra: 'abanico' }, { palabra: 'caracol' }, { palabra: 'ventana' }, { palabra: 'maleta' },
        { palabra: 'guitarra' }, { palabra: 'espejo' }, { palabra: 'cuchara' }, { palabra: 'zapato' }, { palabra: 'camisa' },
        { palabra: 'telefono' }, { palabra: 'computadora' }, { palabra: 'bicicleta' }, { palabra: 'pelota' }, { palabra: 'juego' },
        { palabra: 'hermoso' }, { palabra: 'valiente' }, { palabra: 'antiguo' }, { palabra: 'aprender' }, { palabra: 'creativo' },
        { palabra: 'resolver' }, { palabra: 'invierno' }, { palabra: 'mariposa' },
      ]
    };
    for (const storeName in defaultData) {
      await insertIfEmpty(storeName, defaultData[storeName]);
    }
    console.log("Initial data seeding complete.");
  } catch (error) {
    console.error("Error during initial data seeding:", error);
  }
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbInstance) {
    await setupIndexedDB();
    if (!dbInstance) {
      throw new Error('La base de datos no está inicializada y el intento de configuración falló.');
    }
  }
  return dbInstance;
};