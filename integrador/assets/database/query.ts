import { getDB } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

export const insertUsuario = async (usuario: Usuario): Promise<number> => {
  const db = await getDB();
  return db.add('Usuario', usuario);
};

//Seleccion de Palabras
export const obtenerPalabraLongitud = async (longitud: number, idUsuario: number | null): Promise<string | null> => {
  const db = await getDB();
  const tx = db.transaction(['Palabras', 'NivelXUsuario'], 'readonly');
  const storePalabras = tx.objectStore('Palabras');
  const storeNiveles = tx.objectStore('NivelXUsuario');

  const [todasLasPalabras, nivelesDelUsuario] = await Promise.all([
    storePalabras.getAll(),
    idUsuario !== null ? storeNiveles.index('IdUsuario').getAll(idUsuario) : [],
  ]);
  await tx.done;

  const palabrasUsadas = new Set(nivelesDelUsuario.map(n => n.palabra));

  console.log(`query.ts: Buscando palabra con longitud: ${longitud}`);
  const palabrasFiltradas = todasLasPalabras
    .filter(p => p.palabra.length === longitud && !palabrasUsadas.has(p.palabra));

  if (palabrasFiltradas.length === 0) return null;

  const indiceAleatorio = Math.floor(Math.random() * palabrasFiltradas.length);
  return palabrasFiltradas[indiceAleatorio].palabra;
}

// Login y Registrar
export const validarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
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

  const palabraInicial = await obtenerPalabraLongitud(3, null);
  if (!palabraInicial) {
    return { ok: false, error: 'No hay palabras con esa longitud en la base de datos' };
  }

  // Solo después de validar, abrimos la transacción write
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
      tiempo: 0, 
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
//Obtener informacion total de las herramientas que tiene un usuario
export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  return await index.getAll(idUsuario)
}
//Obtener informacion total de las vidas que tiene un usuario
export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  const db = await getDB();

  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');

  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  return result;
}

//Obtener informacion total del usuario
export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  const db = await getDB();

  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');

  const usuario = await store.get(id);
  await tx.done;

  return usuario ?? null;
}

//Obtener todos los NivelXUsuario segun idUsuario
export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  const db = await getDB();
  const tx = db.transaction('NivelXUsuario', 'readonly');
  const store = tx.objectStore('NivelXUsuario');
  const index = store.index('IdUsuario')
  return await index.getAll(idUsuario)
}

//Ingresar una vida al terminar el temporizador (esta es una accion para todos los usuario)
export const otorgarVida = async () => {
  const db = await getDB();
  const tx = db.transaction('Usuario', 'readwrite');
  const store = tx.objectStore('Usuario');
  const allUsers = await store.getAll();

  for (const user of allUsers) {
    user.vida += 1;
    await store.put(user);
  }

  await tx.done;
  
}

//Niveles y Juego
//Crear un nuevo nivel por usuario
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
    console.error(`query.ts: Error al buscar nivel existente antes de insertar (búsqueda por índice):`, error.name, error.message);
    await tx.done;
    return null;
  }

  const nuevoRegistro: Omit<NivelXUsuario, 'id'> = {
    puntaje: 0,
    tiempo: 0,
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

//Modificar vidas cuando el jugador pierde
export const restarVida = async (idUsuario: number) => {
  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('idUsuario inválido:', idUsuario);
    return;
  }
  const db = await getDB();
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

//Cargar los nuevos datos al nivel jugado
export const cargarDatosNivel = async (idUsuario: number, idNivel: number, puntaje: number, tiempo: number) => {
  if (!idNivel || typeof idNivel !== 'number' || !idUsuario || typeof idUsuario !== 'number') {
    console.error('Parámetros inválidos:', { idUsuario, idNivel });
    return;
  }

  if (puntaje <= 0) {
    console.log(`Nivel ${idNivel} no completado correctamente`);
  }

  try {
    const db = await getDB();
    const tx = db.transaction('NivelXUsuario', 'readwrite');
    const store = tx.objectStore('NivelXUsuario');
    const index = store.index('IdUsuario_IdNivel');

    const nivel: NivelXUsuario = await index.get([idUsuario, idNivel]);

    if (!nivel) {
      console.error(`No se encontró nivel con IdNivel=${idNivel}`);
      return;
    }

    // Sobrescribe el puntaje si es un nuevo récord
    if (puntaje > nivel.puntaje) {
      nivel.puntaje = puntaje;
    }
    
    // Sobrescribe el tiempo en cada jugada
    nivel.tiempo = tiempo;

    nivel.intento = nivel.intento + 1;

    await store.put(nivel);
    await tx.done;

    console.log(`Datos actualizados para usuario ${idUsuario}, nivel ${idNivel}`)
    
  } catch (error) {
    console.error('Error al cargar datos del nivel:', error);
  }
};

//Cargar Monedas Ganadas
export const insertMoneda = async (idUsuario: number, monedas: number) => {

  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('Parámetros inválidos:', { idUsuario });
    return;
  }

  try {
    const db = await getDB();
    const tx = db.transaction('Usuario', 'readwrite');
    const store = tx.objectStore('Usuario');
    const index = store.index('id');

    const user : Usuario = await index.get(idUsuario);

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
}

// Restar herramienta utilizada
export const restarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda') => {

  if (!idUsuario || typeof idUsuario !== 'number') {
    console.error('Parámetros inválidos:', { idUsuario });
    return;
  }

  try {
    const db = await getDB();
    const tx = db.transaction('Herramienta', 'readwrite');
    const store = tx.objectStore('Herramienta');
    const index = store.index('IdUsuario');

    const herramientasUsuario: Herramienta[] = await index.getAll(idUsuario);
    const herramienta = herramientasUsuario.find((h) => h.tipo === tipo);

    if (!herramienta) {
      console.error(`No se encontró herramienta '${tipo} en usuario ${idUsuario}`);
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

// Agregar estas funciones al archivo db.ts
// Obtener estadísticas del usuario
export const getEstadisticasUsuario = async (idUsuario: number) => {
  const db = await getDB();
  
  // Obtener días de racha (simplificado)
  const nivelesCompletados = await db.getAllFromIndex('NivelXUsuario', 'IdUsuario', idUsuario);
  const racha = nivelesCompletados.filter(n => n.completado).length; // Ejemplo simplificado
  
  // Obtener puntaje más alto
  const puntajeMaximo = nivelesCompletados.reduce((max, nivel) => 
    nivel.puntaje > max ? nivel.puntaje : max, 0);
  
  return {
    racha,
    puntajeMaximo
  };
};

// Actualizar usuario
export const actualizarUsuario = async (usuario: Usuario): Promise<boolean> => {
  try {
    const db = await getDB();
    await db.put('Usuario', usuario);
    return true;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return false;
  }
};


// Tienda
// Compra de Vida
export const comprarVida = async (idUsuario: number, costo: number): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDB();

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

// Compra de Herramienta
export const comprarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda', costo: number): Promise<{ ok: boolean; error?: string }> => {
  const db = await getDB();

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