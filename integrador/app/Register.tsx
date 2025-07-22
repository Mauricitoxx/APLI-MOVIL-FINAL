import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registrarUsuario } from '@/assets/database/query';

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [user, setUser] = useState('');
  const [rep_password, setRep_Password] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();

  // Animación para la notificación
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (showSuccess) {
      // Animación de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Ocultar después de 3 segundos y navegar a Login
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
          navigation.navigate('Login', {
            successMessage: 'Enhorabuena, has sido registrado de forma exitosa, ahora inicia sesión'
          });
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleRegister = async () => {
    if (!name || !password || !mail || !user || !rep_password) {
      setLocalError('Completa todos los campos');
      return;
    }
    
    if (password !== rep_password){
      setLocalError("Contraseñas incorrectas");
      return;
    }
    
    setIsLoading(true);
    setLocalError('');
    
    const result = await registrarUsuario({
      nombre_completo: name,
      nombre_usuario: user,
      mail,
      contrasena: password,
      racha: 0,
      monedas: 0,
    })

    if (!result.ok) {
      setLocalError(result.error);
      setIsLoading(false);
    } else {
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      {/* Notificación de éxito en la parte superior */}
      {showSuccess && (
        <Animated.View style={[styles.notification, { opacity: fadeAnim }]}>
          <Text style={styles.notificationText}>
            Enhorabuena, has sido registrado de forma exitosa, ahora inicia sesión
          </Text>
        </Animated.View>
      )}
      
      <View style={styles.card}>
        <Text style={styles.title}>Registrarse</Text>
        <Text style={styles.subtitle}>
          Regístrate para jugar y guardar tu progreso
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={mail}
          onChangeText={setMail}
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario (Nickname)"
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Repetir Contraseña"
          value={rep_password}
          onChangeText={setRep_Password}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        
        {localError ? <Text style={styles.error}>{localError}</Text> : null}
        
        <Pressable 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </Text>
        </Pressable>
        
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  card: {
    width: '90%',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#111',
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 18,
    textAlign: 'center',
    color: '#aaa',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#7a4ef2',
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7a4ef2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  error: {
    color: '#f55',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: '#7a4ef2',
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para la notificación (diseño preservado)
  notification: {
    position: 'absolute',
    top: 50,
    width: '90%',
    backgroundColor: '#4BB543',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  notificationText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
});