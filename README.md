# 📱 Frontend - NFC Transport App

[![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-49+-purple.svg)](https://expo.dev/)
[![Jest](https://img.shields.io/badge/Jest-29.7+-yellow.svg)](https://jestjs.io/)
[![Tests](https://img.shields.io/badge/tests-100%25%20passed-brightgreen)](https://github.com/your-org/nfc-transport-app)

> **Aplicación móvil React Native con Expo para el sistema de transporte público con tarjetas NFC**

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Características](#-características)
- [⚙️ Instalación](#️-instalación)
- [🔧 Configuración](#-configuración)
- [📱 Pantallas](#-pantallas)
- [🎨 UI/UX](#-uiux)
- [🧪 Testing](#-testing)
- [🔒 Seguridad](#-seguridad)
- [📦 Build & Deployment](#-build--deployment)

## 🎯 Descripción

El frontend de NFC Transport App es una aplicación móvil construida con React Native y Expo que proporciona una interfaz intuitiva y moderna para la gestión de tarjetas NFC, recargas, historial de transacciones y autenticación del sistema de transporte público.

### 🎯 Objetivos
- **Interfaz moderna** con diseño Material Design 3
- **Autenticación dual** (credenciales y tarjeta NFC)
- **Gestión completa** de tarjetas y transacciones
- **Experiencia de usuario** optimizada y accesible
- **Testing robusto** con cobertura completa

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Screens   │  │  Components │  │   Services  │        │
│  │             │  │             │  │             │        │
│  │ • Dashboard │  │ • Centered  │  │ • apiService│        │
│  │ • Login     │  │   Loader    │  │ • Auth      │        │
│  │ • Cards     │  │ • Custom    │  │ • Storage   │        │
│  │ • Recharge  │  │ • FAB       │  │             │        │
│  │ • History   │  │ • Chips     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │               │               │               │
│           └───────────────┼───────────────┘               │
│                           │                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Context   │  │   Hooks     │  │   Theme     │        │
│  │             │  │             │  │             │        │
│  │ • Auth      │  │ • useAuth   │  │ • Colors    │        │
│  │ • Navigation│  │ • useFonts  │  │ • Typography│        │
│  │ • State     │  │ • useStorage│  │ • Chicalo   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   └── CenteredLoader.js # Loader centrado
│   ├── context/             # Context API
│   │   └── AuthContext.js   # Contexto de autenticación
│   ├── hooks/               # Custom hooks
│   │   ├── useAuthState.js  # Estado de autenticación
│   │   └── useFonts.js      # Carga de fuentes
│   ├── screens/             # Pantallas principales
│   │   ├── DashboardScreen.js
│   │   ├── LoginScreen.js
│   │   ├── CardsScreen.js
│   │   ├── RechargeScreen.js
│   │   ├── HistoryScreen.js
│   │   └── RegisterCardScreen.js
│   ├── services/            # Servicios de API
│   │   └── apiService.js    # Cliente HTTP
│   └── theme.js             # Sistema de diseño
├── __tests__/              # Tests automatizados
├── assets/                 # Recursos estáticos
│   └── fonts/             # Fuentes personalizadas
├── App.js                  # Componente raíz
└── package.json            # Dependencias
```

## 🚀 Características

### 🔐 Autenticación y Autorización
- ✅ **Login dual** con credenciales o tarjeta NFC
- ✅ **JWT Tokens** con refresh automático
- ✅ **Persistencia** de sesión con AsyncStorage
- ✅ **Logout seguro** con limpieza de tokens
- ✅ **Modo tarjeta única** para acceso rápido

### 💳 Gestión de Tarjetas
- ✅ **Múltiples tarjetas** por usuario
- ✅ **Selección dinámica** de tarjeta activa
- ✅ **Registro de nuevas** tarjetas
- ✅ **Alias personalizados** para identificación
- ✅ **Estado activo/inactivo** con gestión

### 💰 Sistema de Recarga
- ✅ **Montos rápidos** en grid 2x2
- ✅ **Monto personalizado** con validación
- ✅ **Múltiples métodos** de pago
- ✅ **Confirmación** con resumen detallado
- ✅ **Actualización automática** de saldo

### 📊 Historial y Transacciones
- ✅ **Historial completo** con filtros
- ✅ **Búsqueda** por ubicación y fecha
- ✅ **Estadísticas** de viajes y gastos
- ✅ **Exportación** de datos
- ✅ **Estados visuales** de transacciones

### 🎨 UI/UX Moderna
- ✅ **Material Design 3** con componentes Paper
- ✅ **Fuente Chicalo** para elementos decorativos
- ✅ **Fuente Montserrat** para texto legible
- ✅ **Tema personalizado** con colores púrpura
- ✅ **Animaciones suaves** y transiciones
- ✅ **Responsive design** para diferentes pantallas

## ⚙️ Instalación

### 📋 Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (para desarrollo Android)
- **Xcode** (para desarrollo iOS, solo macOS)

### 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/your-org/nfc-transport-app.git
cd nfc-transport-app/Frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 4. Iniciar en desarrollo
npm start

# 5. Verificar instalación
npm test
```

### 🔧 Configuración Detallada

Consulta la [Guía de Configuración](CONFIGURATION.md) para configuraciones avanzadas.

## 🔧 Configuración

### 📝 Variables de Entorno

```bash
# API Backend
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_API_TIMEOUT=10000

# Configuración de la app
EXPO_PUBLIC_APP_NAME=NFC Transport
EXPO_PUBLIC_APP_VERSION=1.0.0

# Configuración de desarrollo
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=info
```

### 🎨 Configuración de Tema

```javascript
// src/theme.js
export const colors = {
  primary: '#7C3AED',        // Púrpura principal
  primaryLight: '#8B5CF6',   // Púrpura claro
  primaryDark: '#6D28D9',    // Púrpura oscuro
  accent: '#FACC15',         // Amarillo acento
  // ... más colores
};

export const chicaloStyles = {
  subtitle: { fontFamily: 'Chicalo-Regular', fontSize: 16 },
  info: { fontFamily: 'Chicalo-Regular', fontSize: 14 },
  description: { fontFamily: 'Chicalo-Regular', fontSize: 12 },
};
```

## 📱 Pantallas

### 🏠 Dashboard
- **Resumen de saldo** con tarjeta visual
- **Métricas rápidas** (tarifa, viajes disponibles)
- **Acciones rápidas** (recargar, historial, tarjetas)
- **Transacciones recientes** con detalles
- **Gestión multi-tarjeta** (si aplica)

### 🔐 Login
- **Modo dual** (credenciales o tarjeta NFC)
- **Validación en tiempo real** de campos
- **Indicadores de carga** y estados
- **Mensajes de error** claros
- **Persistencia** de modo de autenticación

### 💳 Gestión de Tarjetas
- **Tarjeta activa** con información detallada
- **Lista de tarjetas** con estados
- **Registro de nuevas** tarjetas
- **Selección dinámica** de tarjeta
- **Eliminación segura** con confirmación

### 💰 Recarga
- **Montos rápidos** en grid 2x2
- **Monto personalizado** con validación
- **Métodos de pago** múltiples
- **Resumen de transacción** antes de confirmar
- **Confirmación** con detalles completos

### 📊 Historial
- **Lista de transacciones** con filtros
- **Búsqueda** por ubicación y fecha
- **Estadísticas** de uso
- **Estados visuales** (éxito, error, pendiente)
- **Exportación** de datos

## 🎨 UI/UX

### 🎨 Sistema de Diseño
- **Material Design 3** como base
- **Tema personalizado** con colores púrpura
- **Tipografía dual**: Montserrat (legible) + Chicalo (decorativa)
- **Componentes Paper** para consistencia
- **Espaciado sistemático** con escala definida

### 🎯 Principios de UX
- **Jerarquía visual** clara con fuentes apropiadas
- **Feedback inmediato** en todas las acciones
- **Estados de carga** informativos
- **Mensajes de error** útiles
- **Navegación intuitiva** con drawer y tabs

### 📱 Responsive Design
- **Adaptación** a diferentes tamaños de pantalla
- **Orientación** portrait y landscape
- **Accesibilidad** con tamaños de toque apropiados
- **Contraste** adecuado para legibilidad

## 🧪 Testing

### ✅ Cobertura Completa
- **Tests unitarios** para componentes
- **Tests de integración** para pantallas
- **Tests de contexto** para AuthContext
- **Tests de servicios** para API calls
- **Mocks robustos** para dependencias

### 🧪 Framework de Testing
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Dashboard"
```

### 📊 Métricas de Testing
- **Cobertura**: 100% de líneas críticas
- **Tests**: 25+ casos de prueba
- **Tiempo**: < 30 segundos para suite completa
- **Fiabilidad**: 0% de falsos positivos

## 🔒 Seguridad

### 🔐 Autenticación
- **JWT Tokens** con expiración configurable
- **Refresh tokens** para renovación automática
- **Almacenamiento seguro** con AsyncStorage
- **Limpieza automática** en logout

### 🛡️ Protección de Datos
- **Validación** de entrada en todos los campos
- **Sanitización** de datos antes de envío
- **Manejo seguro** de errores sin exponer información
- **Logs seguros** sin datos sensibles

### 🔒 Comunicación Segura
- **HTTPS** obligatorio para todas las comunicaciones
- **Timeout** configurable para requests
- **Retry logic** para fallos de red
- **Validación** de respuestas del servidor

## 📦 Build & Deployment

### 🏗️ Build para Producción

```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build universal
eas build --platform all
```

### 📱 Configuración EAS

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 🚀 Deployment

```bash
# Subir a Expo
eas submit --platform android

# Publicar en stores
eas submit --platform all
```

## 📚 Documentación Adicional

- [Guía de Desarrollo](DEVELOPMENT.md)
- [Guía de Testing](TESTING.md)
- [Guía de UI/UX](UI_UX_GUIDE.md)
- [Guía de Deployment](DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Jose Luis Larrazabal** - *Desarrollo inicial* - [@jlarrazabal](https://github.com/jlarrazabal)

## 🙏 Agradecimientos

- **Expo** por el framework de desarrollo
- **React Native Paper** por los componentes Material Design
- **React Navigation** por el sistema de navegación
- **Jest** por el framework de testing
