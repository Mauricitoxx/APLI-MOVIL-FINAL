import { cargarDatosNivel, insertMoneda, restarVida, restarHerramienta, getHerramienta } from "@/assets/database/query";
import { useUser } from "@/context/UserContext";
import { useNavigation } from "expo-router";
import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

// Interfaz para las propiedades del componente
interface Props {
    IdNivel: number;
    palabraNivel: string | null;
    onGameEnd: (ganado: boolean, puntos?: number, tiempo?: number) => void;
}

const GameWordle: React.FC<Props> = ({ IdNivel, palabraNivel, onGameEnd }) => {
    // --- Variables de estado y constantes del juego ---
    const idNivel = IdNivel;
    // Aseguramos que palabraNivel no sea null antes de obtener la longitud
    const longitud = palabraNivel ? palabraNivel.length : 0;
    const intentoMax = 6;
    const [inicioJuego] = useState(Date.now());
    const { userId } = useUser();
    
    // Estado para la cantidad de herramientas del usuario
    const [cantidadHerraminetas, setCantidadHerramientas] = useState<{ [tipo: string]: number }> ({
        pasa: 0,
        ayuda: 0,
    });
    
    // Estado para bloquear la interacción con las herramientas durante la carga
    const [bloqueado, setBloqueado] = useState(false);

    // Ref para el callback de cierre del modal
    const cerrarModalCallback = React.useRef<() => void | null>(null);
    const navigation = useNavigation();

    // Estado del juego
    const [intentoActual, setIntentoActual] = useState(0);
    const [letrasIngresadas, setLetrasIngresadas] = useState<string[][]>(
        Array.from({length: intentoMax}, () => Array(longitud).fill(''))
    );
    const [letraPos, setLetraPos] = useState(0);
    const [letrasReveladas, setLetrasReveladas] = useState<string[]>([]);
    const [mostrarLetras, setMostrarLetras] = useState(false);

    const [resultadoFinal, setResultadoFinal] = useState<{ganado: boolean, puntos?: number, tiempo?: number} | null>(null);
    const [estadoTeclado, setEstadoTeclado] = useState<Record<string, 'correcta' | 'presente' | 'incorrecta' | undefined>>({});

    // Estado para el modal
    const [mensajeModal, setMensajeModal] = useState('');
    const [visibleModal, setVisibleModal] = useState(false);

    // Reiniciar el juego cada vez que cambie la palabra del nivel
    useEffect(() => {
        setIntentoActual(0);
        setLetrasIngresadas(Array.from({length: intentoMax}, () => Array(longitud).fill('')));
        setLetraPos(0);
        setResultadoFinal(null);
        setEstadoTeclado({});
        setVisibleModal(false);
    }, [palabraNivel, longitud, intentoMax]);

    // Cargar las herramientas del usuario al iniciar el componente
    useEffect(() => {
        const cargarDatos = async () => {
          if (!userId) return;
    
          const herramientas = await getHerramienta(userId);
          const contadores: { [tipo: string]: number } = { pasa: 0, ayuda: 0 };
    
          herramientas.forEach(h => {
            contadores[h.tipo] = h.cantidad;
          });
    
          setCantidadHerramientas(contadores);
        };
    
        cargarDatos();
    }, [userId]);

    // Función para manejar la inserción de una letra
    const handleLetra = (letra: string) => {
        if (intentoActual < intentoMax && letraPos < longitud) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos] = letra;
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos + 1);
        }
    };
    
    // Función para manejar el borrado de una letra
    const handleBorrar = () => {
        if (letraPos > 0) {
            const nuevasLetras = [...letrasIngresadas];
            nuevasLetras[intentoActual][letraPos - 1] = '';
            setLetrasIngresadas(nuevasLetras);
            setLetraPos(letraPos - 1);
        }
    };

    // Función para manejar el intento de palabra
    const handleEnter = async () => {
        if (!palabraNivel) return; // Evita el fallo si la palabra no está definida

        console.log("Enter presionado");
        const intento = letrasIngresadas[intentoActual].join('').toLowerCase();
        
        // Validar si la palabra está completa
        if (intento.length < longitud) {
            mostrarModal('¡Palabra incompleta!');
            return;
        }
        
        // Obtener los colores para cada letra del intento
        const colores: ('verde' | 'amarillo' | 'gris')[] = intento.split('').map((letra, index) => {
            const objetivo = palabraNivel.toLowerCase();
            const letraObjetivo = objetivo[index];

            // Comprobar si la letra es correcta en la posición correcta (verde)
            if (letra === letraObjetivo) return 'verde';

            // Contar cuantas veces aparece la letra en la palabra objetivo
            const totalEnObjetivo = objetivo.split('').filter(l => l === letra).length;
            // Contar cuantas veces ha sido adivinada la letra en posiciones correctas en intentos previos
            const correctasPrevias = intento
                .split('')
                .filter((l, i) => l === letra && objetivo[i] === l && i < index).length;

            // Comprobar si la letra está en la palabra pero en la posición incorrecta (amarillo)
            if (objetivo.includes(letra) && correctasPrevias < totalEnObjetivo) {
                return 'amarillo';
            }

            // La letra no está en la palabra (gris)
            return 'gris';
        });

        // Actualizar el estado del teclado visual
        actualizarTeclado(intento, colores);
        
        // --- Lógica del final del juego ---

        // Condición de victoria
        if (intento === palabraNivel.toLowerCase()) {
            const finJuego = Date.now();
            const tiempoEnSegundos = Math.floor((finJuego - inicioJuego) / 1000);
            const puntos = 100 - intentoActual * 20;

            setTimeout(async () => {
                await mostrarModal(`¡Correcto! Obtuviste ${puntos} puntos en ${tiempoEnSegundos} segundos.`);
                setResultadoFinal({ ganado: true, puntos, tiempo: tiempoEnSegundos });
                await cargarDatosNivel(userId!, idNivel, puntos, tiempoEnSegundos);
                await mostrarModal(`Has obtenido ${puntos} monedas.`);
                await insertMoneda(userId!, puntos);
            }, 100);
            return;
        }

        // Condición de derrota
        if (intentoActual === intentoMax - 1) {
            setTimeout(async () => {
                setResultadoFinal({ ganado: false });
                await mostrarModal(`¡Has perdido!`);
                await cargarDatosNivel(userId!, idNivel, 0, 0);
                await restarVida(userId!).catch(err => console.error('Error al restar vida:', err));
            }, 100);
            return;
        }

        // Siguiente intento
        setIntentoActual(intentoActual + 1);
        setLetraPos(0);
    };

    // Función para mostrar el modal de mensajes
    const mostrarModal = (mensaje: string): Promise<void> => {
        return new Promise((resolve) => {
            setMensajeModal(mensaje);
            setVisibleModal(true);
            cerrarModalCallback.current = resolve;
        });
    };

    // Función para cerrar el modal
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
    
    // Renderiza una fila de la cuadrícula de juego
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

    // Obtiene el estilo de la celda de la cuadrícula
    const getEstiloLetra = (letra: string, index: number, filaIndex: number) => {
        if (!palabraNivel) return styles.cellEmpty;
        
        // Si la fila actual no ha sido intentada, la celda está vacía
        if (filaIndex >= intentoActual) {
            // Se corrige la lógica para que las letras reveladas por herramientas
            // solo se muestren en el área de pistas y no en la cuadrícula
            return styles.cellEmpty;
        }
        
        const intentoFila = letrasIngresadas[filaIndex].join('').toLowerCase();
        const objetivo = palabraNivel.toLowerCase();
        const letraObjetivo = objetivo[index];

        // Letra correcta en la posición correcta
        if (letra === letraObjetivo) return styles.cellCorrect;

        // Contar cuantas veces aparece la letra en la palabra objetivo
        const totalEnObjetivo = objetivo.split('').filter(l => l === letra).length;
        // Contar cuantas veces ha sido adivinada la letra en posiciones correctas
        const correctasPrevias = intentoFila
            .split('')
            .filter((l, i) => l === letra && objetivo[i] === l && i < index).length;

        // Letra correcta pero en la posición incorrecta
        if (objetivo.includes(letra) && correctasPrevias < totalEnObjetivo) {
            return styles.cellMisplaced;
        }

        // Letra incorrecta
        return styles.cellIncorrect;
    };

    // Actualiza el estado visual del teclado
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
    
    // Obtiene el estilo para cada tecla del teclado
    const obtenerColorTecla = (letra: string) => {
        switch (estadoTeclado[letra.toLowerCase()]) {
            case 'correcta': return styles.keyCorrect;
            case 'presente': return styles.keyMisplaced;
            case 'incorrecta': return styles.keyIncorrect;
            default: return styles.key;
        }
    };
    
    const tecladoFilas = [
        'ÁÉÍÓÚ'.split(''),
        'QWERTYUIOP'.split(''),
        'ASDFGHJKLÑ'.split(''),
        ['⌫', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⏎'],
    ];

    // Uso de la herramienta "Revelar Letra"
    const usarAyudaLetra = async () => {
        if (bloqueado || !palabraNivel) return;
        setBloqueado(true);

        if (cantidadHerraminetas["ayuda"] <= 0) {
            mostrarModal(`Insuficiente cantidad de herramienta. Compre en la tienda para tener más.`);
            setBloqueado(false);
            return;
        }

        const letrasNoReveladas = palabraNivel
            .split('')
            .filter((letra) => !letrasReveladas.includes(letra.toLowerCase()));

        if (letrasNoReveladas.length > 0) {
            const letraRevelada = letrasNoReveladas[0].toLowerCase();
            setLetrasReveladas((prev) => [...prev, letraRevelada]);
            mostrarModal(`Letra revelada: ${letraRevelada.toUpperCase()}`);
            
            await restarHerramienta(userId!, "ayuda");

        const herramientasActualizadas = await getHerramienta(userId!);
        const contadores: { [tipo: string]: number } = { pasa: 0, ayuda: 0 };
        herramientasActualizadas.forEach(h => {
          contadores[h.tipo] = h.cantidad;
        });

        setMostrarLetras(true);
        setCantidadHerramientas(contadores);

      } else {
        mostrarModal("No hay más letras por revelar.");
      }

        setBloqueado(false);
    };

    // Uso de la herramienta "Pasar Palabra"
    const usarPasaPalabra = async () => {
        if (bloqueado || !palabraNivel) return;
        setBloqueado(true);

        if (cantidadHerraminetas["pasa"] === 0) {
            mostrarModal(`Insuficiente cantidad de herramienta. Compre en la tienda para tener más.`);
            setBloqueado(false);
            return;
        }

      const letrasTodas = palabraNivel.split('');
      setLetrasReveladas(prev => [...new Set([...prev, ...letrasTodas])]);

      await restarHerramienta(userId!, "pasa");
      
      const herramientasActualizadas = await getHerramienta(userId!);
        const contadores: { [tipo: string]: number } = { pasa: 0, ayuda: 0 };
        herramientasActualizadas.forEach(h => {
            contadores[h.tipo] = h.cantidad;
        });
      
      setMostrarLetras(true);
      setCantidadHerramientas(contadores);
      setBloqueado(false);
    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adivina la palabra</Text>
            <Text style={styles.subtitle}><strong>Considerar que puede haber palabras con tilde en alguna de sus letras</strong></Text>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>              
              {palabraNivel.split('').map((letra, i) => (
                <Text key={i} style={{fontSize: 20, color: letrasReveladas.includes(letra)  || letrasReveladas.length === palabraNivel.length 
                  ? 'orange'
                  : '#ccc',
                  marginHorizontal: 4,
                }}>
                  <strong>{letrasReveladas.includes(letra) || letrasReveladas.length === palabraNivel.length
                            ? letra.toUpperCase()
                            : ''}
                  </strong>
                </Text>
              ))}
            </View>
            
            {/* Cuadrícula de juego */}
            {letrasIngresadas.map(renderFila)}

            {/* Botones de herramientas */}
            <View style={styles.contenedorHerramientas}>
                <TouchableOpacity onPress={usarAyudaLetra} style={styles.botonHerramienta} disabled={bloqueado}>
                    <Text style={styles.textoBoton}>Revelar Letra: {cantidadHerraminetas["ayuda"]} </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={usarPasaPalabra} style={styles.botonHerramienta} disabled={bloqueado}>
                    <Text style={styles.textoBoton}>Pasar Palabra: {cantidadHerraminetas["pasa"]}</Text>
                </TouchableOpacity>
            </View>

            {/* Teclado */}
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
                            disabled={resultadoFinal !== null}
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
    
    pistaContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 10,
      gap: 5
    },
    pistaTextTitle: {
      fontSize: 18,
      color: 'orange',
      fontWeight: 'bold',
    },
    pistaText: {
      fontSize: 18,
      color: 'orange',
      marginHorizontal: 2,
    },
    contenedorHerramientas: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    botonHerramienta: {
        backgroundColor: '#00589fff', // Usando rgba(0, 88, 159, 1)
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        margin: 5,
    },
    textoBoton: {
        color: 'white',
        fontWeight: 'bold',
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
        backgroundColor: '#5bb652', 
        borderColor: '#5bb652' 
    },
    cellMisplaced: { 
        backgroundColor: '#d1ab00', 
        borderColor: '#d1ab00' 
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
    // Estilos para las teclas según su estado
    keyCorrect: { 
        backgroundColor: '#5bb652', 
        borderColor: '#5bb652' 
    },
    keyMisplaced: { 
        backgroundColor: '#d1ab00', 
        borderColor: '#d1ab00' 
    },
    keyIncorrect: { 
        backgroundColor: '#3a3a3c', 
        borderColor: '#3a3a3c',
        opacity: 0.6,
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