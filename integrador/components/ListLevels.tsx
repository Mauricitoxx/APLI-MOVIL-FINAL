import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Button, Dimensions } from 'react-native';
import { NivelXUsuario } from '@/assets/database/type'; // Ensure correct path
import { useUser } from '@/context/UserContext';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation here
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import for better type safety
import { RootStackParamList } from '../Game'; // Ensure correct path to RootStackParamList

const { width } = Dimensions.get('window');
const SPACING = 10;
const ITEM_SIZE_HOME_4_COLUMNS = (width - SPACING * 5) / 4;


interface Props {
  niveles: any[];
  navigation: NativeStackNavigationProp<RootStackParamList>; // Use specific type
  onGameResult: (nivelActualizado: NivelXUsuario | null) => void; // <--- ADDED PROP
}

const ListLevels: React.FC<Props> = ({ niveles, navigation, onGameResult }) => { // <--- Receive the prop
  const [modalVisible, setModalVisible] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<any | null>(null);
  const { userId } = useUser();


  const handleSeleccionarNivel = (nivel: any) => {
    if (nivel.disponible) {
      setNivelSeleccionado(nivel);
      setModalVisible(true);
    } else {
      console.log(`ListLevels: Nivel ${nivel.level} no está disponible (bloqueado).`);
    }
  };

  const confirmarYJugar = async () => {
    if (!nivelSeleccionado) return;

    setModalVisible(false);

    // Navigate to Game and pass the onGameResult callback from Home.tsx
    navigation.navigate('Game', {
      nivel: nivelSeleccionado, // Pass the complete level object
      onResultado: onGameResult, // <--- PASS THE CALLBACK HERE
    });
  };

  const renderItem = ({ item, index }) => {
    const completado = item.completado;
    const disponible = item.disponible;
    const bloqueado = item.bloqueado;

    const getCardStyle = () => {
      if (completado) return styles.cardCompletado;
      if (disponible) return styles.cardDisponible;
      if (bloqueado) return styles.cardBloqueado;
      return styles.cardDefault;
    };

    return (
      <TouchableOpacity
        key={item.idForFlatList} // Use item.idForFlatList as key (String(IdNivel) from Home)
        style={[styles.card, getCardStyle()]}
        disabled={bloqueado}
        onPress={() => handleSeleccionarNivel(item)}
      >
        <Text style={styles.title}>Nivel {item.level}</Text>
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
        keyExtractor={(item) => item.idForFlatList.toString()} // Use item.idForFlatList
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
  cardDefault: {
    backgroundColor: '#AAAAAA',
    borderWidth: 2,
    borderColor: '#777777',
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