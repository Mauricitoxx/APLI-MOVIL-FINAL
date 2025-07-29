import React, {useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface Props {
    palabraNivel: string;
    onGameEnd: (ganado:boolean, puntos?: number, tiempo?: number) => void;
}

const GameWordle: React.FC<Props> = ({ palabraNivel, onGameEnd }) => {
    const longitud = palabraNivel.length;
    const intentoMax = 5;
    const [inicioJuego] = useState(Date.now());

    const [intentoActual, setIntentoActual] = useState(0);
    const [letrasIngresadas, setLetrasIngresadas] = useState<string[][]>(
        Array.from({length: intentoMax}, () => Array(longitud).fill(''))
    );
    const [letraPos, setLetraPos] = useState(0);
    const [resultadoFinal, setResultadoFinal] = useState<{ganado: boolean, puntos?: number, tiempo?: number} | null>(null);


    const [mensajeModal, setMensajeModal] = useState('');
    const [visibleModal, setVisibleModal] = useState(false);

    const handleEnter = () => {
        const intento = letrasIngresadas[intentoActual].join('').toLowerCase();
        if (intento.length < longitud) {
            mostrarModal('¡Palabra incompleta!');
            return;
        }

        if (intento === palabraNivel.toLowerCase()) {
            const finJuego = Date.now();
            const tiempoEnSegundos = Math.floor((finJuego - inicioJuego) / 1000);
            const puntos = 100 - intentoActual * 20; // o cualquier lógica que quieras

            // Llamás a onGameEnd pasando si ganó y la info adicional
            setTimeout(() => {
                mostrarModal(`¡Correcto! 
                    Obtuviste ${puntos} puntos en ${tiempoEnSegundos} segundos.`);
                // Guardar temporalmente estos valores para usarlos en cerrarModal
                setResultadoFinal({ ganado: true, puntos, tiempo: tiempoEnSegundos });
            }, 100);
            return;
        }

        if (intentoActual === intentoMax - 1) {
            setTimeout(() => {
                mostrarModal(`¡Has perdido!`);
                setResultadoFinal({ ganado: false });
            }, 100);
            return;
        }

        setIntentoActual(intentoActual + 1);
        setLetraPos(0);
    }

    const handleLetra = (letra: string) => {
        if (letraPos < longitud && intentoActual < intentoMax) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos] = letra;
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos + 1);
        }
    }

    const handleBorrar = () => {
        if (letraPos > 0) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos - 1] = '';
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos - 1);
        }
    }

    const mostrarModal = (mensaje: string) => {
        setMensajeModal(mensaje);
        setVisibleModal(true);
    };

    const cerrarModal = () => {
        setVisibleModal(false);
        if (resultadoFinal) {
            onGameEnd(resultadoFinal.ganado, resultadoFinal.puntos, resultadoFinal.tiempo);
            setResultadoFinal(null); 
        }
    };

    const renderFila = (fila: string[], filaIndex: number) => {
        return (
            <View key={filaIndex} style={styles.row}>
                {fila.map((letra, index) => {
                const estilo = getEstiloLetra(letra, index, filaIndex);
                return (
                    <View key={index} style={[styles.cell, estilo]}>
                    <Text style={styles.cellText}>{letra.toUpperCase()}</Text>
                    </View>
                );
                })}
            </View>
        );
    };

    const getEstiloLetra = (letra: string, index: number, filaIndex: number) => {
        if (filaIndex >= intentoActual) return styles.cellEmpty;

        const intentoFila = letrasIngresadas[filaIndex].join('').toLowerCase();
        const objetivo = palabraNivel.toLowerCase();
        const letraObjetivo = objetivo[index];

        if (letra === letraObjetivo) return styles.cellCorrect;

        // Cuenta la cantidad de veces que aparece la letra en la palabra objetivo
        const totalEnObjetivo = objetivo.split('').filter(l => l === letra).length;
        // Cuenta la cantidad de veces que ya han sido validadas como correctas antes de este índice
        const correctasPrevias = intentoFila
            .split('')
            .filter((l, i) => l === letra && objetivo[i] === l && i < index).length;

        if (objetivo.includes(letra) && correctasPrevias < totalEnObjetivo) {
            return styles.cellMisplaced;
        }

        return styles.cellIncorrect;
    };

  const tecladoFilas = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKLÑ'.split(''),
    ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⏎'],
  ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adivina la palabra</Text>
            <Text style={styles.subtitle}>Tienes {5-intentoActual} intentos</Text>
            
            {letrasIngresadas.map(renderFila)}

            <View style={styles.keyboard}>
                {tecladoFilas.map((fila, filaIndex) => (
                    <View key={filaIndex} style={styles.keyboardRow}>
                    {fila.map((letra) => {
                        const isSpecial = letra === '⌫' || letra === '⏎';
                        const onPress = letra === '⌫'
                        ? handleBorrar
                        : letra === '⏎'
                        ? handleEnter
                        : () => handleLetra(letra.toLowerCase());

                        return (
                        <TouchableOpacity
                            key={letra}
                            style={[styles.key, isSpecial && styles.specialKey]}
                            onPress={onPress}
                        >
                            <Text style={styles.keyText}>{letra}</Text>
                        </TouchableOpacity>
                        );
                    })}
                    </View>
                ))}
            </View>


            {/* Modal de Resultado */}
            <Modal transparent animationType="fade" visible={visibleModal} onRequestClose={cerrarModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{mensajeModal}</Text>
                        <TouchableOpacity onPress={cerrarModal} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default GameWordle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  title: {
    color: '#7a4ef2',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 20,
  },
  cell: {
    width: 55,
    height: 55,
    borderWidth: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  cellText: { 
    fontWeight: 'bold', 
    fontSize: 24,
    color: '#fff',
  },
  cellEmpty: { 
    backgroundColor: '#3a3a3c', 
    borderColor: '#999',
  },
  cellCorrect: { 
    backgroundColor: '#5bb652ff', 
    borderColor: '#5bb652ff' 
  },
  cellMisplaced: { 
    backgroundColor: '#d1ab00ff', 
    borderColor: '#d1ab00ff' 
  },
  cellIncorrect: { 
    backgroundColor: '#3a3a3c', 
    borderColor: '#3a3a3c',
    opacity: 0.6,
  },
  keyboard: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  key: {
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 6,
    minWidth: 36,
    aspectRatio:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialKey: {
    backgroundColor: '#565758',
    minWidth: 60,
  },
  keyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e1e1f',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#7a4ef2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

});
