import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
// IMPORTANT: Make sure this version is GREATER than the last one you used.
// If your current DB version in browser dev tools is 12, set this to 13.
const DB_VERSION = 20; // <--- !!! C H A N G E   T H I S   N U M B E R !!!

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`DB Upgrade: from ${oldVersion} to ${newVersion}`);

      if (oldVersion < 1) {
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
};

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    await setupIndexedDB();
    if (!dbPromise) {
      throw new Error('La base de datos no está inicializada y el intento de configuración falló.');
    }
  }
  return await dbPromise;
};

export const seedInitialData = async (): Promise<void> => {
  try {
    const db = await getDB();

    const insertIfEmpty = async (storeName: string, defaultItems: any[]) => {
      const tx = db.transaction(storeName, 'readwrite');
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
        // Note: For a 'readwrite' transaction that doesn't modify, calling abort is not strictly needed
        // but it's good practice to ensure it's not left hanging if no operations complete.
        // For 'readonly' transactions, it would automatically complete.
        try { tx.abort(); } catch(e) {/* ignore */};
      }
    };

    await insertIfEmpty('Usuario', [
      { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
      { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
    ]);

    await insertIfEmpty('Nivel', [{ recompensa: 100 }, { recompensa: 200 }]);

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

    console.log("Initial data seeding complete.");
  } catch (error) {
    console.error("Error during initial data seeding:", error);
  }
};


export const obtenerPalabraLongitud = async (longitud: number): Promise<string | null> => {
  const db = await getDB();
  const tx = db.transaction('Palabras', 'readonly');
  const store = tx.objectStore('Palabras');

  const todasLasPalabras = await store.getAll();
  await tx.done;

  const palabrasFiltradas = todasLasPalabras.filter(p => p.palabra.length === longitud);

  if (palabrasFiltradas.length === 0) {
    console.warn(`query.ts: No se encontraron palabras con longitud ${longitud}.`);
    return null;
  }

  const indiceAleatorio = Math.floor(Math.random() * palabrasFiltradas.length);
  return palabrasFiltradas[indiceAleatorio].palabra;
}

export const validarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  const db = await getDB();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const allUsers = await store.getAll();
  await tx.done;

  const user = allUsers.find(
    user => user.mail === email && user.contrasena === password
  );

  return user ?? null;
};

export const registrarUsuario = async (nuevoUsuario: Omit<Usuario, 'id'>): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDB();

  const tempTx = db.transaction('Usuario', 'readonly');
  const usuarioStore = tempTx.objectStore('Usuario');

  const mailIndex = usuarioStore.index('mail');
  const usernameIndex = usuarioStore.index('nombre_usuario');

  const [existeMail, existeUsername] = await Promise.all([
    mailIndex.get(nuevoUsuario.mail),
    usernameIndex.get(nuevoUsuario.nombre_usuario)
  ]);
  await tempTx.done;

  if (existeMail) {
    return { ok: false, error: 'El correo ya está registrado' };
  }

  if (existeUsername) {
    return { ok: false, error: 'El nombre de usuario ya está en uso' };
  }

  const palabraInicial = await obtenerPalabraLongitud(3);
  if (!palabraInicial) {
    return { ok: false, error: 'No hay palabras con esa longitud en la base de datos para el nivel inicial' };
  }

  const tx = db.transaction(['Usuario', 'NivelXUsuario', 'Herramienta', 'Vida'], 'readwrite');

  try {
    const usuarioStore = tx.objectStore('Usuario');
    const nivelXUsuarioStore = tx.objectStore('NivelXUsuario');
    const herramientaStore = tx.objectStore('Herramienta');
    const vidaStore = tx.objectStore('Vida');

    const idUsuario = await usuarioStore.add({
      ...nuevoUsuario,
      racha: 0,
      monedas: 0
    });

    await vidaStore.add({
      cantidad: 3,
      IdUsuario: idUsuario
    });

    await herramientaStore.add({
      tipo: 'pasa',
      cantidad: 0,
      IdUsuario: idUsuario
    });

    await herramientaStore.add({
      tipo: 'ayuda',
      cantidad: 0,
      IdUsuario: idUsuario
    });

    await nivelXUsuarioStore.add({
      puntaje: 0,
      tiempo: 60,
      palabra: palabraInicial,
      intento: 0,
      recompensa_intento: '0',
      IdUsuario: idUsuario,
      IdNivel: 1
    });

    await tx.done;
    console.log(`query.ts: Usuario ${idUsuario} registrado y nivel 1 inicializado.`);
    return { ok: true };
  } catch (error: any) {
    console.error('Error en transacción de registro:', error);
    try { tx.abort(); } catch (abortError) { console.error("Error al intentar abortar transacción:", abortError); }
    return { ok: false, error: 'Error inesperado al registrar usuario' };
  }
};


export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
}

export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  const db = await getDB();
  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');
  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
}

export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  const db = await getDB();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const usuario = await store.get(id);
  await tx.done;
  return usuario ?? undefined;
}

