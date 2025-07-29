import { getDB, setupIndexedDB } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

export const insertUsuario = async (usuario: Usuario): Promise<number> => {
  const db = await getDB();
  return db.add('Usuario', usuario);
};

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
  const tx = db.transaction('Usuario', 'readwrite');
  const store = tx.objectStore('Usuario');

  const mailIndex = store.index('mail');
  const usernameIndex = store.index('nombre_usuario');

  const existeMail = await mailIndex.get(nuevoUsuario.mail);
  if (existeMail) {
    return { ok: false, error: 'El correo ya esta regsitrado' }
  }

  const existeUsername = await usernameIndex.get(nuevoUsuario.nombre_usuario);
  if (existeUsername) {
    return { ok: false, error: 'El nombre de usuario ya está en uso' };
  }

  await store.add(nuevoUsuario);
  await tx.done;
  return {
    ok: true
  };
}

//Funciones para HOME

export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  await setupIndexedDB();
  const db = await getDB();
  const tx = db.transaction('Herramienta', 'readonly');
  const store = tx.objectStore('Herramienta');
  const index = store.index('IdUsuario')
  return await index.getAll(idUsuario)
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
// Agregar estas funciones al archivo db.ts

// Obtener usuario por ID
export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  const db = await getDB();
  return db.get('Usuario', id);
};

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