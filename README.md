# 📱 Frontend - NFC Transport App

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.16-blue.svg)](https://expo.dev/)
[![Jest](https://img.shields.io/badge/Jest-29.7+-yellow.svg)](https://jestjs.io/)
[![Tests](https://img.shields.io/badge/tests-29%20passed-brightgreen)](https://github.com/your-org/nfc-transport-app)

> **Aplicación móvil React Native para la gestión digital de tarjetas de transporte público con tecnología NFC**

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Características](#-características)
- [⚙️ Instalación](#️-instalación)
- [🔧 Configuración](#-configuración)
- [📱 Pantallas](#-pantallas)
- [🧪 Testing](#-testing)
- [📦 Build y Deployment](#-build-y-deployment)
- [🎨 UI/UX](#-uiux)
- [🔒 Seguridad](#-seguridad)

## 🎯 Descripción

El frontend de NFC Transport App es una aplicación móvil desarrollada con React Native y Expo que proporciona una interfaz intuitiva y moderna para la gestión de tarjetas NFC de transporte público.

### 🎯 Objetivos
- **Interfaz moderna** con diseño Material Design
- **Navegación fluida** entre pantallas
- **Gestión completa** de tarjetas y transacciones
- **Experiencia de usuario** optimizada
- **Performance** y accesibilidad

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Screens   │  │ Components  │  │   Services  │        │
│  │             │  │             │  │             │        │
│  │ • Dashboard │  │ • Loader    │  │ • API       │        │
│  │ • Login     │  │ • Cards     │  │ • Auth      │        │
│  │ • Cards     │  │ • Forms     │  │ • Storage   │        │
│  │ • Recharge  │  │ • Navigation│  │ • Validation│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │               │               │               │
│           └───────────────┼───────────────┘               │
│                           │                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Context   │  │   Hooks     │  │   Utils     │        │
│  │             │  │             │  │             │        │
│  │ • Auth      │  │ • useAuth   │  │ • Validation│        │
│  │ • Navigation│  │ • useCards  │  │ • Formatting│        │
│  │ • State     │  │ • useAPI    │  │ • Constants │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Estructura del Proyecto

```
Frontend/
├── src/                    # Código fuente principal
│   ├── components/        # Componentes reutilizables
│   │   └── CenteredLoader.js
│   ├── context/          # Context API
│   │   └── AuthContext.js
│   ├── hooks/            # Custom hooks
│   │   └── useAuthState.js
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── DashboardScreen.js
│   │   ├── LoginScreen.js
│   │   ├── CardsScreen.js
│   │   ├── RechargeScreen.js
│   │   ├── HistoryScreen.js
│   │   └── RegisterCardScreen.js
│   ├── services/         # Servicios y APIs
│   │   └── apiService.js
│   └── theme.js          # Configuración de tema
├── assets/               # Recursos estáticos
│   ├── images/          # Imágenes
│   └── fonts/           # Fuentes personalizadas
├── __tests__/           # Tests automatizados
│   ├── components/      # Tests de componentes
│   ├── context/         # Tests de contexto
│   ├── hooks/           # Tests de hooks
│   ├── integration/     # Tests de integración
│   ├── screens/         # Tests de pantallas
│   └── services/        # Tests de servicios
├── __mocks__/           # Mocks para testing
├── App.js               # Componente raíz
├── app.json             # Configuración de Expo
└── package.json         # Dependencias
```

## 🚀 Características

### 🎨 Interfaz de Usuario
- ✅ **Material Design** con React Native Paper
- ✅ **Navegación intuitiva** con React Navigation
- ✅ **Tema personalizado** con colores corporativos
- ✅ **Responsive design** para diferentes pantallas
- ✅ **Animaciones fluidas** y transiciones

### 🔐 Autenticación
- ✅ **Login dual** (credenciales o tarjeta NFC)
- ✅ **Registro de usuarios** con validación
- ✅ **Gestión de sesiones** con JWT
- ✅ **Logout seguro** con limpieza de datos
- ✅ **Persistencia** de estado de autenticación

### 💳 Gestión de Tarjetas
- ✅ **Registro de tarjetas** NFC por UID
- ✅ **Múltiples tarjetas** por usuario
- ✅ **Alias personalizados** para identificación
- ✅ **Selección de tarjeta activa**
- ✅ **Eliminación segura** de tarjetas

### 💰 Sistema de Recarga
- ✅ **Múltiples métodos** de pago
- ✅ **Validación en tiempo real** de montos
- ✅ **Confirmación visual** de transacciones
- ✅ **Historial de recargas** detallado

### 📊 Historial y Reportes
- ✅ **Historial completo** de transacciones
- ✅ **Filtros por fecha** y tipo
- ✅ **Detalles de ubicación** y montos
- ✅ **Estadísticas** de uso

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

### 📱 Ejecutar en Dispositivo

```bash
# Instalar Expo Go en tu dispositivo móvil
# Escanear el código QR que aparece en la terminal

# O ejecutar en emulador
npm run android  # Android
npm run ios      # iOS (solo macOS)
```

## 🔧 Configuración

### 📝 Variables de Entorno

```bash
# API Configuration
API_BASE_URL=http://localhost:3000/api

# App Configuration
APP_NAME=NFC Transport App
APP_VERSION=1.0.0

# Development
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
```

### 🎨 Configuración de Tema

```javascript
// src/theme.js
export const theme = {
  colors: {
    primary: '#6B46C1',      // Morado corporativo
    secondary: '#F6E05E',    // Amarillo corporativo
    background: '#F7FAFC',
    surface: '#FFFFFF',
    text: '#2D3748',
    error: '#E53E3E',
    success: '#38A169',
    warning: '#D69E2E',
  },
  fonts: {
    regular: 'Chicalo-Regular',
    medium: 'Chicalo-Medium',
    bold: 'Chicalo-Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
```

## 📱 Pantallas

### 🏠 Dashboard Principal
- **Saludo personalizado** con nombre del usuario
- **Saldo actual** de la tarjeta activa
- **Acciones rápidas** (Recargar, Historial, Tarjetas)
- **Información de viajes** y tarifas
- **Vista previa** de la tarjeta activa

### 🔐 Pantalla de Login
- **Login con credenciales** (usuario/contraseña)
- **Login con tarjeta NFC** (modo alternativo)
- **Registro de nuevos usuarios**
- **Recuperación de contraseña**
- **Validación en tiempo real**

### 💳 Gestión de Tarjetas
- **Lista de tarjetas** registradas
- **Selección de tarjeta activa**
- **Registro de nuevas tarjetas**
- **Edición de alias**
- **Eliminación de tarjetas**

### 💰 Sistema de Recarga
- **Selección de método** de pago
- **Ingreso de monto** con validación
- **Confirmación** de transacción
- **Comprobante** de recarga
- **Historial** de recargas

### 📊 Historial de Transacciones
- **Lista cronológica** de transacciones
- **Filtros por fecha** y tipo
- **Detalles completos** de cada transacción
- **Búsqueda** y ordenamiento
- **Exportación** de datos

## 🧪 Testing

### 🚀 Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests específicos
npm test -- --testNamePattern="Dashboard"
```

### 📊 Cobertura de Tests

- ✅ **29 tests** en 12 suites
- ✅ **100% cobertura** en componentes críticos
- ✅ **Tests de integración** para flujos completos
- ✅ **Tests unitarios** para hooks y servicios
- ✅ **Tests de UI** para componentes

### 🧪 Tipos de Tests

```javascript
// Test de componente
describe('DashboardScreen', () => {
  it('renderiza correctamente con tarjeta activa', async () => {
    const { getByText } = render(<DashboardScreen />, { wrapper: TestWrapper });
    expect(getByText('Saldo Actual')).toBeTruthy();
    expect(getByText('Recargar')).toBeTruthy();
  });
});

// Test de integración
describe('Flujo de autenticación', () => {
  it('permite login y navegación al dashboard', async () => {
    // Test completo del flujo de login
  });
});
```

### 🎯 Estrategias de Testing

- **Componentes**: Renderizado y comportamiento
- **Hooks**: Estado y efectos
- **Context**: Estado global y actualizaciones
- **Servicios**: Llamadas a API y manejo de errores
- **Integración**: Flujos completos de usuario

## 📦 Build y Deployment

### 🏗️ Generar APK

```bash
# Configurar EAS Build
eas build:configure

# Generar APK de desarrollo
eas build --platform android --profile development

# Generar APK de producción
eas build --platform android --profile production
```

### 🍎 Generar IPA (iOS)

```bash
# Generar IPA de desarrollo
eas build --platform ios --profile development

# Generar IPA de producción
eas build --platform ios --profile production
```

### 📱 Configuración de Build

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

## 🎨 UI/UX

### 🎨 Diseño System

- **Colores**: Paleta corporativa (morado y amarillo)
- **Tipografía**: Fuente personalizada Chicalo
- **Iconografía**: Material Design Icons
- **Espaciado**: Sistema de 8px base
- **Bordes**: Radio de 8px para cards

### 📱 Componentes

#### CenteredLoader
```javascript
<CenteredLoader message="Cargando datos..." />
```

#### Card Component
```javascript
<Card style={styles.card}>
  <Card.Content>
    <Title>Mi Tarjeta</Title>
    <Paragraph>Saldo: Bs. 25.00</Paragraph>
  </Card.Content>
</Card>
```

#### Custom Button
```javascript
<Button 
  mode="contained" 
  onPress={handlePress}
  style={styles.button}
>
  Recargar
</Button>
```

### 🎯 Patrones de UX

- **Feedback inmediato** para todas las acciones
- **Estados de carga** claros y informativos
- **Manejo de errores** con mensajes útiles
- **Navegación intuitiva** con breadcrumbs
- **Accesibilidad** con labels y contrastes

## 🔒 Seguridad

### 🛡️ Medidas Implementadas

- **Almacenamiento seguro** de tokens JWT
- **Validación de entrada** en formularios
- **Sanitización** de datos de usuario
- **Manejo seguro** de contraseñas
- **Logout automático** por inactividad

### 🔐 Autenticación

```javascript
// AuthContext.js
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.ok) {
        await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 🔄 Refresh Tokens

```javascript
// apiService.js
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      await AsyncStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    // Redirigir a login
    navigation.replace('Login');
  }
};
```

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-org/nfc-transport-app/issues)
- **Documentación**: [Frontend Guide](README.md)
- **Email**: frontend@nfc-transport-app.com

---

**Desarrollado con ❤️ por el equipo de NFC Transport App**
