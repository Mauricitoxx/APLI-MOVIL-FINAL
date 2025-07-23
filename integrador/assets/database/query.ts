import { getDB, setupIndexedDB } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

export const insertUsuario = async (usuario: Usuario): Promise<number> => {
  const db = await getDB();
  return db.add('Usuario', usuario);
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
//Obtener informacion total de las herramientas que tiene un usuario
export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  return await index.getAll(idUsuario)
}
//Obtener informacion total de las vidas que tiene un usuario
export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  await setupIndexedDB();
  const db = await getDB();

  const tx = db.transaction('Vida', 'readonly');
  const store = tx.objectStore('Vida');

  const index = store.index('IdUsuario');
  const result = await index.getAll(idUsuario);
  return result;
}
//Obtener informacion total del usuario
export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  await setupIndexedDB();
  const db = await getDB();

  const tx = db.transaction('Usuario', 'readonly');
  const store = tx.objectStore('Usuario');

  const usuario = await store.get(id);
  await tx.done;

  return usuario;
}


export const insertNivel = async (nivel: Nivel): Promise<number> => {
  const db = await getDB();
  return db.add('Nivel', nivel);
};

export const getNiveles = async (): Promise<Nivel[]> => {
  const db = await getDB();
  return db.getAll('Nivel');
};

export const insertNivelXUsuario = async (registro: NivelXUsuario): Promise<number> => {
  const db = await getDB();
  return db.add('NivelXUsuario', registro);
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