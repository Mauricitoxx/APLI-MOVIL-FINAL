import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@/context/UserContext';
import {
  getNivelesXUsuario,
  getUsuarioPorId,
  getVidas,
  updateNivelXUsuario,
  insertNivelXUsuario,
  obtenerPalabraLongitud,
} from '@/assets/database/query';
import ListLevels from '@/components/ListLevels';
import { NivelXUsuario } from '@/assets/database/type';
import { RootStackParamList } from '../Game';
import Footer from '@/components/Footer';
import ToolSelector from '@/components/ToolSelector';
import Countdown from '@/components/CountDown';

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useUser();

  const [monedas, setMonedas] = useState<number | undefined>(undefined);
  const [vidas, setVidas] = useState<number | undefined>(undefined);
  const [nivelesParaListLevelsHome, setNivelesParaListLevelsHome] = useState<any[]>([]);
  const [selected, setSelected] = useState<'verde' | 'amarilla' | 'gris'>('verde');
  const [isLoading, setIsLoading] = useState(true);
  const [nextLevelToPlay, setNextLevelToPlay] = useState<NivelXUsuario | null>(null);

  const options = {
    verde: {
      description: 'VERDE significa que la letra está en la palabra y en la posición CORRECTA'
    },
    amarilla: {
      description: 'AMARILLO significa que la letra está presente en la palabra, pero en la posición INCORRECTA'
    },
    gris: {
      description: 'GRIS significa que la letra NO está presente en la palabra'
    }
  };

  const fetchDataAndPrepareLevels = useCallback(async () => {
    if (!userId) {
      console.log('Home: userId es null/undefined, no se pueden obtener datos ni niveles.');
      setNivelesParaListLevelsHome([{
        id: null, idForFlatList: '1', level: 1, puntaje: 0, tiempo: 0,
        completado: false, disponible: true, bloqueado: false,
        palabra: null, intento: 0, recompensa_intento: '', IdUsuario: 0, IdNivel: 1
      }]);
      setIsLoading(false);
      return;
    }

    try {
      const vidasData = await getVidas(userId);
      setVidas(vidasData.length > 0 ? vidasData[0].cantidad ?? 0 : 0);
      const datosUsuario = await getUsuarioPorId(userId);
      setMonedas(datosUsuario?.monedas ?? 0);

      const nivelesExistentesDb: NivelXUsuario[] = await getNivelesXUsuario(userId);
      console.log('Home: Niveles existentes obtenidos de DB (for display):', nivelesExistentesDb);

      let allRelevantLevelsMap = new Map<number, NivelXUsuario>();
      nivelesExistentesDb.forEach(nivel => {
        allRelevantLevelsMap.set(nivel.IdNivel, nivel);
      });

      if (!allRelevantLevelsMap.has(1)) {
        const palabraInicial = await obtenerPalabraLongitud(3);
        if (palabraInicial) {
          const nuevoNivel = await insertNivelXUsuario(userId, 1, palabraInicial);
          if (nuevoNivel) {
            allRelevantLevelsMap.set(1, nuevoNivel);
          }
        }
      }

      const nivelesIdsCompletados = nivelesExistentesDb
        .filter(n => n.puntaje > 0)
        .map(n => n.IdNivel);

      const ultimoNivelCompletado = nivelesIdsCompletados.length > 0
        ? Math.max(...nivelesIdsCompletados)
        : 0;

      const nivelActualAJugar = ultimoNivelCompletado + 1;
      let levelsToShow: any[] = [];
      
      for (let i = 1; i <= nivelActualAJugar; i++) {
        const rawNivel = allRelevantLevelsMap.get(i);
        
        let completado = false;
        let disponible = false;
        let bloqueado = true;

        if (rawNivel && rawNivel.puntaje > 0) {
          completado = true;
          disponible = true;
          bloqueado = false;
        }

        if (i === nivelActualAJugar) {
          disponible = true;
          bloqueado = false;
        } else if (i < nivelActualAJugar && completado) {
          disponible = true;
          bloqueado = false;
        } else {
          bloqueado = true;
        }

        levelsToShow.push({
          id: rawNivel?.id ?? null,
          idForFlatList: String(i),
          level: i,
          puntaje: rawNivel?.puntaje ?? 0,
          tiempo: rawNivel?.tiempo ?? 0,
          completado: completado,
          disponible: disponible,
          bloqueado: bloqueado,
          palabra: rawNivel?.palabra ?? null,
          intento: rawNivel?.intento ?? 0,
          recompensa_intento: rawNivel?.recompensa_intento ?? '0',
          IdUsuario: userId,
          IdNivel: i,
        });
      }

      setNivelesParaListLevelsHome(levelsToShow);
      // Establecemos el siguiente nivel a jugar
      const nextLevel = levelsToShow.find(n => n.IdNivel === nivelActualAJugar);
      setNextLevelToPlay(nextLevel || null);
      
      console.log('Home: Niveles PROCESADOS FINAL para ListLevels (showing only completed + next):', levelsToShow);
    } catch (err) {
      console.error('Home: Error obteniendo y preparando niveles:', err);
      Alert.alert('Error', 'Hubo un problema al cargar los datos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleGameResult = useCallback(async (nivelActualizado: NivelXUsuario | null) => {
    console.log('Home: handleGameResult received:', nivelActualizado);
    if (!userId) {
      console.error('Home: userId is null in handleGameResult. Cannot save level.');
      Alert.alert('Error', 'Usuario no identificado. No se pudo guardar el nivel.');
      return;
    }

    if (nivelActualizado && nivelActualizado.IdNivel) {
      try {
        const allUserLevels = await getNivelesXUsuario(userId);
        const existingLevelInDb = allUserLevels.find(
          n => n.IdNivel === nivelActualizado.IdNivel && n.IdUsuario === userId
        );
        
        if (existingLevelInDb) {
          console.log(`Home: Level ${nivelActualizado.IdNivel} already exists in DB (ID: ${existingLevelInDb.id}). Updating.`);
          const finalNivelToSave = {
            ...existingLevelInDb,
            puntaje: nivelActualizado.puntaje,
            tiempo: nivelActualizado.tiempo,
            intento: nivelActualizado.intento,
            recompensa_intento: nivelActualizado.recompensa_intento,
            palabra: existingLevelInDb.palabra || nivelActualizado.palabra,
          };
          await updateNivelXUsuario(finalNivelToSave);
          Alert.alert('Nivel Actualizado', `Nivel ${finalNivelToSave.IdNivel} se ha actualizado.`);
        } else {
          console.error(`Home: Lógica incorrecta. El nivel ${nivelActualizado.IdNivel} no debería ser un nivel nuevo si ya se está jugando. Se intentará insertar.`);
          const insertedNivel = await insertNivelXUsuario(
            userId,
            nivelActualizado.IdNivel,
            nivelActualizado.palabra
          );
          if (insertedNivel) {
            const updatedInsertedNivel: NivelXUsuario = {
              ...insertedNivel,
              puntaje: nivelActualizado.puntaje,
              tiempo: nivelActualizado.tiempo,
              intento: nivelActualizado.intento,
              recompensa_intento: nivelActualizado.recompensa_intento,
            };
            await updateNivelXUsuario(updatedInsertedNivel);
            Alert.alert('Nivel Completado', `¡Nivel ${updatedInsertedNivel.IdNivel} guardado!`);
          } else {
            console.error('Home: Error al insertar el nuevo NivelXUsuario.');
            Alert.alert('Error', 'No se pudo guardar el nuevo nivel.');
          }
        }
        fetchDataAndPrepareLevels();
      } catch (err) {
        console.error('Home: Error processing game result for level', nivelActualizado?.IdNivel, ':', err);
        Alert.alert('Error', 'Hubo un problema al guardar el resultado del nivel.');
      }
    } else {
      console.log('Home: Nivel no completado o se volvió sin cambios.');
      fetchDataAndPrepareLevels();
    }
  }, [userId, fetchDataAndPrepareLevels]);

  useFocusEffect(fetchDataAndPrepareLevels);
  
  const handlePlayButton = () => {
    // Si no hay vidas, mostramos una alerta y no navegamos
    if (vidas === 0) {
      Alert.alert(
        'Vidas agotadas',
        'No te quedan vidas para jugar. Puedes comprar más en la tienda o esperar a que se recarguen.'
      );
      return;
    }

    if (!nextLevelToPlay) {
      Alert.alert('Error', 'El nivel no está disponible. Por favor, espera a que se carguen los datos.');
      return;
    }
  
    console.log('Home: Navegando al último nivel disponible:', nextLevelToPlay.IdNivel);
    navigation.navigate('Game', {
      nivel: nextLevelToPlay,
      onGameEnd: handleGameResult,
    });
  };

  function capitalize(color: string) {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }

  if (isLoading) {
    return (
      <View style={[styles.fullScreenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7a4ef2" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} horizontal={false} showsVerticalScrollIndicator={true}>
        <View style={styles.header}>
          <View style={styles.currency}>
            <Text style={styles.currencyText}>💰 {monedas ?? 'Cargando...'}</Text>
          </View>
          <View style={styles.currency}>
            <Text style={styles.currencyText}>❤️ {vidas ?? 'Cargando...'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Niveles</Text>
        {nivelesParaListLevelsHome.length > 0 ? (
          <ListLevels
            niveles={nivelesParaListLevelsHome}
            navigation={navigation}
            onGameResult={handleGameResult}
          />
        ) : (
          <Text style={styles.noLevelsAvailable}>No hay niveles disponibles para mostrar.</Text>
        )}

        <View style={styles.nextLifeBox}>
          <Text style={styles.nextLifeText}>
            <Countdown />
          </Text>
        </View>

        <ToolSelector />

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>¿Cómo Jugar?</Text>
          <Text style={styles.rulesSubtitle}>El objetivo del juego es adivinar la palabra oculta. La palabra puede tener desde 3 a 6 letras y se tiene 6 intentos para adivinarla. Las palabras pueden no repertirse en el mismo número de nivel entre usuarios.</Text>
          <Text style={styles.rulesSubtitle}>Cada intento debe ser una palabra válida. En cada ronda el juego pinta cada letra de un color indicando si esa letra se encuentra o no en la palabra y si se encuentra en la posición correcta.</Text>
          <View style={styles.rulesButtons}>
            {['verde', 'amarilla', 'gris'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.ruleButton,
                  selected === color && styles.ruleButtonSelected,
                ]}
                onPress={() => setSelected(color as 'verde' | 'amarilla' | 'gris')}
              >
                <Text
                  style={[
                    styles.ruleButtonText,
                    selected === color && styles.ruleButtonTextSelected,
                  ]}
                >
                  {`Letra ${capitalize(color)}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.ruleDescriptionBox}>
            <Image
              source={
                selected === 'verde'
                  ? require('../images/verdeLetra.png')
                  : selected === 'amarilla'
                  ? require('../images/amarillaLetra.png')
                  : require('../images/grisLetra.png')
              }
              style={styles.ruleImage}
              resizeMode="contain"
            />
            <Text style={styles.ruleDescription}>{options[selected].description}</Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity 
        style={[styles.playButton, vidas === 0 && styles.disabledButton]} 
        onPress={handlePlayButton} 
        disabled={vidas === 0 || isLoading}
      >
        <Text style={styles.playText}>
          {isLoading ? 'Cargando...' : vidas === 0 ? 'Sin vidas' : 'Jugar'}
        </Text>
      </TouchableOpacity>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  currency: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
  },
  currencyText: {
    color: '#fff',
    fontSize: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 6,
  },
  noLevelsAvailable: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  imageBox: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  nextLifeBox: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  nextLifeText: {
    color: '#fff',
    textAlign: 'center',
  },
  rulesContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    margin: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 12,
  },
  rulesSubtitle: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 10,
    textAlign: 'center',
  },
  rulesButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  ruleButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    marginTop: 8,
  },
  ruleButtonSelected: {
    backgroundColor: '#00ff88',
  },
  ruleButtonText: {
    color: '#ccc',
    fontWeight: '500',
  },
  ruleButtonTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  ruleDescriptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  ruleImage: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 10,
  },
  ruleDescription: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  counterBox: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  counterLabel: {
    color: '#fff',
  },
  counterNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#7a4ef2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    position: 'absolute',
    bottom: 85,
    left: 15,
    right: 15,
  },
  playText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: '#555',
  },
});