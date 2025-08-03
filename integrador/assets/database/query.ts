// Archivo query.ts completo adaptado para AsyncStorage en Expo Go
// Requiere: funciones utilitarias en db.ts (getData, addData, saveData, updateData, getItemById)

import { getData, addData, saveData, updateData, getItemById } from './db';
import type { Usuario, Nivel, NivelXUsuario, Herramienta, Vida, Palabras } from './type';

export const insertUsuario = async (usuario: Usuario): Promise<number> => {
  return await addData('Usuario', usuario);
};

export const obtenerPalabraLongitud = async (longitud: number, idUsuario: number | null): Promise<string | null> => {
  const todasLasPalabras: Palabras[] = await getData('Palabras');
  const nivelesDelUsuario: NivelXUsuario[] = idUsuario !== null ? await getNivelesXUsuario(idUsuario) : [];
  const palabrasUsadas = new Set(nivelesDelUsuario.map(n => n.palabra));
  const palabrasFiltradas = todasLasPalabras.filter(p => p.palabra.length === longitud && !palabrasUsadas.has(p.palabra));
  if (palabrasFiltradas.length === 0) return null;
  const indiceAleatorio = Math.floor(Math.random() * palabrasFiltradas.length);
  return palabrasFiltradas[indiceAleatorio].palabra;
};

export const validarUsuario = async (email: string, password: string): Promise<Usuario | null> => {
  const usuarios = await getData('Usuario');
  return usuarios.find(u => u.mail === email && u.contrasena === password) || null;
};

export const registrarUsuario = async (nuevoUsuario: Omit<Usuario, 'id'>): Promise<{ ok: boolean; error?: string }> => {
  const usuarios = await getData('Usuario');
  if (usuarios.some(u => u.mail === nuevoUsuario.mail)) return { ok: false, error: 'El correo ya está registrado' };
  if (usuarios.some(u => u.nombre_usuario === nuevoUsuario.nombre_usuario)) return { ok: false, error: 'El nombre de usuario ya está en uso' };
  const palabraInicial = await obtenerPalabraLongitud(3, null);
  if (!palabraInicial) return { ok: false, error: 'No hay palabras con esa longitud' };
  const idUsuario = await insertUsuario({ ...nuevoUsuario, racha: 0, monedas: 0 });
  await addData('Vida', { cantidad: 3, IdUsuario: idUsuario });
  await addData('Herramienta', { tipo: 'pasa', cantidad: 0, IdUsuario: idUsuario });
  await addData('Herramienta', { tipo: 'ayuda', cantidad: 0, IdUsuario: idUsuario });
  await addData('NivelXUsuario', { puntaje: 0, tiempo: 0, palabra: palabraInicial, intento: 0, recompensa_intento: '0', IdUsuario: idUsuario, IdNivel: 1 });
  return { ok: true };
};

export const getHerramienta = async (idUsuario: number): Promise<Herramienta[]> => {
  const herramientas = await getData('Herramienta');
  return herramientas.filter(h => h.IdUsuario === idUsuario);
};

export const getVidas = async (idUsuario: number): Promise<Vida[]> => {
  const vidas = await getData('Vida');
  return vidas.filter(v => v.IdUsuario === idUsuario);
};

export const getUsuarioPorId = async (id: number): Promise<Usuario | undefined> => {
  return await getItemById('Usuario', id);
};

export const getNivelesXUsuario = async (idUsuario: number): Promise<NivelXUsuario[]> => {
  const niveles = await getData('NivelXUsuario');
  return niveles.filter(n => n.IdUsuario === idUsuario);
};

export const otorgarVida = async () => {
  const usuarios = await getData('Usuario');
  for (const user of usuarios) {
    user.vida = (user.vida || 0) + 1;
    await updateData('Usuario', user);
  }
};

export const insertNivelXUsuario = async (idUsuario: number, IdNivel: number, palabra: string): Promise<NivelXUsuario | null> => {
  const existentes = await getNivelesXUsuario(idUsuario);
  const existente = existentes.find(n => n.IdNivel === IdNivel);
  if (existente) return existente;
  const nuevoRegistro: Omit<NivelXUsuario, 'id'> = { puntaje: 0, tiempo: 0, palabra, intento: 0, recompensa_intento: '0', IdUsuario: idUsuario, IdNivel: IdNivel };
  const id = await addData('NivelXUsuario', nuevoRegistro);
  return { ...nuevoRegistro, id };
};

