import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Footer from '@/components/Footer'; 

const { width } = Dimensions.get('window');
const SPACING = 10;
const ITEM_SIZE = (width - SPACING * 8) / 6;

// Datos hardcodeados para simular los niveles
const levels = Array.from({ length: 30 }, (_, i) => {
  const levelNumber = i + 1;
  let status = 'locked';
  if (levelNumber < 14) {
    status = 'completed';
  } else if (levelNumber === 14) {
    status = 'current';
  }
  return {
    id: String(levelNumber),
    level: levelNumber,
    status,
  };
});

const getBackgroundColor = (status) => {
  switch (status) {
    case 'completed':
      return '#2E7D32';
    case 'current':
      return '#FFA000';
    case 'locked':
      return '#333333';
    default:
      return '#333333';
  }
};

const getTextColor = (status) => {
  return status === 'locked' ? '#888888' : '#FFFFFF';
};

const LevelItem = ({ item }) => {
  const backgroundColor = getBackgroundColor(item.status);
  const textColor = getTextColor(item.status);
  const isLocked = item.status === 'locked';

  return (
    <View style={[styles.levelItem, { backgroundColor }]}>
      <Text style={[styles.levelText, { color: textColor }]}>
        {isLocked ? '' : item.level}
      </Text>
    </View>
  );
};

const LevelsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Niveles</Text>
      <View style={styles.gridContainer}>
        <FlatList
          data={levels}
          renderItem={LevelItem}
          keyExtractor={(item) => item.id}
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
    width: ITEM_SIZE,
    height: ITEM_SIZE,
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