export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readonly');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario')
  const levels = await index.getAll(idUsuario);
  await tx.done;
  console.log("query.ts: getNivelesXUsuario - Niveles obtenidos (con ID de IndexedDB?):", levels);
  return levels;
}


export const insertNivelXUsuario = async (idUsuario: number, IdNivel: number, palabra: string): Promise<NivelXUsuario | null> => {
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');
  
  try {
    const existingRecord = await store.index('IdUsuario_IdNivel').get([idUsuario, IdNivel]);
    if (existingRecord) {
      console.log(`query.ts: insertNivelXUsuario - NivelXUsuario (IdUsuario: ${idUsuario}, IdNivel: ${IdNivel}) ya existe. Retornando existente.`);
      await tx.done;
      return existingRecord;
    }
  } catch (error: any) {
    console.error(`query.ts: Error al buscar nivel existente antes de insertar (Index search):`, error.name, error.message);
    // This catch block is important for the NotFoundError. If the index is not found,
    // this error happens *before* trying to add, so we should return null or re-throw.
    // Given the context, we'll return null to indicate failure to get/create.
    await tx.done; // Ensure transaction finishes
    return null; 
  }

  const nuevoRegistro: Omit<NivelXUsuario, 'id'> = { // Explicitly omit 'id' for auto-increment
    puntaje: 0,
    tiempo: 60,
    palabra,
    intento: 0,
    recompensa_intento: '0',
    IdUsuario: idUsuario,
    IdNivel: IdNivel,
  };

  try {
    const idGenerado = await store.add(nuevoRegistro);
    const insertedRecord = { ...nuevoRegistro, id: idGenerado as number };
    await tx.done;
    console.log(`query.ts: insertNivelXUsuario - Nuevo NivelXUsuario (IdNivel: ${IdNivel}) creado para usuario ${idUsuario}. ID de IndexedDB: ${idGenerado}`);
    return insertedRecord;
  } catch (error: any) {
    console.error(`query.ts: Error al añadir nuevo NivelXUsuario ${IdNivel} para usuario ${idUsuario} (Add operation):`, error.name, error.message, error);
    try { tx.abort(); } catch (abortError) { console.error("Error al intentar abortar transacción:", abortError); }
    return null;
  }
}

export const updateNivelXUsuario = async (nivelActualizado: NivelXUsuario): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');

  console.log("query.ts: updateNivelXUsuario - Recibido para actualizar:", nivelActualizado);
  
  try {
      if (typeof nivelActualizado.id === 'number' && nivelActualizado.id !== null) {
        console.log(`query.ts: updateNivelXUsuario - Actualizando por ID directo: ${nivelActualizado.id}`);
        await store.put(nivelActualizado);
        console.log(`query.ts: updateNivelXUsuario - Nivel actualizado por ID directo (IndexedDB ID: ${nivelActualizado.id}, IdNivel: ${nivelActualizado.IdNivel})`);
      } else {
          console.log(`query.ts: updateNivelXUsuario - ID de IndexedDB no proporcionado. Buscando por IdUsuario_IdNivel para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}.`);
          const index = store.index('IdUsuario_IdNivel');
          const existingRecord = await index.get([nivelActualizado.IdUsuario, nivelActualizado.IdNivel]);

          if (existingRecord) {
              const updatedEntry = { ...existingRecord, ...nivelActualizado, id: existingRecord.id };
              await store.put(updatedEntry);
              console.log(`query.ts: updateNivelXUsuario - Nivel encontrado y actualizado por IdUsuario_IdNivel (IndexedDB ID: ${existingRecord.id}, IdNivel: ${nivelActualizado.IdNivel})`);
          } else {
              console.error(`query.ts: updateNivelXUsuario - ERROR: No se encontró registro existente para actualizar (ni por ID ni por IdUsuario_IdNivel) para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}. ¡Esto indica un problema de flujo: un nivel debería haber sido insertado antes de intentar actualizarlo!`);
          }
      }
  } catch (error: any) {
      console.error('query.ts: updateNivelXUsuario - Error en la transacción o operación:', error.name, error.message, error);
      try { tx.abort(); } catch (abortError) { console.error("Error al intentar abortar transacción:", abortError); }
  } finally {
      await tx.done;
  }
};


export const insertNivel = async (nivel: Nivel): Promise<number> => {
  const db = await getDB();
  const id = await db.add('Nivel', nivel);
  return id;
};

export const getNiveles = async (): Promise<Nivel[]> => {
  const db = await getDB();
  const levels = await db.getAll('Nivel');
  return levels;
};

export const insertHerramienta = async (herramienta: Herramienta): Promise<number> => {
  const db = await getDB();
  const id = await db.add('Herramienta', herramienta);
  return id;
};

export const insertVida = async (vida: Vida): Promise<number> => {
  const db = await getDB();
  const id = await db.add('Vida', vida);
  return id;
};

export const insertPalabra = async (palabra: Palabras): Promise<number> => {
  const db = await getDB();
  const id = await db.add('Palabras', palabra);
  return id;
};

export const getPalabras = async (): Promise<Palabras[]> => {
  const db = await getDB();
  const palabras = await db.getAll('Palabras');
  return palabras;
};