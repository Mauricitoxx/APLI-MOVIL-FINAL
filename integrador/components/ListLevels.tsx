import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Button, Dimensions } from 'react-native';
import type { NivelXUsuario } from '@/assets/database/type';
import { useUser } from '@/context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Game';

const { width } = Dimensions.get('window');
const SPACING = 10;
const ITEM_SIZE_HOME_4_COLUMNS = (width - SPACING * 5) / 4;

interface Props {
  niveles: NivelXUsuario[];
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onGameResult: (nivelActualizado: NivelXUsuario | null) => void;
}

const ListLevels: React.FC<Props> = ({ niveles, navigation, onGameResult }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelXUsuario | null>(null);
  const { userId } = useUser();

  const handleSeleccionarNivel = (nivel: NivelXUsuario) => {
    // Determine if the level is available based on your game logic.
    // For example, if it's the first level or the previous one is completed.
    const isAvailable = nivel.IdNivel === 1 || niveles.some(n => n.IdNivel === nivel.IdNivel - 1 && n.puntaje > 0);

    if (isAvailable) {
      setNivelSeleccionado(nivel);
      setModalVisible(true);
    } else {
      console.log(`ListLevels: Nivel ${nivel.IdNivel} no está disponible (bloqueado).`);
    }
  };

  const confirmarYJugar = () => {
    if (!nivelSeleccionado) return;

    setModalVisible(false);

    navigation.navigate('Game', {
      nivel: nivelSeleccionado,
      onResultado: onGameResult,
    });
  };

  const renderItem = ({ item }: { item: NivelXUsuario }) => {
    const isCompleted = item.puntaje > 0;
    const isNextLevel = item.IdNivel === niveles.length + 1;
    const isBlocked = item.IdNivel > 1 && !niveles.some(n => n.IdNivel === item.IdNivel - 1 && n.puntaje > 0);

    const getCardStyle = () => {
      if (isCompleted) return styles.cardCompletado;
      if (isBlocked) return styles.cardBloqueado;
      return styles.cardDisponible;
    };

    return (
      <TouchableOpacity
        key={item.id?.toString()}
        style={[styles.card, getCardStyle()]}
        disabled={isBlocked}
        onPress={() => handleSeleccionarNivel(item)}
      >
        <Text style={styles.title}>Nivel {item.IdNivel}</Text>
        <Text style={styles.infoText}>Puntaje: {item.puntaje}</Text>
        <Text style={styles.infoText}>Tiempo: {item.tiempo}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={niveles}
        keyExtractor={(item) => item.id?.toString() || item.IdNivel.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listcontainer}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {nivelSeleccionado?.puntaje && nivelSeleccionado.puntaje > 0
                ? '¿Deseas volver a jugar este nivel?'
                : '¿Deseas jugar este nivel?'}
            </Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Aceptar" onPress={confirmarYJugar} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 130,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 15,
  },
  listcontainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: ITEM_SIZE_HOME_4_COLUMNS,
    height: 100,
    marginRight: SPACING,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCompletado: {
    backgroundColor: '#a5edb6ff',
    borderWidth: 2,
    borderColor: '#00ff3cff',
  },
  cardDisponible: {
    backgroundColor: '#eeda80ff',
    borderWidth: 2,
    borderColor: '#f0b81cff',
  },
  cardBloqueado: {
    backgroundColor: '#d3d3d3ff',
    borderWidth: 2,
    borderColor: '#6c757d',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
});
export default ListLevels;