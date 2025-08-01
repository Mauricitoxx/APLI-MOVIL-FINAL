import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NivelXUsuario } from '@/assets/database/type';
import { useNavigation } from "@react-navigation/native";
import { obtenerPalabraLongitud, insertNivelXUsuario } from '@/assets/database/query';
import { useUser } from '@/context/UserContext';
import type { RootStackParamList } from './LevelsScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function Game({ route, navigation }: Props) {
  const [nivelConPalabra, setNivelConPalabra] = useState<NivelXUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUser();
  const { nivel, onGameEnd } = route.params;

  useEffect(() => {
    const loadLevelData = async () => {
      try {
        let tempNivel = { ...nivel };

        if (!userId) {
          console.error("Game: userId no está disponible. Volviendo.");
          navigation.goBack();
          return;
        }
        
        if (!tempNivel.palabra) {
          console.log(`Game: Buscando palabra para el nivel ${tempNivel.IdNivel}...`);
          // Calculamos la longitud de la palabra basándonos en el IdNivel
          const longitudPalabra = 2 + Math.ceil(tempNivel.IdNivel / 5);
          const palabraObtenida = await obtenerPalabraLongitud(longitudPalabra);
          
          if (palabraObtenida) {
            tempNivel.palabra = palabraObtenida;
            // Intentamos insertar el nivel en la DB
            const nivelInsertado = await insertNivelXUsuario(userId, tempNivel.IdNivel, palabraObtenida);
            if (nivelInsertado) {
              tempNivel = nivelInsertado;
            }
          } else {
            console.error('Game: No se pudo obtener una palabra. Volviendo a la pantalla anterior.');
            navigation.goBack();
            return;
          }
        }

        setNivelConPalabra(tempNivel);
        setIsLoading(false);

      } catch (error) {
        console.error('Game: Error al cargar los datos del nivel:', error);
        navigation.goBack();
      }
    };

    loadLevelData();
  }, [nivel, navigation, userId]);

  const handlePlayGame = () => {
    console.log('Game: Navegando a GameScreen para Nivel', nivel.IdNivel);
    if (nivelConPalabra) {
      navigation.navigate('GameScreen', {
        nivel: nivelConPalabra,
        onGameEnd: onGameEnd,
      });
    }
  };

  const volverSinCambios = () => {
    console.log('Game: Volver sin cambios - Calling onGameEnd with null');
    if (onGameEnd && typeof onGameEnd === 'function') {
      onGameEnd(null);
    }
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7a4ef2" />
        <Text style={styles.loadingText}>Cargando nivel...</Text>
      </View>
    );
  }

  if (!nivelConPalabra) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Error al cargar el nivel.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../assets/images/statue_of_liberty.jpg')}
          style={styles.cardBackgroundImage}
          resizeMode="cover" 
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Nivel {nivelConPalabra.IdNivel}</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTextLabel}>Intentos :</Text>
            <Text style={styles.infoTextValue}>{nivelConPalabra.intento || 5}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTextLabel}>Tiempo:</Text>
            <Text style={styles.infoTextValue}>{nivelConPalabra.tiempo || 0}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTextLabel}>Puntaje:</Text>
            <Text style={styles.infoTextValue}>{nivelConPalabra.puntaje || 0}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayGame}>
          <Text style={styles.playButtonText}>Jugar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={volverSinCambios}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 18,
  },
});