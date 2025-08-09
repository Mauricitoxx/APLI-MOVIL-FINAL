import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Game';
import { setupAsyncStorage } from '@/assets/database/db';

export default function IndexScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('IndexScreen: Inicializando AsyncStorage desde index.tsx...');
        await setupAsyncStorage(); 
      } catch (error) {
        console.error('IndexScreen: Error al inicializar AsyncStorage:', error);
      }
    };
    initDatabase();
  }, []);

    return (
    <ImageBackground 
      source={{ uri: 'https://imgs.search.brave.com/aMSYu0d_zR0PH6YadBSb6KTUWKnZInjT-nalTe2ChQE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvc21v/a2Utd2lzcC1kYXJr/LXB1cnBsZS1hbmQt/YmxhY2stYjN1OXRj/NXc3bTRtNDdscS5q/cGc' }}
      resizeMode="cover"
      style={styles.background}
      blurRadius={1}
    >
      <View style={styles.container}>
        <Text style={styles.title}>WORDLE</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', 
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#fff',
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
