# 📱 Prologix GPS Tracking - Frontend

Frontend móvil multiplataforma para el sistema de rastreo GPS Prologix, construido con React Native y Expo.

## 🚀 Características

- ✅ **Autenticación** - Login/Register con JWT
- ✅ **Rastreo en tiempo real** - Visualización de dispositivos GPS en mapa
- ✅ **Historial de rutas** - Consulta de trayectorias anteriores
- ✅ **Notificaciones** - WhatsApp, Email, Push
- ✅ **Suscripciones** - Planes FREE, BÁSICO, PROFESIONAL, EMPRESARIAL
- ✅ **Multiplataforma** - iOS, Android, Web

## 🛠️ Tecnologías

- **Framework:** React Native + Expo Router
- **Navegación:** Expo Router (file-based routing)
- **Mapas:** React Native Maps + Leaflet (web)
- **Estado:** React Context API
- **HTTP:** Axios
- **Autenticación:** JWT + Expo Secure Store
- **Deployment:** Vercel (web) + EAS (mobile)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Iniciar en web
npm run web

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios
```

## 🌐 Variables de Entorno

Crea un archivo `.env.development` o `.env.production`:

```env
EXPO_PUBLIC_API_URL=https://prologix-tracking-gps-production.up.railway.app
```

## 📱 Estructura del Proyecto

```
frontend/
├── app/                    # Rutas de la aplicación (Expo Router)
│   ├── (auth)/            # Pantallas de autenticación
│   │   └── login.tsx
│   ├── (tabs)/            # Navegación por pestañas
│   │   ├── map.tsx        # Mapa principal
│   │   └── devices/       # Gestión de dispositivos
│   ├── _layout.tsx        # Layout raíz
│   └── index.tsx          # Pantalla inicial
├── components/            # Componentes reutilizables
│   └── WebMap.tsx         # Componente de mapa para web
├── context/               # Context API para estado global
│   ├── ctx.tsx            # Contexto de autenticación
│   └── useStorageState.ts # Hook para almacenamiento seguro
├── services/              # Servicios y APIs
│   └── api.ts             # Cliente HTTP
├── constants/             # Constantes y configuración
│   └── Colors.ts
└── assets/                # Imágenes, iconos, fuentes

## 🚀 Deployment

### Web (Vercel)

```bash
# Build para producción
npm run build

# El proyecto está configurado para deployment automático en Vercel
```

### Mobile (EAS)

```bash
# Configurar EAS
npx eas login
npx eas build:configure

# Build para Android
npx eas build --platform android

# Build para iOS
npx eas build --platform ios
```

## 🔗 Backend

Este frontend se conecta al backend desplegado en Railway:

**API URL:** https://prologix-tracking-gps-production.up.railway.app

**Repositorio Backend:** [Prologix-tracking-GPS](https://github.com/franlys/Prologix-tracking-GPS)

## 📊 Endpoints Utilizados

### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `GET /auth/me` - Obtener usuario actual

### Dispositivos GPS
- `GET /devices` - Listar dispositivos del usuario
- `GET /devices/:id` - Obtener dispositivo específico
- `GET /devices/:id/live` - Datos en tiempo real
- `GET /devices/:id/history` - Historial de ubicaciones

### Suscripciones
- `GET /subscriptions/plans` - Obtener planes disponibles
- `GET /subscriptions/me` - Mi suscripción actual
- `POST /subscriptions/checkout/create` - Crear sesión de pago

## 🎨 Próximas Mejoras

- [ ] Rediseño UI/UX moderno
- [ ] Dashboard con estadísticas visuales
- [ ] Onboarding interactivo
- [ ] Notificaciones push
- [ ] Dark mode mejorado
- [ ] Animaciones y transiciones
- [ ] Geofences visualization
- [ ] Reportes y exportación de datos

## 📝 Licencia

Copyright © 2025 Prologix GPS Tracking

---

**🚀 Desplegado en:** [Vercel](https://vercel.com)

**📱 Backend:** [Railway](https://prologix-tracking-gps-production.up.railway.app)
