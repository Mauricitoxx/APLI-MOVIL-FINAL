import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    if (!mail || !password) {
      setError('Completa todos los campos');
      return;
    }

    const usuario = usuarioRegistrado.find(
      (u) => u.mail === mail && u.password === password
    );

    if (usuario) {
      setError('');
      navigation.navigate('Home')
    } else {
      setError('Usuario no registrado. Por favor regístrese.');
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Comencemos a jugar
        </Text>
        <View style={styles.separator} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su Email"
          value={mail}
          onChangeText={setMail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar sesión</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}> ¿No tienes cuenta? Regístrate </Text>
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
    backgroundColor: '#000', // Fondo negro general
  },
  card: {
    width: '90%',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#111', // Fondo oscuro de la tarjeta
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
  separator: {
    width: 40,
    height: 4,
    backgroundColor: '#7a4ef2', // Violeta
    borderRadius: 2,
    marginBottom: 18,
    opacity: 0.4,
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
});
