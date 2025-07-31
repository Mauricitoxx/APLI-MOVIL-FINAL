import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from '@expo/vector-icons';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import { getNivelesXUsuario } from '@/assets/database/query';
import { NivelXUsuario, RootStackParamList } from '../Game'; // Ensure correct paths for types

const { width } = Dimensions.get('window');
const SPACING = 10;
const ITEM_SIZE_LEVELS_SCREEN = (width - SPACING * 8) / 5;
const TOTAL_NIVELES = 30;

const getBackgroundColor = (status: 'completed' | 'current' | 'locked') => {
  switch (status) {
    case 'completed':
      return '#2E7D32'; // Verde
    case 'current':
      return '#FFA000'; // Naranja
    case 'locked':
      return '#333333'; // Gris oscuro
    default:
      return '#333333';
  }
};

const getTextColor = (status: 'completed' | 'current' | 'locked') => {
  return status === 'locked' ? '#888888' : '#FFFFFF';
};

interface LevelTileProps {
  item: NivelXUsuario & { status: string };
  navigation: any; // Keep `any` for simplicity of navigation object
  onGameResult: ((nivelActualizado: NivelXUsuario | null) => void) | undefined; // <--- Make it UNDEFINED
}

const LevelTile = ({ item, navigation, onGameResult }: LevelTileProps) => {
  const backgroundColor = getBackgroundColor(item.status as 'completed' | 'current' | 'locked');
  const textColor = getTextColor(item.status as 'completed' | 'current' | 'locked');
  const isLocked = item.status === 'locked';

  return (
    <TouchableOpacity
      style={[styles.levelItem, { backgroundColor, width: ITEM_SIZE_LEVELS_SCREEN, height: ITEM_SIZE_LEVELS_SCREEN }]}
      onPress={() => {
        if (!isLocked) {
          navigation.navigate('Game', { 
            nivel: item, 
            onResultado: onGameResult // <--- Pass the potentially undefined callback
          });
          console.log(`LevelsScreen LevelTile: Navigating to Nivel ${item.IdNivel} with full object and onResultado callback (may be undefined).`, item);
        } else {
          console.log(`LevelsScreen LevelTile: Nivel ${item.IdNivel} is locked.`);
        }
      }}
      disabled={isLocked}
    >
      <Text style={[styles.levelText, { color: textColor }]}>
        {isLocked ? <Feather name="lock" size={ITEM_SIZE_LEVELS_SCREEN * 0.6} color={textColor} /> : item.IdNivel}
      </Text>
    </TouchableOpacity>
  );
};

// Update LevelsScreen component props
// Make onGameResultFromHome optional in the route params type
type LevelsScreenProps = NativeStackScreenProps<RootStackParamList, 'Levels'>;

const LevelsScreen = ({ navigation, route }: LevelsScreenProps) => {
  const { userId } = useUser();
  const [levelsToDisplay, setLevelsToDisplay] = useState<Array<NivelXUsuario & { status: string }>>([]);

  // Get the onGameResult callback from navigation params.
  // Use optional chaining or a default empty function if it might be undefined.
  // const onGameResultFromHome = route.params?.onGameResultFromHome; // Safer destructuring
  const { onGameResultFromHome } = route.params || {}; // Safer destructuring with default empty object

  useFocusEffect(
    React.useCallback(() => {
      const fetchAndPrepareLevels = async () => {
        if (!userId) {
          console.log('LevelsScreen: userId is null/undefined, cannot fetch levels.');
          setLevelsToDisplay([]);
          return;
        }

        try {
          const nivelesExistentesDb: NivelXUsuario[] = await getNivelesXUsuario(userId);
          console.log('LevelsScreen: Existing levels fetched from DB:', nivelesExistentesDb);

          const ultimoNivelCompletado = nivelesExistentesDb.length > 0
            ? Math.max(...nivelesExistentesDb.filter(n => n.puntaje > 0).map(n => n.IdNivel))
            : 0;
          let currentLevelToPlay = ultimoNivelCompletado + 1;

          let allLevelsMap = new Map<number, NivelXUsuario>();
          nivelesExistentesDb.forEach(nivel => {
            allLevelsMap.set(nivel.IdNivel, nivel);
          });

          const generatedLevels: Array<NivelXUsuario & { status: string }> = [];
          for (let i = 1; i <= TOTAL_NIVELES; i++) {
            const nivelFromMap = allLevelsMap.get(i);
            let status: 'completed' | 'current' | 'locked';

            if (nivelFromMap && nivelFromMap.puntaje > 0) {
              status = 'completed';
            } else if (i === currentLevelToPlay) {
              status = 'current';
            } else {
              status = 'locked';
            }

            generatedLevels.push({
              id: nivelFromMap?.id || null,
              puntaje: nivelFromMap?.puntaje ?? 0,
              tiempo: nivelFromMap?.tiempo ?? 60,
              palabra: nivelFromMap?.palabra ?? null,
              intento: nivelFromMap?.intento ?? 0,
              recompensa_intento: nivelFromMap?.recompensa_intento ?? '0',
              IdUsuario: userId,
              IdNivel: i,
              status: status,
            });
          }

          console.log('LevelsScreen: Generated levels for display (with status):', generatedLevels);
          setLevelsToDisplay(generatedLevels);

        } catch (err) {
          console.error('LevelsScreen: Error fetching and preparing levels:', err);
          setLevelsToDisplay([{
            id: null, puntaje: 0, tiempo: 60, palabra: null, intento: 0, recompensa_intento: '0',
            IdUsuario: userId, IdNivel: 1, status: 'current'
          }]);
        }
      };

      fetchAndPrepareLevels();
    }, [userId])
  );


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niveles</Text>
      <View style={styles.gridContainer}>
        <FlatList
          data={levelsToDisplay}
          renderItem={({ item }) => (
            <LevelTile 
              item={item} 
              navigation={navigation} 
              onGameResult={onGameResultFromHome} // <--- Pass the received callback here
            />
          )}
          keyExtractor={(item) => String(item.IdNivel)}
          numColumns={5}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  gridContainer: {
    width: '90%',
    alignItems: 'center',
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  levelItem: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING / 2,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LevelsScreen;