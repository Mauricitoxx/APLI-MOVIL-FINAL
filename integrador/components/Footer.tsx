import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Footer = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('Home')}>
        <Feather name="home" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Shop')}
      >
        <Feather name="shopping-cart" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Levels')} 
      >
        <Feather name="play" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigation.navigate('Home')} 
      >
        <Feather name="user" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 15,
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

export default Footer;