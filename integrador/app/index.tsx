import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, setupDatabase, seedInitialData } from '@/assets/database/db';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Game';

export default function IndexScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initDatabaseAndSeed = async () => {
      try {
        console.log('IndexScreen: Initializing database from index.tsx...');
        await setupDatabase();
        await seedInitialData();
        
        console.log('IndexScreen: Object stores disponibles:', Array.from((await getDatabase()).objectStoreNames));
        
      } catch (error) {
        console.error('IndexScreen: Error initializing or seeding database:', error);
      }
    };
    initDatabaseAndSeed();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORDLE</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#4962f2',
  },
  button: {
    backgroundColor: '#7a4ef2',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});