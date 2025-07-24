import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ToolSelector from '@/components/ToolSelector';
import Countdown from '@/components/CountDown';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import { getNivelesXUsuario, getUsuarioPorId, getVidas } from '@/assets/database/query';
import ListLevels from '@/components/ListLevels';
import { NivelXUsuario } from '@/assets/database/type';


export default function Home() {
  const navigation = useNavigation();
  const { userId } = useUser();

  const [monedas, setMonedas] = useState<number | undefined>(undefined);
  const [vidas, setVidas] = useState<number | undefined>(undefined);
  const [listaNiveles, setListaNiveles] = useState<NivelXUsuario[]>([]);


  useEffect(() => {
    const fetchVida = async () => {
      const vidas = await getVidas(userId!);

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
      try {
        const datosUsuario = await getUsuarioPorId(userId!);
        setMonedas(datosUsuario?.monedas ?? 0);
      } catch (err) {
        console.error('Error obteniendo usuario:', err);
        setMonedas(0);
      }
    };
    fetchUsuario();
  }, [userId]);

  useEffect(() => {
    const fetchNiveles = async () => {
      try {
        const niveles = await getNivelesXUsuario(userId!);
        setListaNiveles(niveles);
      } catch (err) {
        console.error('Error obteniendo usuario:', err);
      }
    };
    fetchNiveles();
  }, [userId]);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currency}>
          <Text style={styles.currencyText}>💰 {monedas ?? 'Cargando...'}</Text>
        </View>
        <View style={styles.currency}>
          <Text style={styles.currencyText}>❤️ {vidas ?? 'Cargando...'}</Text>
        </View>
      </View>

      {/* Niveles */}
      <ListLevels
        niveles={listaNiveles}
        setNiveles={setListaNiveles}
        navigation={navigation}
      />

      {/* Próxima vida */}
      <View style={styles.nextLifeBox}>
        <Text style={styles.nextLifeText}><Countdown /></Text>
      </View>

      {/* Saltos de nivel */}
      <ToolSelector />

      {/* Botón jugar */}
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playText}>Jugar</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Shop')}
        >
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
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 6,
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
  jumpRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  jumpBox: {
    flex: 1,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  jumpLabel: {
    backgroundColor: '#2ecc71',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    borderRadius: 6,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jumpText: {
    color: '#ccc',
    fontSize: 12,
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
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});