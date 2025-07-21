import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ToolSelector from '@/components/ToolSelector';
import Countdown from '@/components/CountDown';

export default function LevelScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currency}>
          <Text style={styles.currencyText}>💰 500</Text>
        </View>
        <View style={styles.currency}>
          <Text style={styles.currencyText}>❤️ 2</Text>
        </View>
      </View>

      {/* Niveles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Niveles</Text>
        <View style={styles.levelsRow}>
          <TouchableOpacity style={styles.levelComplete}><Text style={styles.levelText}>Nivel Completo</Text></TouchableOpacity>
          <TouchableOpacity style={styles.levelStart}><Text style={styles.levelText}>Nivel Para Jugar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.levelIncomplete}><Text style={styles.levelText}>Nivel No Disponible</Text></TouchableOpacity>
        </View>
      </View>

      {/* Puntaje y tiempo */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Mejor puntaje</Text>
          <Text style={styles.scoreValue}>Puntaje</Text>
          <Text style={styles.scoreLabel}>Mejor tiempo</Text>
          <Text style={styles.scoreValue}>Tiempo</Text>
        </View>
      </View>

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
        <TouchableOpacity style={styles.footerButton}><Feather name="home" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}><Feather name="shopping-cart" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}><Feather name="play" size={24} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}><Feather name="user" size={24} color="#fff" /></TouchableOpacity>
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
  levelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  levelComplete: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 4,
  },
  levelStart: {
    backgroundColor: '#f1c40f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 4,
  },
  levelIncomplete: {
    backgroundColor: '#888',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  levelText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginRight: 6,
    marginTop: 5,
    marginBottom: 5,
  },
  scoreLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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