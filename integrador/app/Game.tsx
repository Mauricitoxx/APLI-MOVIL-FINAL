import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NivelXUsuario } from '@/assets/database/type';

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  Game: {
    nivel: NivelXUsuario;
    onResultado?: (nivelActualizado: NivelXUsuario | null) => void;
  };
  Levels: {
    onGameResultFromHome?: (nivelActualizado: NivelXUsuario | null) => void;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function Game({ route, navigation }: Props) {
  const { nivel, onResultado = () => {} } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayGame = () => {
    setIsPlaying(true);
    console.log('Game: Iniciando juego para Nivel', nivel.IdNivel);
  };

  const completarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 100,
      tiempo: 45,
      intento: (nivel.intento || 0) + 1, 
      recompensa_intento: '100',
    };
    console.log('Game: Completar Nivel - Calling onResultado with:', nivelActualizado);
    onResultado(nivelActualizado);
    navigation.goBack();
  };

  const noCompletarNivel = () => {
    const nivelActualizado: NivelXUsuario = {
      ...nivel,
      puntaje: 0,
      tiempo: 9999,
      intento: (nivel.intento || 0) + 1, 
      recompensa_intento: '0',
    };
    console.log('Game: No Completar Nivel - Calling onResultado with:', nivelActualizado);
    onResultado(nivelActualizado);
    navigation.goBack();
  };

  const volverSinCambios = () => {
    console.log('Game: Volver sin cambios - Calling onResultado with null');
    onResultado(null);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../assets/images/statue_of_liberty.jpg')}
          style={styles.cardBackgroundImage}
          resizeMode="cover" 
        />
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nivel {nivel.IdNivel}</Text>
            
            <View style={styles.infoContainer}>
                <Text style={styles.infoTextLabel}>Intentos :</Text>
                <Text style={styles.infoTextValue}>{nivel.intento || 5}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTextLabel}>Tiempo:</Text>
                <Text style={styles.infoTextValue}>{nivel.tiempo || 60}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTextLabel}>Puntaje:</Text>
                <Text style={styles.infoTextValue}>{nivel.puntaje || 0}</Text>
            </View>
        </View>
      </View>

      {!isPlaying ? (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayGame}>
            <Text style={styles.playButtonText}>Jugar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={volverSinCambios}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonGroup}>
          <Button title="Completar Nivel" onPress={completarNivel} color="#4CAF50" />
          <Button title="No Completar Nivel" onPress={noCompletarNivel} color="#F44336" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 30,
    overflow: 'hidden',
  },
  cardBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  cardContent: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  infoTextLabel: {
    fontSize: 18,
    color: '#B0B0B0',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  infoTextValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  buttonGroup: {
    width: '90%',
    maxWidth: 400,
    gap: 15,
  },
  playButton: {
    backgroundColor: '#7a4ef2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  backButton: {
    backgroundColor: '#555555',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});