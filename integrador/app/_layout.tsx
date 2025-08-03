import React, { useEffect, useState } from 'react';
import AppNavigator from './AppNavigator';
import { setupAsyncStorage } from '@/assets/database/db'; // <-- usa la nueva función
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setupAsyncStorage(); // <-- nueva función
      console.log('AsyncStorage inicializado');
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
