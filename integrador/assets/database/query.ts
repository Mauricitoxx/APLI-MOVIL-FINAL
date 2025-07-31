import { openDB, type IDBPDatabase } from 'idb';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type'; // Ensure this path is correct

let dbPromise: Promise<IDBPDatabase> | null = null;

const DB_NAME = 'AppDB';
// IMPORTANT: Make sure this version is HIGHER than the last one you used.
// For example, if your last version was 10, set it to 11 (or higher if you already incremented).
const DB_VERSION = 18; // <--- Make sure this version is sufficient for your upgrades

export const setupIndexedDB = async (): Promise<void> => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      console.log(`DB Upgrade: from ${oldVersion} to ${newVersion}`);

      if (oldVersion < 1) { // Initial creation of all stores
        console.log('DB Upgrade: Creating initial stores (Version 1)');
        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        // The 'id' index below is redundant if keyPath is 'id' and unique:true, but harmless.
        // It's already the primary key, so an index on it is implicitly managed.
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

      // Ensure the compound unique index exists for later versions (e.g., from v9)
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

  // It's crucial NOT to seed NivelXUsuario with completed levels here,
  // as it would interfere with new user's Level 1 initial state.
  // Levels should be created dynamically as the user progresses.

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

//Seleccion de Palabras
export const obtenerPalabraLongitud = async (longitud: number): Promise<string | null> => {
  const db = await getDB();
  const tx = db.transaction('Palabras', 'readonly');
  const store = tx.objectStore('Palabras');

  const todasLasPalabras = await store.getAll();

  const palabrasFiltradas = todasLasPalabras.filter(p => p.palabra.length === longitud);

  if (palabrasFiltradas.length === 0) return null;

  const indiceAleatorio = Math.floor(Math.random() * palabrasFiltradas.length);
  return palabrasFiltradas[indiceAleatorio].palabra;
}

// Login y Registrar
export const validarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const allUsers = await store.getAll();

  const user = allUsers.find(
    user => user.mail === email && user.contrasena === password
  );

  return user ?? null;
};

export const registrarUsuario = async (nuevoUsuario: Omit<Usuario, 'id'>): Promise<{ ok: boolean; error?: string }> => {
  await setupIndexedDB();
  const db = await getDB();

  // Validaciones antes de abrir la transacción
  const tempTx = db.transaction(['Usuario', 'Palabras'], 'readonly');
  const usuarioStore = tempTx.objectStore('Usuario');

  const mailIndex = usuarioStore.index('mail');
  const usernameIndex = usuarioStore.index('nombre_usuario');

  const [existeMail, existeUsername] = await Promise.all([
    mailIndex.get(nuevoUsuario.mail),
    usernameIndex.get(nuevoUsuario.nombre_usuario)
  ]);

  if (existeMail) {
    return { ok: false, error: 'El correo ya está registrado' };
  }

  if (existeUsername) {
    return { ok: false, error: 'El nombre de usuario ya está en uso' };
  }

  const palabraInicial = await obtenerPalabraLongitud(3);
  if (!palabraInicial) {
    return { ok: false, error: 'No hay palabras con esa longitud en la base de datos' };
  }

  // Only after validating, open the write transaction
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

    // Initialize the first level for the new user
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
    return { ok: true };
  } catch (error) {
    console.error('Error en transacción:', error);
    return { ok: false, error: 'Error inesperado al registrar usuario' };
  }
};


//Funciones para HOME
export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  return await index.getAll(idUsuario)
}

export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  await setupIndexedDB();
  const db = await getDB();

  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');

  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  return result;
}

export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  await setupIndexedDB();
  const db = await getDB();

  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');

  const usuario = await store.get(id);
  await tx.done;

  return usuario ?? null;
}

export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readonly');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario')
  const levels = await index.getAll(idUsuario);
  console.log("query.ts: getNivelesXUsuario - Niveles obtenidos (con ID de IndexedDB?):", levels);
  return levels;
}


//Niveles
export const insertNivelXUsuario = async (idUsuario: number, IdNivel: number, palabra: string): Promise<NivelXUsuario | null> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');
  
  // Check if this specific NivelXUsuario already exists
  const existingRecord = await store.index('IdUsuario_IdNivel').get([idUsuario, IdNivel]);
  if (existingRecord) {
    console.log(`query.ts: NivelXUsuario (IdUsuario: ${idUsuario}, IdNivel: ${IdNivel}) ya existe. No se crea uno nuevo.`);
    await tx.done;
    return existingRecord; // Return the existing record
  }

  const nuevoRegistro: NivelXUsuario = {
    puntaje: 0,
    tiempo: 60,
    palabra, // Use the provided word
    intento: 0,
    recompensa_intento: '0',
    IdUsuario: idUsuario,
    IdNivel: IdNivel,
  };

  try {
    const idGenerado = await store.add(nuevoRegistro);
    await tx.done;
    console.log(`query.ts: Nuevo NivelXUsuario (IdNivel: ${IdNivel}) creado para usuario ${idUsuario}. ID de IndexedDB: ${idGenerado}`);
    return { ...nuevoRegistro, id: idGenerado as number };
  } catch (error) {
    console.error(`query.ts: Error al añadir nuevo NivelXUsuario ${IdNivel} para usuario ${idUsuario}:`, error);
    await tx.done;
    return null;
  }
}


