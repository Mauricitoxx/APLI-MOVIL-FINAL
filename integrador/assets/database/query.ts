import { getDatabase } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

// --- Funciones de Lógica del Juego ---

/**
 * Obtiene una palabra aleatoria de una longitud específica de la base de datos.
 * @param longitud La longitud de la palabra a buscar.
 * @returns La palabra encontrada o null si no hay palabras de esa longitud.
 */
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
};

/**
 * Carga las monedas ganadas a un usuario.
 * @param idUsuario El ID del usuario.
 * @param monedas La cantidad de monedas a agregar.
 */
export const insertMoneda = async (idUsuario: number, monedas: number) => {
  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('Parámetros inválidos:', { idUsuario });
    return;
  }

  try {
    const db = await getDatabase();
    const tx = db.transaction('Usuario', 'readwrite');
    const store = tx.objectStore('Usuario');
    
    const user = await store.get(idUsuario);

    if (!user) {
      console.error(`No se encontró usuario con IdUsuario=${idUsuario}`);
      return;
    }

    user.monedas = (user.monedas ?? 0) + monedas;

    await store.put(user);
    await tx.done;

    console.log(`Datos actualizados para usuario ${idUsuario}`)
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};

/**
 * Resta una vida al usuario.
 * @param idUsuario El ID del usuario.
 */
export const restarVida = async (idUsuario: number) => {
  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('idUsuario inválido:', idUsuario);
    return;
  }
  const db = await getDatabase();
  const tx = db.transaction('Vida', 'readwrite');
  const store = tx.objectStore('Vida');
  const index = store.index('IdUsuario');

  const vida = await index.get(idUsuario) as Vida;

  if (vida && vida?.cantidad! > 0) {
    vida.cantidad! -= 1;
    await store.put(vida);
    await tx.done;
    console.log("Se retiró una vida");
  } else {
    console.warn('El usuario no tiene vidas disponibles');
  }
};

// Restar herramienta utilizada
export const restarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda') => {

  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('Parámetros inválidos:', { idUsuario });
    return;
  }

  try {
    const db = await getDatabase();
    const tx = db.transaction('Herramienta', 'readwrite');
    const store = tx.objectStore('Herramienta');
    const index = store.index('IdUsuario');

    const herramientasUsuario: Herramienta[] = await index.getAll(idUsuario);
    const herramienta = herramientasUsuario.find((h) => h.tipo === tipo);

    if (!herramienta) {
      console.error(`No se encontró herramienta '${tipo}' en usuario ${idUsuario}`);
      return;
    }

    if (!herramienta.cantidad || herramienta.cantidad <= 0) {
      console.warn(`No quedan herramientas de tipo '${tipo}' para el usuario ${idUsuario}`);
      return;
    }

    herramienta.cantidad -= 1;

    await store.put(herramienta);
    await tx.done;

    console.log(`Datos actualizados para usuario ${idUsuario}`)
    
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

/**
 * Carga los datos de un nivel al finalizar el juego.
 * @param idUsuario El ID del usuario.
 * @param idNivel El ID del nivel.
 * @param puntaje El puntaje obtenido.
 * @param tiempo El tiempo utilizado.
 */
export const cargarDatosNivel = async (idUsuario: number, idNivel: number, puntaje: number, tiempo: number) => {
  const db = await getDatabase();
  const tx = db.transaction('NivelXUsuario', 'readwrite');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario_IdNivel');

  const nivel = await index.get([idUsuario, idNivel]) as NivelXUsuario;

  if (nivel) {
    if (puntaje > nivel.puntaje) {
      nivel.puntaje = puntaje;
    }
    if (tiempo < nivel.tiempo) {
      nivel.tiempo = tiempo;
    }
    await store.put(nivel);
    await tx.done;
    console.log("Se actualizaron los datos del nivel");
  } else {
    console.warn('No se encontró el nivel para actualizar');
  }
};

// --- Funciones de Autenticación y Registro ---

/**
 * Valida las credenciales de un usuario.
 * @param email El correo electrónico del usuario.
 * @param password La contraseña del usuario.
 * @returns El objeto de usuario si las credenciales son válidas, de lo contrario, null.
 */
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

/**
 * Registra un nuevo usuario y crea sus datos iniciales (vidas, herramientas, nivel).
 * @param nuevoUsuario El objeto del nuevo usuario.
 * @returns Un objeto indicando si la operación fue exitosa.
 */
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
      IdUsuario: idUsuario as number
    });

    await herramientaStore.add({
      tipo: 'pasa',
      cantidad: 0,
      IdUsuario: idUsuario as number
    });
    await herramientaStore.add({
      tipo: 'ayuda',
      cantidad: 0,
      IdUsuario: idUsuario as number
    });

    await nivelXUsuarioStore.add({
      puntaje: 0,
      tiempo: 60,
      palabra: palabraInicial,
      intento: 0,
      recompensa_intento: '0',
      IdUsuario: idUsuario as number,
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

// --- Funciones para Home y Usuario ---

/**
 * Obtiene la información de las herramientas de un usuario.
 * @param idUsuario El ID del usuario.
 * @returns Un array con las herramientas del usuario.
 */
export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  const db = await getDatabase();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
};

/**
 * Obtiene la información de las vidas de un usuario.
 * @param idUsuario El ID del usuario.
 * @returns Un array con las vidas del usuario.
 */
export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  const db = await getDatabase();
  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');
  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  await tx.done;
  return result;
};

