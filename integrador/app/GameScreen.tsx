import React from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameWordle from '../components/GameWordle';
import { RootStackParamList } from '@/types/navigation';
import { NivelXUsuario } from '@/assets/database/type';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  // Ahora se recibe la prop 'onGameEnd' en lugar de 'onResultado'
  const { nivel, onGameEnd } = route.params;

  const handleGameEnd = (ganado: boolean, puntos?: number , tiempo?: number) => {

    console.log("Fin del juego", { ganado, puntos, tiempo });
    
    const resultado: NivelXUsuario = { ...nivel, puntaje: puntos ?? 0, tiempo: tiempo ?? 0, };
    
    // Se llama a la función onGameEnd que se recibió como prop
    onGameEnd(resultado);

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Se pasa la función 'handleGameEnd' a la prop 'onGameEnd' */}
      <GameWordle IdNivel={nivel.IdNivel} palabraNivel={nivel.palabra} onGameEnd={handleGameEnd} />
    </View>
  );
};

export default GameScreen;
