import { openDB, type IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase | null = null;

const DB_NAME = 'AppDB';
const DB_VERSION = 33;


export const setupIndexedDB = async (): Promise<void> => {
  console.log('Inicializando BD...');
  if (dbInstance) return;
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('Usuario')) {
        const usuarioStore = database.createObjectStore('Usuario', { keyPath: 'id', autoIncrement: true });
        usuarioStore.createIndex('mail', 'mail', { unique: true });
        usuarioStore.createIndex('nombre_usuario', 'nombre_usuario', { unique: true });
        usuarioStore.createIndex('id', 'id', { unique: true });
      }
      if (!database.objectStoreNames.contains('Nivel')){
        database.createObjectStore('Nivel', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('NivelXUsuario')){
        const nivelXUsuarioStore = database.createObjectStore('NivelXUsuario', { keyPath: 'id', autoIncrement: true });
        nivelXUsuarioStore.createIndex('IdUsuario', 'IdUsuario');
        nivelXUsuarioStore.createIndex('IdUsuario_IdNivel', ['IdUsuario', 'IdNivel'], { unique: true });
      }
      if (!database.objectStoreNames.contains('Herramienta')){
        const herramientaStore = database.createObjectStore('Herramienta', { keyPath: 'id', autoIncrement: true });
        herramientaStore.createIndex('IdUsuario', 'IdUsuario');
      }
      if (!database.objectStoreNames.contains('Vida')){
        const vidaStore = database.createObjectStore('Vida', { keyPath: 'id', autoIncrement: true });
        vidaStore.createIndex('IdUsuario', 'IdUsuario');
      }
      if (!database.objectStoreNames.contains('Palabras')){
        const palabrasStore = database.createObjectStore('Palabras', { keyPath: 'id', autoIncrement: true });
        palabrasStore.createIndex('palabra', 'palabra', { unique: true });
      }
    }
  });
  // Insertar datos de prueba si las tablas están vacías
  //const tx = dbInstance.transaction(['Usuario', 'Nivel', 'NivelXUsuario', 'Herramienta', 'Vida', 'Palabras'], 'readwrite');
  
  const insertIfEmpty = async (storeName: string, defaultItems: any[]) => {
    const tx = dbInstance!.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const count = await store.count();
    if (count === 0) {
      for (const item of defaultItems) {
        try {
          await store.add(item);
        } catch (error) {
          console.warn(`No se pudo insertar en ${storeName}:`, item, error);
        }
      }
    }
    await tx.done;
  };

  await insertIfEmpty('Usuario', [
    { nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
    { nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
  ]);

  await insertIfEmpty('Nivel', [{ recompensa: 100 }, { recompensa: 200 }]);

  await insertIfEmpty('NivelXUsuario', [
    { puntaje: 10, tiempo: 60, palabra: 'sol', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 },
    { puntaje: 80, tiempo: 20, palabra: 'mar', intento: 1, recompensa_intento: '30', IdUsuario: 2, IdNivel: 2 }
  ]);
  
  await insertIfEmpty('Herramienta', [
    { tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
    { tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
    { tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
  ]);

  await insertIfEmpty('Vida', [
    { cantidad: 5, IdUsuario: 1 }, 
    { cantidad: 1, IdUsuario: 2 }
  ]);

  const palabras = [
    'ejemplo', 'prueba', 'sol', 'mar', 'pez', 'luz', 'ojo', 'voz', 'te', 'pan', 'rio', 'sal',
    'casa', 'luna', 'flor', 'toro', 'piel', 'cine', 'tren', 'mesa', 'vino', 'cielo', 'perro',
    'planta', 'nube', 'sueño', 'papel', 'reloj', 'playa', 'viento', 'amigo', 'bosque', 'calor',
    'camino', 'tierra', 'mirar', 'mundo', 'comida', 'musica', 'banana', 'arboles', 'abanico',
    'caracol', 'ventana', 'maleta', 'guitarra', 'espejo', 'cuchara', 'zapato', 'camisa',
    'telefono', 'computadora', 'bicicleta', 'pelota', 'juego', 'hermoso', 'valiente',
    'antiguo', 'aprender', 'creativo', 'resolver', 'invierno', 'mariposa', 'compás',
    'jamás', 'mamá', 'sofá', 'café', 'ratón', 'avión', 'débil', 'cantó', 'lápiz', 'árbol',
    'bebé', 'menú', 'allá', 'inglés', 'francés', 'cortó', 'bastó', 'cóndor', 'papá',
    'régimen', 'fútbol', 'dólar', 'túnel', 'límite', 'éxito', 'héroe', 'razón', 'césped',
    'ángel', 'tórax', 'táctil', 'difícil', 'fácil', 'pésimo', 'público', 'técnico',
    'biología', 'lámpara'
  ];

  const palabrasUnicas = Array.from(new Set(palabras));
  await insertIfEmpty('Palabras', palabrasUnicas.map(p => ({ palabra: p })));

};
  

export const getDB = async (): Promise<IDBPDatabase> => {
  if (!dbInstance) {
    throw new Error('La base de datos no está inicializada. Llama a setupIndexedDB() primero.');
  }
  return dbInstance;
};