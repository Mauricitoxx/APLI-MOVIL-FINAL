import React, { use, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registrarUsuario } from '@/assets/database/query';

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [mail, setMail] = useState('');
  const [user, setUser] = useState('');
  const [rep_password, setRep_Password] = useState('');
  const [localError, setLocalError] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name || !password || !mail || !user || !rep_password) {
      setLocalError('Completa todos los campos');
      return;
    }
    setLocalError('');

    if (password !== rep_password){
      setLocalError("Contraseñas incorrectas");
      return;
    }
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
      console.error("Error al registrar al usuario.");
    }else{
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrarse</Text>
        <Text style={styles.subtitle}>
          Regístrate para jugar y guardar yu progeso
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={mail}
          onChangeText={setMail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre Completo"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario (Nickname)"
          value={user}
          onChangeText={setUser}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Repetir Contraseña"
          value={rep_password}
          onChangeText={setRep_Password}
          secureTextEntry
        />
        {localError ? <Text style={styles.error}>{localError}</Text> : null}
        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
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