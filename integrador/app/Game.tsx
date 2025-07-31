import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NivelXUsuario } from '@/assets/database/type'; // Ensure this path is correct for your NivelXUsuario type

// Define the RootStackParamList in a central place if possible (e.g., a types.ts file)
// For now, it's defined here for completeness of Game.tsx context.
// It's crucial that this definition is consistent across all files using it.
export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  Game: {
    nivel: NivelXUsuario; // Expects the full NivelXUsuario object
    onResultado?: (nivelActualizado: NivelXUsuario | null) => void; // Optional callback for game outcome
  };
  Levels: { // Parameters for the LevelsScreen
    onGameResultFromHome?: (nivelActualizado: NivelXUsuario | null) => void; // Optional callback from Home, passed to Levels
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function Game({ route, navigation }: Props) {
  // Destructure 'nivel' from route.params.
  // Destructure 'onResultado' from route.params, providing a default empty function
  // so the app doesn't crash if 'onResultado' is not passed (e.g., if navigating directly for testing).
  const { nivel, onResultado = () => {} } = route.params;

  const completarNivel = () => {
    // Create a new NivelXUsuario object to represent the updated state after completion.
    // Spread 'nivel' to retain all its original properties (like 'id', 'IdUsuario', 'IdNivel', 'palabra').
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 100, // Simulate a completed score
      tiempo: 45,   // Simulate time taken
      intento: (nivel.intento || 0) + 1, // Increment attempt count
      recompensa_intento: '100', // Example reward for completion
    };
    console.log('Game: Completar Nivel - Calling onResultado with:', nivelActualizado);
    onResultado(nivelActualizado); // Call the provided callback with the updated level data.
    navigation.goBack(); // Navigate back to the previous screen (Home or LevelsScreen).
  };

  const noCompletarNivel = () => {
    // Create a NivelXUsuario object for a non-completed level.
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 0,    // Score is 0 for non-completion
      tiempo: 9999, // High time indicating not finished or failed
      intento: (nivel.intento || 0) + 1, // Still counts as an attempt
      recompensa_intento: '0', // No reward for non-completion
    };
    console.log('Game: No Completar Nivel - Calling onResultado with:', nivelActualizado);
    onResultado(nivelActualizado); // Call the callback.
    navigation.goBack(); // Navigate back.
  };

  const volver = () => {
    console.log('Game: Volver sin cambios - Calling onResultado with null');
    onResultado(null); // Pass null to indicate the user decided not to complete or save.
    navigation.goBack(); // Navigate back.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado de Nivel</Text>
      <Text style={styles.infoText}>Nivel ID: {nivel.IdNivel}</Text>
      <Text style={styles.infoText}>Puntaje Inicial: {nivel.puntaje}</Text>
      <Text style={styles.infoText}>Tiempo Inicial: {nivel.tiempo}</Text>
      {/* Display the IndexedDB 'id'. Will be 'N/A (Nuevo)' if it's a new level not yet persisted. */}
      <Text style={styles.infoText}>IndexedDB ID: {nivel.id === null ? 'N/A (Nuevo)' : nivel.id}</Text>
      
      {/* Action Buttons */}
      <Button title="Completar Nivel" onPress={completarNivel} />
      <Button title="No Completar Nivel" onPress={noCompletarNivel} />
      <Button title="Volver sin cambios" onPress={volver} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10, // Adds space between elements
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#1a1a1a', // Dark background for game theme
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff', // White text for title
  },
  infoText: {
    fontSize: 16,
    color: '#ccc', // Light gray text for info
    marginBottom: 5,
  },
  button: {
    marginTop: 10, // Space between buttons (if you were to style buttons directly)
  }
});