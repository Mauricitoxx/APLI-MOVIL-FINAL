import AsyncStorage from '@react-native-async-storage/async-storage';

export const setupAsyncStorage = async () => {
  console.log('Inicializando almacenamiento...');

  const initializeIfEmpty = async (key: string, defaultData: any[]) => {
    const existing = await AsyncStorage.getItem(key);
    if (!existing) {
      await AsyncStorage.setItem(key, JSON.stringify(defaultData));
    }
  };

  await initializeIfEmpty('Usuario', [
    { id: 1, nombre_completo: 'Admin', nombre_usuario: 'admin', mail: 'admin@mail.com', contrasena: 'admin', racha: 0, monedas: 0 },
    { id: 2, nombre_completo: 'Test User', nombre_usuario: 'test', mail: 'test@mail.com', contrasena: '1234', racha: 0, monedas: 0 }
  ]);

  await initializeIfEmpty('Nivel', [
    { id: 1, recompensa: 100 },
    { id: 2, recompensa: 200 }
  ]);

  await initializeIfEmpty('NivelXUsuario', [
    { id: 1, puntaje: 10, tiempo: 60, palabra: 'sol', intento: 1, recompensa_intento: '50', IdUsuario: 1, IdNivel: 1 },
    { id: 2, puntaje: 80, tiempo: 20, palabra: 'mar', intento: 1, recompensa_intento: '30', IdUsuario: 2, IdNivel: 2 }
  ]);

  await initializeIfEmpty('Herramienta', [
    { id: 1, tipo: 'pasa', cantidad: 0, IdUsuario: 1 },
    { id: 2, tipo: 'ayuda', cantidad: 0, IdUsuario: 1 },
    { id: 3, tipo: 'pasa', cantidad: 3, IdUsuario: 2 },
    { id: 4, tipo: 'ayuda', cantidad: 0, IdUsuario: 2 }
  ]);

  await initializeIfEmpty('Vida', [
    { id: 1, cantidad: 5, IdUsuario: 1 },
    { id: 2, cantidad: 1, IdUsuario: 2 }
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
  await initializeIfEmpty('Palabras', palabras.map((p, i) => ({ id: i + 1, palabra: p })));
};

export const getData = async (key: string): Promise<any[]> => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveData = async (key: string, value: any[]) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const addData = async (key: string, item: any): Promise<number> => {
  const data = await getData(key);
  const newId = data.length > 0 ? Math.max(...data.map(d => d.id || 0)) + 1 : 1;
  const newItem = { ...item, id: newId };
  data.push(newItem);
  await saveData(key, data);
  return newId;
};

export const updateData = async (key: string, item: any): Promise<void> => {
  const data = await getData(key);
  const index = data.findIndex(d => d.id === item.id);
  if (index !== -1) {
    data[index] = item;
    await saveData(key, data);
  }
};

export const getItemById = async (key: string, id: number): Promise<any | null> => {
  const data = await getData(key);
  return data.find(d => d.id === id) || null;
};