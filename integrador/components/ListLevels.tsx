import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Button } from 'react-native';
import { NivelXUsuario } from '@/assets/database/type';
import { insertNivelXUsuario } from '@/assets/database/query';
import { useUser } from '@/context/UserContext';
import { setupIndexedDB } from '@/assets/database/db';

interface Props {
  niveles: NivelXUsuario[];
  setNiveles: (niveles: NivelXUsuario[]) => void;
  navigation: any;
}

const ListLevels: React.FC<Props> = ({ niveles, setNiveles, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelXUsuario | null>(null);
  const { userId } = useUser();

  const nivelesUsuario = niveles.filter(n => n.IdUsuario === userId);
  const nivelesOrdenados = [...nivelesUsuario].sort((a, b) => a.IdNivel - b.IdNivel);

  useEffect(() => {
    const init = async () => {
      await setupIndexedDB();
      const nivelesGuardados = localStorage.getItem('nivelesUsuario');
      if (nivelesGuardados) {
        setNiveles(JSON.parse(nivelesGuardados));
      }
    };
    init();
  }, [setNiveles]);

  useEffect(() => {
    const nivelesGuardados = localStorage.getItem('nivelesUsuario');
    if (nivelesGuardados) {
      setNiveles(JSON.parse(nivelesGuardados));
    }
  }, [setNiveles]);

  const handleSeleccionarNivel = (nivel: NivelXUsuario) => {
    const disponible = true;
    if (disponible) {
      setNivelSeleccionado(nivel);
      setModalVisible(true);
    }
  };

  const confirmarYJugar = async () => {
    if (!nivelSeleccionado) return;

    setModalVisible(false);

    navigation.navigate('Game', {
      nivel: nivelSeleccionado,
      onResultado: async (nivelActualizado: NivelXUsuario | null) => {
        if (!nivelActualizado) return;

        const nuevosNiveles = niveles.map(n =>
          n.IdNivel === nivelActualizado.IdNivel ? nivelActualizado : n
        );

        const siguienteId = nivelActualizado.IdNivel + 1;
        const yaExisteSiguiente = niveles.some(n =>
          n.IdNivel === siguienteId && n.IdUsuario === nivelActualizado.IdUsuario
        );

        if (!yaExisteSiguiente) {
          const nuevoNivel = await insertNivelXUsuario(nivelActualizado.IdUsuario);
          nuevosNiveles.push(nuevoNivel);
        }

        nuevosNiveles.sort((a, b) => a.IdNivel - b.IdNivel);
        setNiveles(nuevosNiveles);
      }
    });
  };

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
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
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
    width: 110,
    height: 100,
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
