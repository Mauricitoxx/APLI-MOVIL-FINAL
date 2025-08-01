import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameWordle from '../components/GameWordle';
import { RootStackParamList } from '@/types/navigation';
import { NivelXUsuario } from '@/assets/database/type';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { nivel, onGameEnd } = route.params;

  if (!nivel || !nivel.palabra) {
    console.error('GameScreen: Nivel o palabra no definidos. Volviendo a la pantalla anterior.');
    navigation.goBack();
    return null;
  }

  const handleGameEnd = (ganado: boolean, puntos?: number, tiempo?: number) => {
    console.log("Fin del juego", { ganado, puntos, tiempo });
    
    const resultado: NivelXUsuario = { ...nivel, puntaje: puntos ?? 0, tiempo: tiempo ?? 0 };
    
    // Verificación de seguridad antes de llamar a onGameEnd
    if (onGameEnd && typeof onGameEnd === 'function') {
      onGameEnd(resultado);
    } else {
      console.warn("GameScreen: La función onGameEnd no es válida o no fue proporcionada. Continuando sin llamar a callback.");
    }

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <GameWordle IdNivel={nivel.IdNivel} palabraNivel={nivel.palabra} onGameEnd={handleGameEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121213',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
});

export default GameScreen;