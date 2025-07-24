import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Button } from 'react-native';
import { NivelXUsuario } from '@/assets/database/type';

interface Props {
  niveles: NivelXUsuario[];
  setNiveles: (niveles: NivelXUsuario[]) => void;
  navigation: any;
}

const ListLevels: React.FC<Props> = ({ niveles, setNiveles, navigation }) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelXUsuario | null>(null);

  const handleSeleccionarNivel = (nivel: NivelXUsuario) => {
    const disponible = true;
    if (disponible) {
      setNivelSeleccionado(nivel);
      setModalVisible(true);
    }
  };

  const confirmarYJugar = () => {
    if (!nivelSeleccionado) return;

    setModalVisible(false);
    navigation.navigate('Game', {
    nivel: nivelSeleccionado,
      onResultado: (nivelActualizado: NivelXUsuario | null) => {
        if (nivelActualizado) {
          const nuevosNiveles = niveles.map(n =>
            n.IdNivel === nivelActualizado.IdNivel
              ? nivelActualizado
              : n
          );
          setNiveles(nuevosNiveles);
        }
      },
    });
  }


  const renderItem = ({ item, index }) => {
    const nivelAnterior = index > 0 ? niveles[index - 1] : null;

    const completado = item.puntaje > 0;
    const disponible = index === 0 || (nivelAnterior && nivelAnterior.puntaje > 0);
    const bloqueado = !completado && !disponible;

    const getCardStyle = () => {
      if (completado) return styles.cardCompletado;
      if (bloqueado) return styles.cardBloqueado;
      return styles.cardDisponible;
    };

    return (
      <TouchableOpacity
        key={item.IdNivel}
        style={[styles.card, getCardStyle()]}
        disabled={bloqueado}
        onPress={() => disponible && handleSeleccionarNivel(item)}
      >
        <Text style={styles.title}>Nivel {index + 1}</Text>
        <Text>Puntaje: {item.puntaje}</Text>
        <Text>Tiempo: {item.tiempo}</Text>
        {completado && <Text style={{ color: 'green' }}></Text>}
        {bloqueado && <Text style={{ color: 'gray' }}></Text>}
        {!completado && !bloqueado && (
          <Text style={{ color: 'blue' }}></Text>
        )}
      </TouchableOpacity>
    );
  };

    const nivelesOrdenados = [...niveles].sort((a, b) => a.IdNivel - b.IdNivel);
  return (
    <>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={nivelesOrdenados}
        keyExtractor={(item) => item.IdNivel.toString()}
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
    </>
  );
};


const styles = StyleSheet.create({
  listcontainer: {
    paddingHorizontal: 10,
  },
  card: {
    width: 110,
    height: 100,
    textAlign:'left',
    marginRight: 12,
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