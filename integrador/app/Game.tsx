import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type NivelXUsuario = {
  IdNivel: number;
  puntaje: number;
  tiempo: number;
};

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  Game: {
    nivel: NivelXUsuario;
    onResultado: (nivelActualizado: NivelXUsuario | null) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;


export default function Game({ route, navigation }: Props) {
  const { nivel, onResultado } = route.params;

  const completarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 100, // Simulamos un puntaje
      tiempo: 45,   // Simulamos tiempo
    };
    onResultado(nivelActualizado);
    navigation.goBack();
  };

  const noCompletarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 0,
      tiempo: 9999,
    };
    onResultado(nivelActualizado);
    navigation.goBack();
  };

  const volver = () => {
    onResultado(null);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado de Nivel</Text>
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
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
});