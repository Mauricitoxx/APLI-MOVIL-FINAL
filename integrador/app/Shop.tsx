import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import {
  getUsuarioPorId,
  getVidas,
  comprarVida,
  comprarHerramienta,
} from '@/assets/database/query';

export default function Shop() {
  const navigation = useNavigation();
  const { userId } = useUser();

  const [monedas, setMonedas] = useState<number>(0);
  const [vidas, setVidas] = useState<number>(0);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'error' | 'exito'} | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<{tipo: 'vida' | 'pasa' | 'ayuda', costo: number, nombre: string} | null>(null);

  const animMonedas = useRef(new Animated.Value(1)).current;
  const animVidas = useRef(new Animated.Value(1)).current;

  const animarCambio = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const fetchDatos = async () => {
      const user = await getUsuarioPorId(userId!);
      const vidasUser = await getVidas(userId!);
      setMonedas(user?.monedas ?? 0);
      setVidas(vidasUser?.[0]?.cantidad ?? 0);
    };
    fetchDatos();
  }, [userId]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const abrirModalConfirmacion = (tipo: 'vida' | 'pasa' | 'ayuda', costo: number, nombre: string) => {
    setItemSeleccionado({tipo, costo, nombre});
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setItemSeleccionado(null);
  };

  const confirmarCompra = async () => {
    if (!userId || !itemSeleccionado) {
      setMensaje({texto: 'No se pudo identificar al usuario.', tipo: 'error'});
      cerrarModal();
      return;
    }

    try {
      let resultado;
      if (itemSeleccionado.tipo === 'vida') {
        resultado = await comprarVida(userId, itemSeleccionado.costo);
      } else {
        resultado = await comprarHerramienta(userId, itemSeleccionado.tipo, itemSeleccionado.costo);
      }

      if (!resultado.ok) {
        setMensaje({texto: resultado.error ?? 'No tenés monedas suficientes.', tipo: 'error'});
        cerrarModal();
        return;
      }

      const user = await getUsuarioPorId(userId);
      const vidasUser = await getVidas(userId);

      if (user?.monedas !== monedas) {
        animarCambio(animMonedas);
      }
      if ((vidasUser?.[0]?.cantidad ?? 0) !== vidas) {
        animarCambio(animVidas);
      }

      setMonedas(user?.monedas ?? 0);
      setVidas(vidasUser?.[0]?.cantidad ?? 0);

      setMensaje({texto: 'Compra realizada correctamente.', tipo: 'exito'});
      cerrarModal();
    } catch (error) {
      setMensaje({texto: 'Ocurrió un problema al procesar la compra.', tipo: 'error'});
      console.error(error);
      cerrarModal();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.currency, { transform: [{ scale: animMonedas }] }]}>
          <Text style={styles.currencyText}>💰 {monedas}</Text>
        </Animated.View>
        <Animated.View style={[styles.currency, { transform: [{ scale: animVidas }] }]}>
          <Text style={styles.currencyText}>❤️ {vidas}</Text>
        </Animated.View>
      </View>

      {/* Mensaje flotante */}
      {mensaje && (
        <View style={[
          styles.mensajeContainer,
          mensaje.tipo === 'error' ? styles.mensajeError : styles.mensajeExito
        ]}>
          <Text style={styles.mensajeTexto}>{mensaje.texto}</Text>
        </View>
      )}

      {/* Título */}
      <Text style={styles.title}>Tienda</Text>

      {/* Opciones de compra */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemBox}
        onPress={() => abrirModalConfirmacion('vida', 150, 'Vida Extra')}
      >
        <Text style={styles.itemText}>Vida Extra - $150</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemBox}
        onPress={() => abrirModalConfirmacion('pasa', 400, 'Salto de Nivel')}
      >
        <Text style={styles.itemText}>Salto de Nivel - $400</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.itemBox}
        onPress={() => abrirModalConfirmacion('ayuda', 95, 'Ayuda de Palabra')}
      >
        <Text style={styles.itemText}>Ayuda de Palabra - $95</Text>
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar compra</Text>
            <Text style={styles.modalText}>
              ¿Deseas comprar {itemSeleccionado?.nombre} por ${itemSeleccionado?.costo}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cerrarModal}
              >
                <Text style={styles.modalButtonText}>Volver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmarCompra}
              >
                <Text style={styles.modalButtonText}>Sí, Comprar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="shopping-cart" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="play" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="user" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  mensajeContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mensajeError: {
    backgroundColor: '#ff4444',
  },
  mensajeExito: {
    backgroundColor: '#00C851',
  },
  mensajeTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 18,
  },
  itemBox: {
    backgroundColor: '#7a4ef2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 10,
    alignItems: 'center',
  },
  itemText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    backgroundColor: '#7a4ef2',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 15,
  },
  footerButton: {
    alignItems: 'center',
  },
  // Estilos para el modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#ff4444',
  },
  modalButtonConfirm: {
    backgroundColor: '#00C851',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});