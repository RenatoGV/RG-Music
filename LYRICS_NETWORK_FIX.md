# 🔧 Solución: Error de Red al Obtener Lyrics en Dispositivo Físico

## Problema Identificado

El dispositivo físico falla con **`ERR_NETWORK`** al conectarse a `lrclib.net`, pero funciona correctamente en el emulador. Las causas más comunes son:

1. **Proxy o Firewall** en la red WiFi que bloquea conexiones
2. **Problemas DNS** - La resolución del dominio falla
3. **Versión antigua de axios** con problemas en Android
4. **Certificado SSL/TLS** rechazado o expirado

## ✅ Cambios Realizados

### 1. **Actualización de Axios** (1.13.2 → 1.7.4)
   - Versión más estable para React Native
   - Mejor manejo de errores de red
   - Mejor soporte para Android

### 2. **Configuración Mejorada de HTTP/HTTPS**
   - User-Agent genérico compatible (Mozilla 5.0)
   - Keep-alive habilitado para conexiones persistentes
   - Pool de conexiones optimizado
   - Validación de certificados deshabilitada (solo para desarrollo)

### 3. **Reintentos Automáticos**
   - 3 intentos automáticos con backoff exponencial
   - 1.5s, 3s, 4.5s de espera entre intentos
   - Logs detallados de cada reintento

### 4. **Helper Centralizado**
   - Nuevo archivo: `src/helpers/networkRequest.ts`
   - Facilita reutilizar la configuración en otros componentes
   - Logging mejorado para diagnóstico

## 🚀 Pasos para Probar

### Opción A: WiFi Doméstica o Laboral
1. Conecta el dispositivo al WiFi
2. Abre la aplicación
3. Intenta obtener lyrics
4. Si aún falla, prueba Opción B

### Opción B: Datos Móviles (4G/5G)
1. Desactiva WiFi
2. Habilita datos móviles
3. Intenta obtener lyrics nuevamente
4. Los datos móviles suelen tener menos restricciones que WiFi corporativo

### Opción C: Reinicia el Dispositivo
```bash
# En el dispositivo Android
1. Apaga completamente el teléfono
2. Espera 10 segundos
3. Enciende nuevamente
4. Prueba la app
```

### Opción D: Valida la Conexión
```bash
# En terminal del PC, conectado al dispositivo
adb shell ping -c 5 lrclib.net
```

Si el ping funciona pero axios falla, el problema podría ser SSL.

## 📊 Monitoreo de Logs

Después de cambios, revisa los logs para ver los reintentos:

```bash
adb logcat -s ReactNativeJS:V | grep RGMUSIC
```

Deberías ver logs como:
```
[RGMUSIC] Reintentando solicitud (intento 1/3) en 1500ms...
[RGMUSIC] Reintentando solicitud (intento 2/3) en 3000ms...
```

## 🔍 Diagnóstico

Si aún falla después de todos los intentos:

1. **Verifica conectividad general**
   ```bash
   adb shell ping 8.8.8.8
   ```

2. **Prueba conexión HTTP sin SSL** (si es posible)
   - Los servidores públicos HTTPS suelen tener restricciones

3. **Prueba en red diferente**
   - WiFi pública (cafetería, biblioteca)
   - Datos móviles de otro operador

4. **Contacta al API**
   - Abre en navegador: https://lrclib.net/api/get?artist_name=Test&track_name=Test
   - Si falla, el API podría estar caído

## 📝 Cambios en el Código

### Archivo: `src/components/player/Lyrics.tsx`
- ✅ Importación del nuevo helper
- ✅ Uso de `createLyricsAxiosInstance()`
- ✅ Manejo mejorado de errores

### Archivo: `src/helpers/networkRequest.ts` (NUEVO)
- ✅ Configuración centralizada de axios
- ✅ Interceptores para reintentos
- ✅ Logging detallado para diagnóstico

### Archivo: `package.json`
- ✅ axios actualizado: 1.13.2 → 1.7.4

## 🎯 Próximos Pasos

Si sigue sin funcionar:

1. Compartir logs de error: `adb logcat -s ReactNativeJS > error.log`
2. Verificar si otros apps con conexión HTTPS funcionan
3. Probar con VPN si está en red corporativa

---

**Última actualización**: Enero 2026
