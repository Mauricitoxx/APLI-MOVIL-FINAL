import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ToolSelector from '@/components/ToolSelector';
import Countdown from '@/components/CountDown';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import { getNivelesXUsuario, getUsuarioPorId, getVidas } from '@/assets/database/query';
import ListLevels from '@/components/ListLevels';
import { NivelXUsuario } from '@/assets/database/type';
import Footer from '@/components/Footer';


export default function Home() {
  const navigation = useNavigation();
  const { userId } = useUser();

  const [monedas, setMonedas] = useState<number | undefined>(undefined);
  const [vidas, setVidas] = useState<number | undefined>(undefined);

  const [nivelesParaListLevelsHome, setNivelesParaListLevelsHome] = useState<any[]>([]);


  const [selected, setSelected] = useState<'verde' | 'amarilla' | 'gris'>('verde');
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
  }

  useEffect(() => {
    const fetchVida = async () => {
      if (!userId) return;
      const vidas = await getVidas(userId);
      if (vidas.length > 0) {
        const cantidad = vidas[0].cantidad ?? 0;
        setVidas(cantidad);
      } else {
        setVidas(0);
      }
    };
    fetchVida();
  }, [userId]);

  useEffect(() => {
    const fetchUsuario = async () => {
      if (!userId) return;
      try {
        const datosUsuario = await getUsuarioPorId(userId);
        setMonedas(datosUsuario?.monedas ?? 0);
      } catch (err) {
        console.error('Home: Error obteniendo usuario:', err);
        setMonedas(0);
      }
    };
    fetchUsuario();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAndPrepareLevelsForHome = async () => {
        if (!userId) {
          console.log('Home: userId es null/undefined, no se pueden obtener niveles para ListLevels.');
          setNivelesParaListLevelsHome([{
            id: '1', level: 1, puntaje: 0, tiempo: 60,
            completado: false, disponible: true, bloqueado: false,
            palabra: null, intento: 0, recompensa_intento: '', IdUsuario: 0, IdNivel: 1, idForFlatList: '1'
          }]);
          return;
        }
        try {
          const nivelesExistentesDb: NivelXUsuario[] = await getNivelesXUsuario(userId);
          console.log('Home: Niveles existentes obtenidos de DB:', nivelesExistentesDb);

          const nivelesIdsCompletados = nivelesExistentesDb
                                        .filter(n => n.puntaje > 0)
                                        .map(n => n.IdNivel);
          console.log('Home: nivelesIdsCompletados:', nivelesIdsCompletados);


          const ultimoNivelCompletado = nivelesIdsCompletados.length > 0
                                        ? Math.max(...nivelesIdsCompletados)
                                        : 0;
          console.log('Home: ultimoNivelCompletado:', ultimoNivelCompletado);


          let nivelActualAJugar = ultimoNivelCompletado + 1;
          console.log('Home: nivelActualAJugar (nivel a mostrar en amarillo):', nivelActualAJugar);


          const levelsToShow: any[] = [];
          const MAX_LEVELS_TO_DISPLAY = 4;

          let allRelevantLevelsMap = new Map<number, NivelXUsuario>();

          nivelesExistentesDb.forEach(nivel => {
              allRelevantLevelsMap.set(nivel.IdNivel, nivel);
          });

          let currentLevelObjForProcessing: NivelXUsuario | undefined = allRelevantLevelsMap.get(nivelActualAJugar);

          if (!currentLevelObjForProcessing) {
            currentLevelObjForProcessing = {
                id: null, // ID de DB es null hasta que se inserte
                level: nivelActualAJugar,
                puntaje: 0,
                tiempo: 60,
                palabra: null, intento: 0, recompensa_intento: '0',
                IdUsuario: userId,
                IdNivel: nivelActualAJugar
            };
            allRelevantLevelsMap.set(nivelActualAJugar, currentLevelObjForProcessing);
          } else if (currentLevelObjForProcessing.puntaje > 0) {
              const nextActualLevel = nivelActualAJugar + 1;
              let nextActualLevelObj = allRelevantLevelsMap.get(nextActualLevel);
              if (!nextActualLevelObj) {
                  nextActualLevelObj = {
                    id: null, // ID de DB es null
                    level: nextActualLevel,
                    puntaje: 0, tiempo: 60, palabra: null, intento: 0, recompensa_intento: '0',
                    IdUsuario: userId, IdNivel: nextActualLevel
                  };
                  allRelevantLevelsMap.set(nextActualLevel, nextActualLevelObj);
              }
              nivelActualAJugar = nextActualLevel;
          }


          let sortedLevelsToDisplay = Array.from(allRelevantLevelsMap.values()).sort((a, b) => a.IdNivel - b.IdNivel);

          for (const rawNivel of sortedLevelsToDisplay) {
              let completado = false;
              let disponible = false;
              let bloqueado = false;

              if (rawNivel.puntaje > 0) {
                completado = true;
              }

              if (rawNivel.IdNivel === nivelActualAJugar) {
                  disponible = true;
              } else if (rawNivel.IdNivel < nivelActualAJugar && completado) {
                  disponible = true;
              }

              levelsToShow.push({
                // id: Pasamos el 'id' numérico de la DB. Será null para niveles no insertados.
                id: rawNivel.id,
                // idForFlatList: Usamos el ID de la DB (convertido a string) o el IdNivel temporal.
                idForFlatList: rawNivel.id ? String(rawNivel.id) : String(rawNivel.IdNivel),
                level: rawNivel.IdNivel,
                puntaje: rawNivel.puntaje ?? 0,
                tiempo: rawNivel.tiempo ?? 60,
                completado: completado,
                disponible: disponible,
                bloqueado: bloqueado,
                palabra: rawNivel.palabra ?? null,
                intento: rawNivel.intento ?? 0,
                recompensa_intento: rawNivel.recompensa_intento ?? '',
                IdUsuario: rawNivel.IdUsuario ?? userId,
                IdNivel: rawNivel.IdNivel,
              });
          }

          setNivelesParaListLevelsHome(levelsToShow);
          console.log('Home: Niveles PROCESADOS FINAL para ListLevels (con status y DB id):', levelsToShow);

        } catch (err) {
          console.error('Home: Error obteniendo y preparando niveles para ListLevels:', err);
          setNivelesParaListLevelsHome([{
            id: null, idForFlatList: '1', level: 1, puntaje: 0, tiempo: 60,
            completado: false, disponible: true, bloqueado: false,
            palabra: null, intento: 0, recompensa_intento: '', IdUsuario: userId, IdNivel: 1
          }]);
        }
      };

      fetchAndPrepareLevelsForHome();
    }, [userId])
  );


  function capitalize(color: string) {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }


  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 150 }} horizontal={false} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.currency}>
            <Text style={styles.currencyText}>💰 {monedas ?? 'Cargando...'}</Text>
          </View>
          <View style={styles.currency}>
            <Text style={styles.currencyText}>❤️ {vidas ?? 'Cargando...'}</Text>
          </View>
        </View>

        {/* Niveles - Ahora pasa los niveles procesados a ListLevels */}
        <Text style={styles.sectionTitle}>Niveles</Text>
        {nivelesParaListLevelsHome.length > 0 ? (
          <ListLevels
            niveles={nivelesParaListLevelsHome}
            navigation={navigation}
          />
        ) : (
          <Text style={styles.noLevelsAvailable}>No hay niveles disponibles para mostrar.</Text>
        )}


        {/* Próxima vida */}
        <View style={styles.nextLifeBox}>
          <Text style={styles.nextLifeText}><Countdown /></Text>
        </View>

        {/* Herramientas */}
        <ToolSelector />

        {/* Como Jugar */}
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
      {/* Botón jugar y Footer */}
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playText}>Jugar</Text>
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
  section: {
    marginBottom: 10,
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
});