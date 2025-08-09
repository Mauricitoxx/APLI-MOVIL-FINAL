import React from 'react';
import { StyleSheet, SafeAreaView, useWindowDimensions, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameWordle from '../components/GameWordle';
import { RootStackParamList } from '@/types/navigation';
import { NivelXUsuario } from '@/assets/database/type';

type Props = NativeStackScreenProps<RootStackParamList, 'GameScreen'>;

const GameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { nivel, onGameEnd } = route.params;
  const { width, height } = useWindowDimensions();

  if (!nivel || !nivel.palabra) {
    console.error('GameScreen: Nivel o palabra no definidos. Volviendo a la pantalla anterior.');
    navigation.goBack();
    return null;
  }

  const handleGameEnd = (ganado: boolean, puntos?: number, tiempo?: number) => {
    console.log("Fin del juego", { ganado, puntos, tiempo });

    const resultado: NivelXUsuario = { ...nivel, puntaje: puntos ?? 0, tiempo: tiempo ?? 60 };

    if (onGameEnd && typeof onGameEnd === 'function') {
      onGameEnd(resultado);
    } else {
      console.warn("GameScreen: La función onGameEnd no es válida o no fue proporcionada. Continuando sin llamar a callback.");
    }

    navigation.goBack();
  };

  const isPortrait = height >= width;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121213' }}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: isPortrait ? width * 0.05 : width * 0.01,
            paddingVertical: isPortrait ? height * 0.03 : height * 0.01,
            maxWidth: Math.min(600, width * 0.9),
          },
        ]}
      >
        <GameWordle IdNivel={nivel.IdNivel} palabraNivel={nivel.palabra} onGameEnd={handleGameEnd} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    alignContent: 'center',
  },
});

export default GameScreen;