export const restarVida = async (idUsuario: number) => {
  const vidas = await getData('Vida');
  const vida = vidas.find(v => v.IdUsuario === idUsuario);
  if (vida && vida.cantidad > 0) {
    vida.cantidad -= 1;
    await updateData('Vida', vida);
  }
};

export const cargarDatosNivel = async (idUsuario: number, idNivel: number, puntaje: number, tiempo: number) => {
  const niveles = await getData('NivelXUsuario');
  const nivel = niveles.find(n => n.IdUsuario === idUsuario && n.IdNivel === idNivel);
  if (!nivel) return;
  if (puntaje > nivel.puntaje) nivel.puntaje = puntaje;
  nivel.tiempo = tiempo;
  nivel.intento += 1;
  await updateData('NivelXUsuario', nivel);
};

export const insertMoneda = async (idUsuario: number, monedas: number) => {
  const usuarios = await getData('Usuario');
  const user = usuarios.find(u => u.id === idUsuario);
  if (!user) return;
  user.monedas = (user.monedas || 0) + monedas;
  await updateData('Usuario', user);
};

export const restarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda') => {
  const herramientas = await getData('Herramienta');
  const herramienta = herramientas.find(h => h.IdUsuario === idUsuario && h.tipo === tipo);
  if (!herramienta || herramienta.cantidad <= 0) return;
  herramienta.cantidad -= 1;
  await updateData('Herramienta', herramienta);
};

export const insertNivel = async (nivel: Nivel): Promise<number> => {
  return await addData('Nivel', nivel);
};

export const getNiveles = async (): Promise<Nivel[]> => {
  return await getData('Nivel');
};

export const insertHerramienta = async (herramienta: Herramienta): Promise<number> => {
  return await addData('Herramienta', herramienta);
};

export const insertVida = async (vida: Vida): Promise<number> => {
  return await addData('Vida', vida);
};

export const insertPalabra = async (palabra: Palabras): Promise<number> => {
  return await addData('Palabras', palabra);
};

export const getPalabras = async (): Promise<Palabras[]> => {
  return await getData('Palabras');
};

export const getEstadisticasUsuario = async (idUsuario: number) => {
  const niveles = await getNivelesXUsuario(idUsuario);
  const completados = niveles.filter(n => n.puntaje > 0);
  const racha = completados.length;
  const puntajeMaximo = completados.reduce((max, n) => Math.max(max, n.puntaje), 0);
  return { racha, puntajeMaximo };
};

export const actualizarUsuario = async (usuario: Usuario): Promise<boolean> => {
  try {
    await updateData('Usuario', usuario);
    return true;
  } catch {
    return false;
  }
};

export const comprarVida = async (idUsuario: number, costo: number): Promise<{ ok: boolean; error?: string }> => {
  const usuarios = await getData('Usuario');
  const vidas = await getData('Vida');
  const usuario = usuarios.find(u => u.id === idUsuario);
  const vida = vidas.find(v => v.IdUsuario === idUsuario);
  if (!usuario || usuario.monedas < costo) return { ok: false, error: 'Fondos insuficientes' };
  usuario.monedas -= costo;
  if (vida) vida.cantidad += 1;
  await updateData('Usuario', usuario);
  if (vida) await updateData('Vida', vida);
  return { ok: true };
};

export const comprarHerramienta = async (idUsuario: number, tipo: 'pasa' | 'ayuda', costo: number): Promise<{ ok: boolean; error?: string }> => {
  const usuarios = await getData('Usuario');
  const herramientas = await getData('Herramienta');
  const usuario = usuarios.find(u => u.id === idUsuario);
  const herramienta = herramientas.find(h => h.IdUsuario === idUsuario && h.tipo === tipo);
  if (!usuario || usuario.monedas < costo) return { ok: false, error: 'Fondos insuficientes' };
  usuario.monedas -= costo;
  if (herramienta) herramienta.cantidad += 1;
  await updateData('Usuario', usuario);
  if (herramienta) await updateData('Herramienta', herramienta);
  return { ok: true };
};
