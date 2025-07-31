import React, { useEffect, useState } from 'react';
import AppNavigator from './AppNavigator';
import { setupIndexedDB, getDB } from '@/assets/database/db';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {

  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setupIndexedDB();
      const db = await getDB();
      console.log('Stores disponibles:', Array.from(db.objectStoreNames));
      setIsDBReady(true);
    };
    init();
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