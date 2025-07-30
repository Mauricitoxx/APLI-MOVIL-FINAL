import React from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameWordle from '../components/GameWordle';
import { RootStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { nivel } = route.params;

  const handleGameEnd = (ganado: boolean, puntos?: number, tiempo?: number) => {
    console.log("Fin del juego", { ganado, puntos, tiempo });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <GameWordle IdNivel={nivel.IdNivel} palabraNivel={nivel.palabra} onGameEnd={handleGameEnd} />
    </View>
  );
};

export default GameScreen;

