import { getDatabase } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

export const obtenerPalabraLongitud = async (longitud: number): Promise<string | null> => {
  const db = await getDatabase();
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
  const db = await getDatabase();
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
  const db = await getDatabase();

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
  const db = await getDatabase();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
}

export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  const db = await getDatabase();
  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');
  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
}

export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  const db = await getDatabase();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const usuario = await store.get(id);
  await tx.done;
  return usuario ?? undefined;
}

export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  const db = await getDatabase();
  const tx = db.transaction('NivelXUsuario', 'readonly');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario')
  let levels: NivelXUsuario[] = [];
  try {
    levels = await index.getAll(idUsuario);
    console.log("query.ts: getNivelesXUsuario - Niveles obtenidos de DB para usuario", idUsuario, ":", levels);
  } catch (error) {
    console.error(`query.ts: Error al obtener niveles para usuario ${idUsuario} desde la DB:`, error);
  } finally {
    await tx.done;
  }
  return levels;
}

export const insertNivelXUsuario = async (idUsuario: number, IdNivel: number, palabra: string): Promise<NivelXUsuario | null> => {
  const db = await getDatabase();
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
    console.error(`query.ts: Error al buscar nivel existente antes de insertar (búsqueda por índice):`, error.name, error.message);
    await tx.done;
    return null; 
  }

  const nuevoRegistro: Omit<NivelXUsuario, 'id'> = { 
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
    console.error(`query.ts: Error al añadir nuevo NivelXUsuario ${IdNivel} para usuario ${idUsuario} (operación de adición):`, error.name, error.message, error);
    try { tx.abort(); } catch (abortError) { console.error("Error al intentar abortar transacción:", abortError); }
    return null;
  }
}

export const updateNivelXUsuario = async (nivelActualizado: NivelXUsuario): Promise<void> => {
  const db = await getDatabase();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');

  console.log("query.ts: updateNivelXUsuario - Recibido para actualizar:", nivelActualizado);
  
  try {
      if (typeof nivelActualizado.id === 'number' && nivelActualizado.id !== null) {
        console.log(`query.ts: updateNivelXUsuario - Actualizando por ID directo: ${nivelActualizado.id}`);
        await store.put(nivelActualizado);
        console.log(`query.ts: updateNivelXUsuario - Nivel actualizado por ID directo (ID de IndexedDB: ${nivelActualizado.id}, IdNivel: ${nivelActualizado.IdNivel})`);
      } else {
          console.log(`query.ts: updateNivelXUsuario - ID de IndexedDB no proporcionado. Buscando por IdUsuario_IdNivel para Nivel ${nivelActualizado.IdNivel} de Usuario ${nivelActualizado.IdUsuario}.`);
          const index = store.index('IdUsuario_IdNivel');
          const existingRecord = await index.get([nivelActualizado.IdUsuario, nivelActualizado.IdNivel]);

          if (existingRecord) {
              const updatedEntry = { ...existingRecord, ...nivelActualizado, id: existingRecord.id };
              await store.put(updatedEntry);
              console.log(`query.ts: updateNivelXUsuario - Nivel encontrado y actualizado por IdUsuario_IdNivel (ID de IndexedDB: ${existingRecord.id}, IdNivel: ${nivelActualizado.IdNivel})`);
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
}

export const insertNivel = async (nivel: Nivel): Promise<number> => {
  const db = await getDatabase();
  const id = await db.add('Nivel', nivel);
  return id;
};

export const getNiveles = async (): Promise<Nivel[]> => {
  const db = await getDatabase();
  const levels = await db.getAll('Nivel');
  return levels;
};

export const insertHerramienta = async (herramienta: Herramienta): Promise<number> => {
  const db = await getDatabase();
  const id = await db.add('Herramienta', herramienta);
  return id;
};

export const insertVida = async (vida: Vida): Promise<number> => {
  const db = await getDatabase();
  const id = await db.add('Vida', vida);
  return id;
};

export const insertPalabra = async (palabra: Palabras): Promise<number> => {
  const db = await getDatabase();
  const id = await db.add('Palabras', palabra);
  return id;
};

export const getPalabras = async (): Promise<Palabras[]> => {
  const db = await getDatabase();
  const palabras = await db.getAll('Palabras');
  return palabras;
};