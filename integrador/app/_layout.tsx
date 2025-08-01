import React, { useEffect, useState } from 'react';
import AppNavigator from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';

// Importa las funciones con los nombres correctos
import { setupDatabase, getDatabase } from '@/assets/database/db';

export default function RootLayout() {
  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Llama a la función principal para configurar la base de datos
        // getDatabase() internamente llama a setupDatabase() si no está lista
        const db = await getDatabase();
        console.log('Base de datos inicializada. Stores disponibles:', Array.from(db.objectStoreNames));
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
      } finally {
        setIsDBReady(true);
      }
    };
    initDatabase();
  }, []);

  if (!isDBReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}