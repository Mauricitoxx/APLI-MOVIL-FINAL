import { cargarDatosNivel, insertMoneda, restarVida } from "@/assets/database/query";
import { useUser } from "@/context/UserContext";
import { useNavigation } from "expo-router";
import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GUTTER = 4; // Espacio entre celdas
const KEY_GUTTER = 4; // Espacio entre teclas

interface Props {
    IdNivel: number;
    palabraNivel: string | null;
    onGameEnd: (ganado: boolean, puntos?: number, tiempo?: number) => void;
}

const GameWordle: React.FC<Props> = ({ IdNivel, palabraNivel, onGameEnd }) => {
    if (!palabraNivel) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>No se pudo cargar la palabra del nivel.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
                    <Text style={styles.errorButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    const longitud = palabraNivel.length;
    const intentoMax = 6;
    const [inicioJuego] = useState(Date.now());
    const { userId } = useUser();
    const cerrarModalCallback = React.useRef<() => void | null>(null);
    const navigation = useNavigation();

    const [intentoActual, setIntentoActual] = useState(0);
    const [letrasIngresadas, setLetrasIngresadas] = useState<string[][]>(
        Array.from({length: intentoMax}, () => Array(longitud).fill(''))
    );
    const [letraPos, setLetraPos] = useState(0);
    const [resultadoFinal, setResultadoFinal] = useState<{ganado: boolean, puntos?: number, tiempo?: number} | null>(null);
    const [estadoTeclado, setEstadoTeclado] = useState<Record<string, 'correcta' | 'presente' | 'incorrecta' | undefined>>({});

    const [mensajeModal, setMensajeModal] = useState('');
    const [visibleModal, setVisibleModal] = useState(false);

    useEffect(() => {
        setIntentoActual(0);
        setLetrasIngresadas(Array.from({length: intentoMax}, () => Array(longitud).fill('')));
        setLetraPos(0);
        setResultadoFinal(null);
        setEstadoTeclado({});
        setVisibleModal(false);
    }, [palabraNivel, longitud, intentoMax]);

    const handleEnter = () => {
        console.log("Enter presionado");
        const intento = letrasIngresadas[intentoActual].join('').toLowerCase();
        if (intento.length < longitud) {
            mostrarModal('¡Palabra incompleta!');
            return;
        }
        
        const colores: ('verde' | 'amarillo' | 'gris')[] = intento.split('').map((letra, index) => {
            const objetivo = palabraNivel.toLowerCase();
            const letraObjetivo = objetivo[index];
            if (letra === letraObjetivo) return 'verde';

            const totalEnObjetivo = objetivo.split('').filter(l => l === letra).length;
            const correctasPrevias = intento
                .split('')
                .filter((l, i) => l === letra && objetivo[i] === l && i < index).length;

            if (objetivo.includes(letra) && correctasPrevias < totalEnObjetivo) {
                return 'amarillo';
            }

            return 'gris';
        });

        actualizarTeclado(intento, colores);
        
        if (intento === palabraNivel.toLowerCase()) {
            const finJuego = Date.now();
            const tiempoEnSegundos = Math.floor((finJuego - inicioJuego) / 1000);
            const puntos = 100 - intentoActual * 20;

            setTimeout(async () => {
                await mostrarModal(`¡Correcto! Obtuviste ${puntos} puntos en ${tiempoEnSegundos} segundos.`);
                setResultadoFinal({ ganado: true, puntos, tiempo: tiempoEnSegundos });
                await cargarDatosNivel(userId!, idNivel, puntos, tiempoEnSegundos);
                await mostrarModal(`Haz obtenido ${puntos} monedas.`);
                await insertMoneda(userId!, puntos);
            }, 100);
            return;
        }

        if (intentoActual === intentoMax - 1) {
            setTimeout(async () => {
                setResultadoFinal({ ganado: false });
                await mostrarModal(`¡Has perdido! La palabra era: ${palabraNivel.toUpperCase()}`);
                await cargarDatosNivel(userId!, idNivel, 0, 0);
                await restarVida(userId!).catch(err => console.error('Error al restar vida:', err));
            }, 100);
            return;
        }

        setIntentoActual(intentoActual + 1);
        setLetraPos(0);
    }

    const handleLetra = (letra: string) => {
        console.log("Letra presionada:", letra);
        if (letraPos < longitud && intentoActual < intentoMax) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos] = letra;
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos + 1);
        }
    }

    const handleBorrar = () => {
        console.log("Borrar presionado");
        if (letraPos > 0) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos - 1] = '';
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos - 1);
        }
    }

    const mostrarModal = (mensaje: string): Promise<void> => {
      return new Promise((resolve) => {
        setMensajeModal(mensaje);
        setVisibleModal(true);
        cerrarModalCallback.current = resolve;
      });
    };

    const cerrarModal = () => {
        setVisibleModal(false);
        if (cerrarModalCallback.current) {
          cerrarModalCallback.current();
          cerrarModalCallback.current = null;
        }
        if (resultadoFinal) {
          onGameEnd(resultadoFinal.ganado, resultadoFinal.puntos, resultadoFinal.tiempo);
          navigation.goBack();
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

        const totalEnObjetivo = objetivo.split('').filter(l => l === letra).length;
        const correctasPrevias = intentoFila
            .split('')
            .filter((l, i) => l === letra && objetivo[i] === l && i < index).length;

        if (objetivo.includes(letra) && correctasPrevias < totalEnObjetivo) {
            return styles.cellMisplaced;
        }

        return styles.cellIncorrect;
    };

    const actualizarTeclado = (intento: string, colores: ('verde' | 'amarillo' | 'gris')[]) => {
      setEstadoTeclado(prev => {
        const nuevoEstado = { ...prev };
        intento.split('').forEach((letra, index) => {
          const color = colores[index];
          if (color === 'verde') {
            nuevoEstado[letra] = 'correcta';
          } else if (color === 'amarillo' && nuevoEstado[letra] !== 'correcta') {
            nuevoEstado[letra] = 'presente';
          } else if (color === 'gris' && !nuevoEstado[letra]) {
            nuevoEstado[letra] = 'incorrecta';
          }
        });
        return nuevoEstado;
      });
    };
    
    const obtenerColorTecla = (letra: string) => {
      switch (estadoTeclado[letra.toLowerCase()]) {
        case 'correcta': return styles.cellCorrect;
        case 'presente': return styles.cellMisplaced;
        case 'incorrecta': return styles.cellIncorrect;
        default: return styles.key;
      }
    };
    
    const tecladoFilas = [
        'QWERTYUIOP'.split(''),
        'ASDFGHJKLÑ'.split(''),
        ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⏎'],
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adivina la palabra</Text>
            <Text style={styles.subtitle}>Tienes {intentoMax - intentoActual} intentos</Text>
            
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
                            style={[styles.key, obtenerColorTecla(letra), isSpecial && styles.specialKey]}
                            onPress={onPress}
                        >
                            <Text style={styles.keyText}>{letra}</Text>
                        </TouchableOpacity>
                        );
                    })}
                    </View>
                ))}
            </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121213',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#7a4ef2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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

export default GameWordle;