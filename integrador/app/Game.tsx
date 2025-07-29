import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";

type NivelXUsuario = {
  IdNivel: number;
  puntaje: number;
  tiempo: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;


export default function Game({ route, navigation }: Props) {
  const { nivel, onResultado } = route.params;

  const jugar = () => {
    navigation.navigate('GameScreen', {
      nivel,
    })
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
      <Button title="Jugar" onPress={jugar} />
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