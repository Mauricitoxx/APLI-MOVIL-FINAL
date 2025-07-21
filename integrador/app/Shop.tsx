import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Shop() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header monedas y vidas */}
      <View style={styles.header}>
        <View style={styles.infoBox}>
          <Feather name="dollar-sign" size={18} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}> 500</Text>
        </View>
        <View style={styles.infoBox}>
          <Feather name="heart" size={18} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}> 2</Text>
        </View>
      </View>

      {/* Título */}
      <Text style={styles.title}>Tienda</Text>

      {/* Botones de compra */}
      <TouchableOpacity style={styles.shopButton}>
        <Text style={styles.shopButtonText}>Vida Extra $150</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shopButton}>
        <Text style={styles.shopButtonText}>Salto de Nivel $400</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shopButton}>
        <Text style={styles.shopButtonText}>Ayuda de Palabra $95</Text>
      </TouchableOpacity>

      {/* Footer navegación */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Home')}>
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
    padding: 16,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginVertical: 18,
  },
  shopButton: {
    backgroundColor: '#7a4ef2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 10,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7a4ef2',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerButton: {
    alignItems: 'center',
  },
});