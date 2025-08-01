import { otorgarVida } from '@/assets/database/query';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Función que calcula el tiempo restante
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0 && minutes === 0) {
        otorgarVida();
      }

      const formatted = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;

      setTimeLeft(formatted);
    };
    
    const interval = setInterval(calculateTimeLeft, 60 * 1000);
    calculateTimeLeft();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Próxima vida en: {timeLeft}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});
