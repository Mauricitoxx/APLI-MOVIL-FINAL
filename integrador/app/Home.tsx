import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ToolSelector from '@/components/ToolSelector';
import Countdown from '@/components/CountDown';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';
import { getNivelesXUsuario, getUsuarioPorId, getVidas } from '@/assets/database/query';
import ListLevels from '@/components/ListLevels';
import { NivelXUsuario } from '@/assets/database/type';
import { useFocusEffect } from 'expo-router';


export default function Home() {
  const navigation = useNavigation();
  const { userId } = useUser();

  const [monedas, setMonedas] = useState<number | undefined>(undefined);
  const [vidas, setVidas] = useState<number | undefined>(undefined);
  const [listaNiveles, setListaNiveles] = useState<NivelXUsuario[]>([]);

  const [selected, setSelected] = useState<'verde' | 'amarilla' | 'gris'>('verde');
  const options = {
    verde: {
      description: 'VERDE significa que la letra esta en la palabra y en la posicion CORRECTA'
    },
    amarilla: {
      description: 'AMARILLO significa que la letra esta presente en la palabra, pero en la posicion INCORRECTA'
    },
    gris: {
      description: 'GRIS significa que la letra NO esta presente en la palabra'
    }
  }

  useFocusEffect(
    useCallback(() => {
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
    }, [userId])
  );

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

  useFocusEffect(
    useCallback(() => {
      const fetchNiveles = async () => {
        try {
          const niveles = await getNivelesXUsuario(userId!);
          setListaNiveles(niveles);
        } catch (err) {
          console.error('Error obteniendo niveles:', err);
        }
      };

      fetchNiveles();
    }, [userId])
  );

  function capitalize(color: string) {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }

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
      <Text style={styles.sectionTitle}>Niveles</Text>
      <ListLevels
        niveles={listaNiveles}
        setNiveles={setListaNiveles}
        navigation={navigation}
      />

      {/* Próxima vida */}
      <View style={styles.nextLifeBox}>
        <Text style={styles.nextLifeText}><Countdown /></Text>
      </View>

      {/* Herramientas */}
      <ToolSelector />

      {/* Como Jugar */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>¿Cómo Jugar?</Text>
        <Text style={styles.rulesSubtitle}>El objetivo del juego es adivinar la palabra oculta. La palabra puede tener desde 3 a 6 letras y se tiene 6 intentos para adivinarla. Las palabras pueden no repertirse en el mismo numero de nivel entre usuarios.</Text>
        <Text style={styles.rulesSubtitle}>Cada intento debe ser una palabra válida. En cada ronda el juego pinta cada letra de un color indicando si esa letra se encuentra o no en la palabra y si se encuentra en la posición correcta.</Text>

        <View style={styles.rulesButtons}>
          {['verde', 'amarilla', 'gris'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.ruleButton,
                selected === color && styles.ruleButtonSelected,
              ]}
              onPress={() => setSelected(color)}
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