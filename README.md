# 🎵 Rythm

<div align="center">
  <img src="./assets/icon.png" alt="Rythm Logo" width="120" height="120">
  
  ### Reproductor de música local para Android e iOS
  
  Una aplicación móvil moderna construida con React Native y Expo que te permite reproducir tu música local con letras sincronizadas.
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.76.6-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-~52.0.30-000020.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
</div>

## ✨ Características

### 🎼 Reproducción de Audio
- **Reproducción en segundo plano**: Continúa escuchando música incluso cuando la app está minimizada.  
- **Controles de reproducción**: Play, pausa, siguiente, anterior, repetir y aleatorio. 
- **Control de volumen**: Ajusta el volumen directamente desde la app.
- **Notificaciones multimedia**: Controla la reproducción desde la pantalla de bloqueo y notificaciones.

### 📝 Letras Sincronizadas
- **Letras en tiempo real**: Visualiza las letras sincronizadas con la música.
- **Búsqueda inteligente**: Sistema de búsqueda con múltiples variantes para encontrar letras precisas. 
- **Modo texto plano**: Opción para ver letras sin sincronización.
- **Pantalla siempre activa**: La pantalla permanece encendida mientras lees las letras.

### 📚 Gestión de Biblioteca
- **Importación de carpetas**: Selecciona una carpeta y carga todas tus canciones automáticamente.
- **Extracción de metadatos**: Lee automáticamente artista, título y carátula de los archivos.
- **Búsqueda rápida**: Encuentra canciones fácilmente con la barra de búsqueda.
- **Favoritos**: Marca tus canciones favoritas para acceso rápido.

### Descargas MP3 en Android

La pestaña **Descubrir música** usa `ytsearch` de YouTube. Android descarga el audio, lo convierte con FFmpeg y guarda el MP3 en la carpeta de la biblioteca con los metadatos y la portada disponibles. Rythm añade el archivo nuevo a la biblioteca sin releer el resto de la carpeta. La descarga y la conversión se ejecutan en el teléfono.

El prototipo web de `lyrics-cloud-downloads` usaba `ytmusicapi` para buscar y un servidor en Render para obtener el audio. En Android, los intentos incluyeron actualizar yt-dlp en ejecución, restaurar el extractor del AAR para mantener FFmpeg, probar varios clientes de YouTube y arrancar BGUtils en el teléfono. El APK anterior volvía a instalar yt-dlp `2025.11.12`. Con ese extractor, encontrar un video en la búsqueda no garantizaba que hubiera un formato descargable.

Gradle fija la versión de yt-dlp y verifica el SHA-256 de su publicación oficial. El APK incluye sus componentes EJS y usa el QuickJS de `youtubedl-android`. La app prueba la selección de formatos de yt-dlp primero y arranca BGUtils localmente cuando el error indica que puede ayudar. Deno se usa para ese proveedor.

Con un teléfono conectado por USB, ejecuta `npm run android` para recompilar e instalar el build de desarrollo. Para probarlo, elige una pista cuya descarga esté autorizada, confirma que aparece en la biblioteca y reprodúcela sin conexión. Si falla, `adb logcat -d -s RythmDownloader` muestra la etapa y el error del motor nativo.

### 🎨 Playlists Personalizadas
- **Crear playlists**: Organiza tu música en listas de reproducción personalizadas.
- **Agregar canciones**: Añade múltiples canciones a tus playlists.
- **Gestión completa**: Elimina canciones o playlists completas cuando quieras.

### 🎨 Interfaz Moderna
- **Tema oscuro**: Diseño elegante optimizado para uso nocturno.
- **Colores dinámicos**: La interfaz se adapta a los colores de la carátula del álbum.
- **Animaciones fluidas**: Transiciones suaves entre pantallas.
- **Splash screen animado**: Pantalla de inicio con animación Lottie.

## 🛠️ Tecnologías

### Core
- **React Native** (0.76.6) - Framework principal.
- **Expo** (~52.0.30) - Plataforma de desarrollo.
- **TypeScript** (5.3.3) - Tipado estático.

### Reproducción de Audio
- **react-native-track-player** (4.1.1) - Motor de reproducción con soporte para segundo plano.
- **expo-notifications** (~0.29.14) - Notificaciones y controles multimedia.

### Gestión de Estado
- **Zustand** (5.0.3) - State management ligero y eficiente.
- **react-native-mmkv-storage** (0.11.2) - Persistencia de datos ultra-rápida.

### UI/UX
- **react-native-lyric** (1.0.2) - Componente para letras sincronizadas.
- **expo-linear-gradient** (~14.0.2) - Gradientes para fondos dinámicos.
- **react-native-image-colors** (2.4.0) - Extracción de colores de imágenes.
- **lottie-react-native** (7.3.4) - Animaciones vectoriales.

### Sistema de Archivos
- **@react-native-documents/picker** (10.1.2) - Selector de carpetas y archivos.
- **@missingcore/audio-metadata** (1.3.0) - Extracción de metadatos de audio.
- **react-native-fs** (2.20.0) - Acceso al sistema de archivos.

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI
- Android Studio (para desarrollo Android) o Xcode (para desarrollo iOS)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/RenatoGV/RG-Music.git
cd RG-Music
