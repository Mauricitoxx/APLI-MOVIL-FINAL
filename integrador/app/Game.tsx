import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type NivelXUsuario = {
  id?: number | null; // Make id optional and allow null for new levels
  puntaje: number;
  tiempo: number;
  palabra: string | null; // Added
  intento: number; // Added
  recompensa_intento: string; // Added
  IdUsuario: number; // Added
  IdNivel: number;
};

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  Game: {
    nivel: NivelXUsuario;
    // The onResultado callback will now always receive a NivelXUsuario object
    // If no changes, it passes the original. If 'volver sin cambios', it will pass null
    onResultado?: (nivelActualizado: NivelXUsuario | null) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function Game({ route, navigation }: Props) {
  // Destructure with default empty function for safety
  const { nivel, onResultado = () => {} } = route.params;

  const completarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 100, // Simulamos un puntaje
      tiempo: 45,   // Simulamos tiempo
    };
    onResultado(nivelActualizado); // Pass the updated level object
    navigation.goBack();
  };

  const noCompletarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 0,
      tiempo: 9999,
    };
    onResultado(nivelActualizado); // Pass the updated level object
    navigation.goBack();
  };

  const volver = () => {
    onResultado(null); // Pass null to indicate no changes/abort
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado de Nivel</Text>
      <Text>Nivel ID: {nivel.IdNivel}</Text>
      <Text>Puntaje Inicial: {nivel.puntaje}</Text>
      <Text>Tiempo Inicial: {nivel.tiempo}</Text>
      <Button title="Completar Nivel" onPress={completarNivel} />
      <Button title="No Completar Nivel" onPress={noCompletarNivel} />
      <Button title="Volver sin cambios" onPress={volver} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1a1a1a', // Added for better visibility
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // Added for better visibility
  },
});