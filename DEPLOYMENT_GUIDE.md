# 🚀 Guía de Publicación: Prologix GPS
Esta guía detalla el proceso para compilar y subir tu aplicación a **Google Play Store** (Android) y **App Store** (iOS) utilizando **Expo Application Services (EAS)**.

## 📋 1. Requisitos Previos

### Cuentas de Desarrollador
Antes de empezar, necesitas inscribirte en los programas de desarrolladores: (Tienen costo anual/único)
- **Google Play Console** ($25 USD pago único): [Registrarse aquí](https://play.google.com/console/signup)
- **Apple Developer Program** ($99 USD/año): [Registrarse aquí](https://developer.apple.com/programs/enroll/)

### Herramientas
Asegúrate de tener instalada la CLI de EAS:
```bash
npm install -g eas-cli
eas login
```

---

## 🛠️ 2. Configuración del Proyecto

### `app.json` (Identidad)
Ya está configurado, pero verifica antes de cada subida:
- **Android Package**: `com.prologix.gps`
- **iOS Bundle ID**: `com.prologix.gps`
- **Version**: `1.0.0` (Incrementar con cada actualización)
- **BuildNumber/VersionCode**: `1` (Incrementar SIEMPRE con cada actualización)

### Iconos
Asegúrate de que tus iconos finales estén en:
- `./assets/icon.png` (1024x1024)
- `./assets/adaptive-icon.png` (1024x1024)

---

## 🤖 3. Publicación en Google Play (Android)

### Paso A: Generar Credenciales
La primera vez, necesitas generar una Keystore. EAS lo hace por ti.
```bash
eas build:configure
```

### Paso B: Compilar el Bundle (.aab)
Para subir a la Play Store, necesitamos un **AAB (Android App Bundle)**.
El perfil `production` en `eas.json` ya está configurado para esto.

Ejecuta:
```bash
eas build --platform android --profile production
```
- Esto subirá tu código a los servidores de Expo.
- Espera a que termine la compilación.
- **Resultado**: Un enlace de descarga para un archivo `.aab`.

### Paso C: Subir a Google Play Console
1. Ve a [Google Play Console](https://play.google.com/console).
2. Crea una nueva App ("Prologix GPS").
3. Ve a **Pruebas (Testing) -> Pruebas internas (Internal testing)** (Recomendado para empezar).
4. Crea un nuevo lanzamiento.
5. Sube el archivo `.aab` que generó EAS.
6. Completa la ficha de la tienda (Imágenes, descripción, política de privacidad).
7. Envía a revisión.

---

## 🍎 4. Publicación en App Store (iOS)

> **Nota**: Necesitas una Mac o usar EAS (que usa Macs en la nube).

### Paso A: Compilar el Archivo (.ipa)
Ejecuta:
```bash
eas build --platform ios --profile production
```
- Te pedirá iniciar sesión con tu Apple ID si no lo has hecho.
- Generará los certificados y perfiles de provisión automáticamente.
- **Resultado**: Un enlace de descarga para un archivo `.ipa` o subida automática si usas `eas submit`.

### Paso B: Subir a App Store Connect (TestFlight)
La forma más fácil es usar **EAS Submit** después del build:

```bash
eas submit -p ios --latest
```
Esto enviará el `.ipa` directamente a **App Store Connect**.

1. Ve a [App Store Connect](https://appstoreconnect.apple.com/).
2. Ve a "Mis Apps" -> "Prologix GPS".
3. Ve a la pestaña **TestFlight**.
4. Deberías ver tu build procesándose.
5. Una vez procesado, agrega "Testers" internos (tú mismo) para recibir un email e instalar la app via TestFlight.

---

## 🔄 5. Actualizaciones (OTA) vs Build Nativo

### Actualizaciones Over-The-Air (EAS Update)
Si solo cambias código JS/React (colores, lógica, pantallas), puedes enviar una actualización sin pasar por la tienda:
```bash
eas update --branch production --message "Corrigiendo bug de login"
```
*Los usuarios verán el cambio la próxima vez que abran la app.*

### Build Nativo Requerido
Si instalas una librería nativa nueva (ej. `npm install react-native-camera`) o cambias `app.json` (iconos, nombres), **DEBES** generar un nuevo build (`eas build`) y subirlo a las tiendas.

---

## ✅ Resumen del Flujo de Trabajo

1. **Desarrolla & Prueba**: `npx expo start`
2. **Incrementa Versión**: En `app.json` (`version: 1.0.1`, `versionCode: 2`).
3. **Compila**: `eas build --platform all --profile production`
4. **Sube**:
   - iOS: `eas submit -p ios` -> TestFlight.
   - Android: Descargar `.aab` -> Subir a Play Console.