/**
 * Obtiene la información de un usuario por su ID.
 * @param id El ID del usuario.
 * @returns El objeto de usuario o undefined si no se encuentra.
 */
export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  const db = await getDatabase();
  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');
  const usuario = await store.get(id);
  await tx.done;
  return usuario ?? undefined;
};

/**
 * Obtiene los niveles completados o en progreso de un usuario.
 * @param idUsuario El ID del usuario.
 * @returns Un array de objetos NivelXUsuario.
 */
export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  const db = await getDatabase();
  const tx = db.transaction('NivelXUsuario', 'readonly');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario');
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
};

/**
 * Obtiene las estadísticas de un usuario.
 * @param idUsuario El ID del usuario.
 * @returns Un objeto con la racha y el puntaje máximo.
 */
export const getEstadisticasUsuario = async (idUsuario: number) => {
  const db = await getDatabase();
  
  const nivelesCompletados = await db.getAllFromIndex('NivelXUsuario', 'IdUsuario', idUsuario);
  const racha = nivelesCompletados.filter(n => n.puntaje > 0).length; // Suponiendo que puntaje > 0 significa completado
  
  const puntajeMaximo = nivelesCompletados.reduce((max, nivel) => 
    nivel.puntaje > max ? nivel.puntaje : max, 0);
  
  return {
    racha,
    puntajeMaximo
  };
};

/**
 * Actualiza la información de un usuario.
 * @param usuario El objeto de usuario actualizado.
 * @returns true si la actualización fue exitosa, false de lo contrario.
 */
export const actualizarUsuario = async (usuario: Usuario): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.put('Usuario', usuario);
    return true;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return false;
  }
};

// --- Funciones para Nivel y Tienda ---

/**
 * Crea o recupera un nuevo nivel para un usuario.
 * @param idUsuario El ID del usuario.
 * @param IdNivel El ID del nivel.
 * @param palabra La palabra a usar para el nivel.
 * @returns El registro del nivel creado o existente, o null si falla.
 */
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
};

/**
 * Actualiza los datos de un nivel específico.
 * @param nivelActualizado El objeto NivelXUsuario con los datos actualizados.
 */
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
};

/**
 * Compra una vida para un usuario.
 * @param idUsuario El ID del usuario.
 * @param costo El costo de la vida.
 * @returns Un objeto indicando si la operación fue exitosa.
 */
export const comprarVida = async (idUsuario: number, costo: number): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDatabase();

  const tx = db.transaction(['Usuario', 'Vida'], 'readwrite');
  const usuarioStore = tx.objectStore('Usuario');
  const vidaStore = tx.objectStore('Vida');

  const usuario = await usuarioStore.get(idUsuario);
  if (!usuario || usuario.monedas < costo) return { ok: false, error: 'Fondos insuficientes' };

  usuario.monedas -= costo;
  await usuarioStore.put(usuario);

  const vidas = await vidaStore.index('IdUsuario').getAll(idUsuario);
  if (vidas.length > 0) {
    vidas[0].cantidad += 1;
    await vidaStore.put(vidas[0]);
  }

  await tx.done;
  return { ok: true };
};

/**
 * Compra una herramienta para un usuario.
 * @param idUsuario El ID del usuario.
 * @param tipo El tipo de herramienta ('pasa' o 'ayuda').
 * @param costo El costo de la herramienta.
 * @returns Un objeto indicando si la operación fue exitosa.
 */
export const comprarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda', costo: number): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDatabase();

  const tx = db.transaction(['Usuario', 'Herramienta'], 'readwrite');
  const usuarioStore = tx.objectStore('Usuario');
  const herramientaStore = tx.objectStore('Herramienta');

  const usuario = await usuarioStore.get(idUsuario);
  if (!usuario || usuario.monedas < costo) return { ok: false, error: 'Fondos insuficientes' };

  usuario.monedas -= costo;
  await usuarioStore.put(usuario);

  const herramientas = await herramientaStore.index('IdUsuario').getAll(idUsuario);
  const herramienta = herramientas.find(h => h.tipo === tipo);
  if (herramienta) {
    herramienta.cantidad += 1;
    await herramientaStore.put(herramienta);
  }

  await tx.done;
  return { ok: true };
};

// --- Funciones de Inicialización ---

/**
 * Otorga una vida a todos los usuarios.
 */
export const otorgarVida = async () => {
  const db = await getDatabase();
  const tx = db.transaction('Vida', 'readwrite');
  const store = tx.objectStore('Vida');
  const allVidas = await store.getAll();

  for (const vida of allVidas) {
    if (vida.cantidad < 5) { // Límite de vidas
      vida.cantidad += 1;
      await store.put(vida);
    }
  }

  await tx.done;
  console.log("Se otorgó una vida a todos los usuarios.");
};

export const insertNivel = async (nivel: Nivel): Promise<number> => {
  const db = await getDatabase();
  return db.add('Nivel', nivel);
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
