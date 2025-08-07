# Grupo 12
+ Raggi, Sofia
+ Lista, Mauro
+ Garzaniti, Valentín
+ López, Martina

## Temática del Proyecto: Aplicacion de Juego basada en Wordle
Este proyecto consiste en el desarrollo de una aplicación interactiva de juego por niveles, 
inspirada en el popular juego Wordle. Cada nivel presenta un desafío en el que el jugador debe adivinar una palabra oculta, 
manteniendo el estilo clásico de Wordle, pero incorporando mecánicas adicionales para enriquecer la experiencia de juego.

Los elementos distintivos de esta version incluyen:
+ <b>Dos tipos de herramientas</b> que el jugador puede utilizar estratégicamente para facilitar la resolución del nivel.
+ Un sistema de recompensas basado en el <b>rendimiento del jugador</b>, evaluando tanto la cantidad de intentos utilizados como el tiempo que tomó para completar el nivel.
+ Recompensas otorgadas en forma de monedas, que el jugador podrá usar para comprar herramientas o <b>vidas adicionales</b> para continuar jugando.

## Detalles tecnicos
+ La aplicacion esta estructurada por niveles.
+ Cada nivel representa un nuevo desafio tipo Wordle.
+ Existen dos tipos de recursos consumibles: herramientas de ayuda y vidas.
+ Las monedas se obtienen según el desempeño del usuario y son utilizadas para adquirir recursos.
+ Se registra y considera el tiempo empleado para resolver el nivel.

## Importante: Versiones Web y Movil
El proyecto ha sido desarrollado en dos <b>versiones distinas</b>, una destinada a la ejecución en entorno web y otra para dispositivos móviles. 
Esta decisión responde a diferencias en la gestión de la base de datos según el entorno:

+ <b>Version Web</b>: Utiliza `IndexedDB` para almacenamiento local en navegadores.
+ <b>Version Movil</b>: Utiliza `SQLite` para almacenamiento persistente en dispositivos móviles.

Cada versión se encuentra mantenida en una rama especifica del repositorio:

+ `app/version_web`: version optimizada para navegadores.
+ `app/version_movil`: version adaptada para ejecución movil.

## Usuario Base
  Con el equipo tomamos la decisión de generar un usuario base para disfrutar la experiencia sin necesidad de crear un usuario por su cuenta, sin embargo si desean hacer un usuario, pueden hacerlo.

  + #### Datos
    + Username = Usuario1
    + Contraseña = Usuario1

## Estas son las librerías externas a React-Native 
+ @expo/vector-icons 
+ @react-native-async-storage/async-storage
+ @react-native-community/checkbox
+ @react-native-picker/picker
+ @react-navigation/bottom-tabs
+ @react-navigation/elements
+ @react-navigation/native
+ @react-navigation/native-stack
+ react-native-confetti-cannon
+ react-native-get-random-values
+ react-native-uuid
+ uuid
+ Expo 

## Instrucciones para instalar y correr la app

+ #### Clonar el repositorio 
  `git clone https://github.com/Mauricitoxx/APLIMOVIL-TP3.git`
+ ### Instalar las dependencias del Proyecto
  ` npm install `
+ ### Iniciar el proyecto
  ` npm run web ` , ` npm expo start ` , ` npm start `
+ ### Ingresar a la web o a Expo-Go
  + En caso de iniciar en la web ingresar a ` localhost:8081 `
  + En caso de iniciar con Expo-Go, abrir la app, y escanear el QR que te dispone la terminal de VS.  
