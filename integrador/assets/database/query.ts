import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type'; // Adjust path if type definitions are elsewhere

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
// IMPORTANT: Make sure this version is GREATER than the last one you used.
// This forces the 'upgrade' function to run, creating/updating your database schema.
// If your previous version was 12, set this to 13. If it was 13, set to 14, etc.
const DB_VERSION = 21; // <--- !!! C H A N G E   T H I S   N U M B E R !!!

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`DB Upgrade: from ${oldVersion} to ${newVersion}`);

      // Version 1: Initial creation of all object stores and their primary indexes.
      if (oldVersion < 1) {
        console.log('DB Upgrade: Creating initial stores (Version 1)');

        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        usuarioStore.createIndex('id', 'id', { unique: true }); // Redundant but harmless

        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });

        const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
        // Essential unique compound index for efficient lookups by user and level.
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
        nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario'); // Single index for querying all levels of a user.

        const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
        herramientaStore.createIndex('IdUsuario', 'IdUsuario');

        const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
        vidaStore.createIndex('IdUsuario', 'IdUsuario');

        const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        palabrasStore.createIndex('palabra', 'palabra', { unique: true });
      }

      // Safeguard: Ensure the unique compound index exists for NivelXUsuario
      // This block runs if upgrading from a version before 9, and the store exists.
      if (oldVersion < 9 && newVersion >= 9 && database.objectStoreNames.contains('NivelXUsuario')) {
          console.log('DB Upgrade: Adding/Recreating unique index for NivelXUsuario (Version 9+ upgrade path)');
          const nivelXUsuarioStore = transaction.objectStore('NivelXUsuario');
          if (nivelXUsuarioStore.indexNames.contains('IdUsuario_IdNivel')) {
              nivelXUsuarioStore.deleteIndex('IdUsuario_IdNivel'); // Delete if exists to recreate with unique:true
          }
          nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }
      // Add more 'if (oldVersion < X && newVersion >= X)' blocks here for future schema changes.
    } // End of upgrade function
  });
}; // End of setupIndexedDB function

// Helper function to get the database instance.
// It will ensure setupIndexedDB is called if dbPromise is null.
export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    await setupIndexedDB(); // Attempt to set up if not already done
    if (!dbPromise) { // If it's still null after attempt, setup failed
      throw new Error('La base de datos no está inicializada y el intento de configuración falló.');
    }
  }
  return await dbPromise;
};

// --- Data Seeding Function ---
// This function should be called ONCE at application startup,
// typically within a top-level useEffect in App.tsx or similar initialization logic.
// It uses its own transactions to avoid issues with the upgrade transaction.
export const seedInitialData = async (): Promise<void> => {
  try {
    const db = await getDB(); // Ensure DB is initialized

    // Helper for inserting if store is empty
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
        await tx.done; // Ensure this transaction completes
      } else {
        console.log(`${storeName} already has ${count} items. Skipping seeding.`);
        // For 'readwrite' transactions that don't perform writes, it's safer to abort to avoid hangs.
        try { tx.abort(); } catch(e) {/* ignore */};
      }
    };

    await insertIfEmpty('Usuario', [
      { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
      { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
    ]);

    await insertIfEmpty('Nivel', [{ recompensa: 100 }, { recompensa: 200 }]);

    // NivelXUsuario is intentionally NOT seeded here with completed levels for default users.
    // It's expected to be populated by the 'registrarUsuario' function for new users
    // and by 'insertNivelXUsuario'/'updateNivelXUsuario' during gameplay.

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


// --- CRUD and Business Logic Functions ---

// Seleccion de Palabras
export const obtenerPalabraLongitud = async (longitud: number): Promise<string | null> => {
  const db = await getDB();
  const tx = db.transaction('Palabras', 'readonly');
  const store = tx.objectStore('Palabras');

  const todasLasPalabras = await store.getAll();
  await tx.done; // Ensure transaction completes

  const palabrasFiltradas = todasLasPalabras.filter(p => p.palabra.length === longitud);

  if (palabrasFiltradas.length === 0) {
    console.warn(`query.ts: No se encontraron palabras con longitud ${longitud}.`);
    return null;
  }

  const indiceAleatorio = Math.floor(Math.random() * palabrasFiltradas.length);
  return palabrasFiltradas[indiceAleatorio].palabra;
}

// Login y Registrar
export const validarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  const db = await getDB();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const allUsers = await store.getAll();
  await tx.done; // Ensure transaction completes

  const user = allUsers.find(
    user => user.mail === email && user.contrasena === password
  );

  return user ?? null;
};

export const registrarUsuario = async (nuevoUsuario: Omit<Usuario, 'id'>): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDB(); // Ensure DB is set up

  // --- Pre-transaction validations ---
  const tempTx = db.transaction('Usuario', 'readonly');
  const usuarioStore = tempTx.objectStore('Usuario');

  const mailIndex = usuarioStore.index('mail');
  const usernameIndex = usuarioStore.index('nombre_usuario');

  const [existeMail, existeUsername] = await Promise.all([
    mailIndex.get(nuevoUsuario.mail),
    usernameIndex.get(nuevoUsuario.nombre_usuario)
  ]);
  await tempTx.done; // Crucial: ensure read transaction completes before starting new ones.

  if (existeMail) {
    return { ok: false, error: 'El correo ya está registrado' };
  }

  if (existeUsername) {
    return { ok: false, error: 'El nombre de usuario ya está en uso' };
  }

  // Get initial word *before* starting the write transaction to ensure it's available.
  const palabraInicial = await obtenerPalabraLongitud(3);
  if (!palabraInicial) {
    return { ok: false, error: 'No hay palabras con esa longitud en la base de datos para el nivel inicial' };
  }

  // --- Main write transaction for user registration and initial data ---
  const tx = db.transaction(['Usuario', 'NivelXUsuario', 'Herramienta', 'Vida'], 'readwrite');

  try {
    const usuarioStore = tx.objectStore('Usuario');
    const nivelXUsuarioStore = tx.objectStore('NivelXUsuario');
    const herramientaStore = tx.objectStore('Herramienta');
    const vidaStore = tx.objectStore('Vida');

    // 1. Add the new user
    const idUsuario = await usuarioStore.add({
      ...nuevoUsuario,
      racha: 0,
      monedas: 0
    });

    // 2. Initialize user's lives
    await vidaStore.add({
      cantidad: 3,
      IdUsuario: idUsuario
    });

    // 3. Initialize user's tools
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

    // 4. Initialize the first level for the new user
    await nivelXUsuarioStore.add({
      puntaje: 0, // New users start Level 1 with 0 score
      tiempo: 60, // Default time for a new level
      palabra: palabraInicial, // Assign the first word
      intento: 0,
      recompensa_intento: '0',
      IdUsuario: idUsuario,
      IdNivel: 1 // Always start with Level 1
    });

    await tx.done; // Commit the transaction
    console.log(`query.ts: Usuario ${idUsuario} registrado y nivel 1 inicializado.`);
    return { ok: true };
  } catch (error: any) {
    console.error('Error en transacción de registro:', error);
    try { tx.abort(); } catch (abortError) { console.error("Error al intentar abortar transacción:", abortError); }
    return { ok: false, error: 'Error inesperado al registrar usuario' };
  }
};


