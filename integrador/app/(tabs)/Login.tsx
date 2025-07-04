import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Completa todos los campos');
      return;
    }
    // Aquí iría la lógica de login
    setError('');
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Organiza tus tareas y logra tus objetivos diarios
        </Text>
        <View style={styles.separator} />
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { width: '90%', borderRadius: 18, padding: 28, alignItems: 'center', elevation: 8, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4962f2', marginBottom: 10, textAlign: 'center', letterSpacing: 1, marginTop: 10 },
  subtitle: { fontSize: 17, marginBottom: 18, textAlign: 'center' },
  separator: { width: 40, height: 4, backgroundColor: '#4962f2', borderRadius: 2, marginBottom: 18, opacity: 0.15 },
  input: { width: '100%', borderWidth: 1, borderColor: '#4962f2', borderRadius: 10, padding: 14, marginBottom: 14, backgroundColor: '#f7f9fd', color: '#222', fontSize: 16 },
  button: { backgroundColor: '#4962f2', paddingVertical: 14, borderRadius: 10, alignItems: 'center', width: '100%', marginBottom: 10, marginTop: 6, elevation: 2 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 1 },
  error: { color: '#d32f2f', marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  link: { color: '#4962f2', textAlign: 'center', marginTop: 20, textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 18 },
});