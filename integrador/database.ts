import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { SQLiteDatabase } from 'expo-sqlite';
import { resetServerContext } from 'expo-font/build/server';

let db: SQLiteDatabase;

const DB_WORDLE = 'app.db';
const DB_LOCATION = FileSystem.documentDirectory + 'SQLite';

export const getDatabase = (): SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_WORDLE);
  }
  return db;
};

export const initializeDatabase = async () => {
  if (Platform.OS === 'web') {
    console.warn("Base de datos local no disponible en web.");
    return;
  }

  const dbFilePath = `${DB_LOCATION}/${DB_WORDLE}`;

  const fileExists = await FileSystem.getInfoAsync(dbFilePath);

  if (!fileExists.exists) {
    console.log('Copiando base de datos desde assets...');
    try {
      await FileSystem.makeDirectoryAsync(DB_LOCATION, { intermediates: true });

      await FileSystem.downloadAsync(
        Asset.fromModule(require('../assets/app.db')).uri,
        dbFilePath
      );

      console.log('Base de datos copiada exitosamente.');
    } catch (error) {
      console.error('Error al copiar la base de datos:', error);
    }
  } else {
    console.log('La base de datos ya existe, no se copia.');
  }
};

export const validarUsuario = async (mail: string, contraseña: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const saved = JSON.parse(localStorage.getItem('usuarios') ?? '[]');
    return saved.some((u: any) => u.mail === mail && u.contraseña === contraseña);
  } else {
    const result = await db.getAllAsync(
      "SELECT * FROM usuarios WHERE mail = ? AND contraseña = ?",
      [mail, contraseña]
    );
    return result.length > 0;
  }
};