// --- Functions for Home screen data ---
export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario');
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
  const index = store.index('IdUsuario');
  const levels = await index.getAll(idUsuario);
  await tx.done;
  console.log("query.ts: getNivelesXUsuario - Niveles obtenidos (con ID de IndexedDB?):", levels);
  return levels;
}


// --- Nivel Management Functions ---

// Inserts a new NivelXUsuario record, or returns an existing one if it already exists
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
    // If the index is truly not found, this catch block will be hit.
    // Return null to indicate failure to get/create the level entry.
    await tx.done; // Ensure transaction finishes
    return null; 
  }

  // If not found, prepare to insert a new record
  // Explicitly omit 'id' so IndexedDB auto-increments it.
  const nuevoRegistro: Omit<NivelXUsuario, 'id'> = { 
    puntaje: 0, // New levels always start with 0 score
    tiempo: 60, // Default time
    palabra, // The word must be provided when inserting a new level
    intento: 0,
    recompensa_intento: '0',
    IdUsuario: idUsuario,
    IdNivel: IdNivel,
  };

  try {
    const idGenerado = await store.add(nuevoRegistro); // Add the new record
    const insertedRecord = { ...nuevoRegistro, id: idGenerado as number }; // Add the generated ID
    await tx.done; // Commit the transaction
    console.log(`query.ts: insertNivelXUsuario - Nuevo NivelXUsuario (IdNivel: ${IdNivel}) creado para usuario ${idUsuario}. ID de IndexedDB: ${idGenerado}`);
    return insertedRecord; // Return the object with its new ID
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
      // Prioritize updating by the IndexedDB 'id' if it's a valid number.
      if (typeof nivelActualizado.id === 'number' && nivelActualizado.id !== null) {
        console.log(`query.ts: updateNivelXUsuario - Actualizando por ID directo: ${nivelActualizado.id}`);
        // 'put' updates an existing record or adds if it doesn't exist. Here, it should update.
        await store.put(nivelActualizado);
        console.log(`query.ts: updateNivelXUsuario - Nivel actualizado por ID directo (IndexedDB ID: ${nivelActualizado.id}, IdNivel: ${nivelActualizado.IdNivel})`);
      } else {
          // If IndexedDB 'id' is not provided, try to find by compound index (IdUsuario_IdNivel)
          console.log(`query.ts: updateNivelXUsuario - ID de IndexedDB no proporcionado. Buscando por IdUsuario_IdNivel para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}.`);
          const index = store.index('IdUsuario_IdNivel');
          const existingRecord = await index.get([nivelActualizado.IdUsuario, nivelActualizado.IdNivel]);

          if (existingRecord) {
              // Merge current updates with existing record, ensuring its 'id' is preserved.
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
      await tx.done; // Ensure transaction completes regardless of success or failure in try block.
  }
};


// --- Generic CRUD for other stores (for completeness, based on your original structure) ---

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