export const insertNivel = async (nivel: Nivel): Promise<number> => {
  const db = await getDB();
  return db.add('Nivel', nivel);
};

export const getNiveles = async (): Promise<Nivel[]> => {
  const db = await getDB();
  return db.getAll('Nivel');
};

export const insertHerramienta = async (herramienta: Herramienta): Promise<number> => {
  const db = await getDB();
  return db.add('Herramienta', herramienta);
};

export const insertVida = async (vida: Vida): Promise<number> => {
  const db = await getDB();
  return db.add('Vida', vida);
};

export const insertPalabra = async (palabra: Palabras): Promise<number> => {
  const db = await getDB();
  return db.add('Palabras', palabra);
};

export const getPalabras = async (): Promise<Palabras[]> => {
  const db = await getDB();
  return db.getAll('Palabras');
};

export const updateNivelXUsuario = async (nivelActualizado: NivelXUsuario): Promise<void> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');

  console.log("query.ts: updateNivelXUsuario - Recibido para actualizar:", nivelActualizado);
  
  try {
      // Prioritize using the 'id' (IndexedDB key) if it exists, as it's the most direct way to update.
      // If 'id' is not present (e.g., it's a new level being completed for the first time),
      // then we fall back to the compound index.
      if (nivelActualizado.id) {
        const existingRecordById = await store.get(nivelActualizado.id);
        if (existingRecordById) {
            const updatedEntry = { ...existingRecordById, ...nivelActualizado, id: existingRecordById.id };
            await store.put(updatedEntry);
            console.log(`query.ts: updateNivelXUsuario - Nivel actualizado por ID directo (IndexedDB ID: ${nivelActualizado.id}, IdNivel: ${nivelActualizado.IdNivel})`);
        } else {
            console.warn(`query.ts: updateNivelXUsuario - WARN: No se encontró registro con ID ${nivelActualizado.id}. Intentando buscar por IdUsuario_IdNivel.`);
            const index = store.index('IdUsuario_IdNivel');
            const existingRecordByIndex = await index.get([nivelActualizado.IdUsuario, nivelActualizado.IdNivel]);
            if (existingRecordByIndex) {
              const updatedEntry = { ...existingRecordByIndex, ...nivelActualizado, id: existingRecordByIndex.id };
              await store.put(updatedEntry);
              console.log(`query.ts: updateNivelXUsuario - Nivel actualizado por IdUsuario_IdNivel (IndexedDB ID: ${existingRecordByIndex.id}, IdNivel: ${nivelActualizado.IdNivel})`);
            } else {
                console.error(`query.ts: updateNivelXUsuario - ERROR: No se encontró registro existente para actualizar (ni por ID ni por IdUsuario_IdNivel) para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}. No se realizó la actualización.`);
            }
        }
      } else {
          // If nivelActualizado.id is null/undefined, always use the compound index to find
          console.log(`query.ts: updateNivelXUsuario - ID de IndexedDB no proporcionado. Buscando por IdUsuario_IdNivel.`);
          const index = store.index('IdUsuario_IdNivel');
          const existingRecord = await index.get([nivelActualizado.IdUsuario, nivelActualizado.IdNivel]);

          if (existingRecord) {
              const updatedEntry = { ...existingRecord, ...nivelActualizado, id: existingRecord.id };
              await store.put(updatedEntry);
              console.log(`query.ts: updateNivelXUsuario - Nivel encontrado y actualizado por IdUsuario_IdNivel (IndexedDB ID: ${existingRecord.id}, IdNivel: ${nivelActualizado.IdNivel})`);
          } else {
              // This case implies you're trying to update a level that doesn't exist yet in DB.
              // This is where `insertNivelXUsuario` should have been called first, typically
              // when a user starts playing a new level that hasn't been saved before.
              console.error(`query.ts: updateNivelXUsuario - ERROR: No se encontró registro existente para actualizar por IdUsuario_IdNivel para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}. ¡Esto podría indicar un nivel nuevo que debería haberse insertado antes!`);
              // As a *temporary* fallback for debugging, you could try to add it here,
              // but the robust solution is to ensure it's inserted BEFORE attempting to update.
              // try {
              //   const newId = await store.add(nivelActualizado);
              //   console.log(`query.ts: Nivel insertado como nuevo (ID: ${newId}, IdNivel: ${nivelActualizado.IdNivel})`);
              // } catch (addError: any) {
              //   console.error(`query.ts: Fallback insert failed for IdNivel ${nivelActualizado.IdNivel}:`, addError.name, addError.message);
              // }
          }
      }
  } catch (error: any) {
      console.error('query.ts: updateNivelXUsuario - Error en la transacción o búsqueda por índice:', error.name, error.message, error);
  } finally {
      await tx.done;
  }
};