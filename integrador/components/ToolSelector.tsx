import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ToolSelector() {
  const [selected, setSelected] = useState<'pasa' | 'ayuda'>('pasa');

  const options = {
    pasa: {
      description: 'Ideal para cuando el nivel ya no te representa',
      quantity: 5,/* Dato a cambiar segun tenga el usuario */
    },
    ayuda: {
      description: 'Te da una pista sobre que letra puede estar en tu palabra',
      quantity: 3,/* Dato a cambiar segun tenga el usuario */
    },
  };

  return (
    <View style={styles.jumpRow}>
      <View style={styles.jumpBox}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[
              styles.jumpButton,
              selected === 'pasa' && styles.jumpButtonSelected,
            ]}
            onPress={() => setSelected('pasa')}
          >
            <Text
              style={[
                styles.jumpLabel,
                selected === 'pasa' && styles.jumpLabelSelected,
              ]}
            >
              Pasa Palabra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.jumpButton,
              selected === 'ayuda' && styles.jumpButtonSelected,
            ]}
            onPress={() => setSelected('ayuda')}
          >
            <Text
              style={[
                styles.jumpLabel,
                selected === 'ayuda' && styles.jumpLabelSelected,
              ]}
            >
              Ayuda Palabra
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionBox}>
            <Text style={styles.jumpText}>
            {options[selected].description}
            </Text>
        </View>
      </View>

      <View style={styles.counterBox}>
        <Text style={styles.counterLabel}>Tienes:</Text>
        <Text style={styles.counterNumber}>{options[selected].quantity}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  jumpRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  jumpBox: {
    flex: 1,
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 8,
    marginRight: 6,
  },
  descriptionBox: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginRight: 6,
    borderColor: 'grey',
    borderWidth: 1,
    marginTop: -5,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  jumpButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  jumpButtonSelected: {
    backgroundColor: '#2ecc71',
  },
  jumpLabel: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  jumpLabelSelected: {
    color: '#000',
  },
  jumpText: {
    color: '#ccc',
    fontSize: 14,
  },
  counterBox: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterLabel: {
    color: '#fff',
  },
  counterNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
