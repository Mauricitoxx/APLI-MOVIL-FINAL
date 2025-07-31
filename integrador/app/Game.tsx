import React, { useCallback } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { useFocusEffect } from "expo-router";

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;


export default function Game({ route, navigation }: Props) {
  const { nivel, onResultado, resultado } = route.params;

  const jugar = () => {
    navigation.push('GameScreen', { nivel, onResultado})
  };

  const volver = () => {
    onResultado(null);
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      if (resultado && onResultado) {
        onResultado(resultado!);
        navigation.setParams({ resultado: null });
      }
    }, [resultado])
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado de Nivel</Text>
      <Button title="Jugar" onPress={jugar} />
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