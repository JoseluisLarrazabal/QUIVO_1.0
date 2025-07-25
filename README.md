# NFC Transport App

Aplicación móvil para gestión de tarjetas de transporte público con tecnología NFC en Bolivia.

## 🚀 Características

- **NUEVO**: **Autenticación Dual**: Acceso con credenciales tradicionales o UID de tarjeta NFC
- **NUEVO**: **Gestión Avanzada de Tarjetas**: Agregar, eliminar y renombrar tarjetas
- **NUEVO**: **Menú Hamburguesa**: Navegación mejorada con Drawer Navigation
- **NUEVO**: **Múltiples Tarjetas**: Soporte para usuarios con varias tarjetas
- **NUEVO**: **Alias Personalizados**: Nombres personalizados para cada tarjeta
- **Gestión de Saldo**: Visualización y actualización del saldo de la tarjeta
- **Historial de Transacciones**: Consulta de movimientos recientes
- **Recarga de Tarjeta**: Múltiples métodos de pago (efectivo, QR, Tigo Money)
- **Tipos de Tarjeta**: Soporte para adulto, estudiante y adulto mayor
- **Interfaz Intuitiva**: Diseño moderno y fácil de usar
- **NUEVO**: **Tests Automatizados**: Suite completa de tests unitarios

## 🛠️ Tecnologías Utilizadas

- **React Native** con Expo
- **React Navigation** (Stack, Tab, Drawer)
- **React Native Paper** para componentes UI
- **AsyncStorage** para persistencia local
- **React Native Vector Icons** para iconografía
- **Jest** para testing
- **React Native Testing Library** para tests de componentes

## 📱 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd NFCTransportApp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar el backend**:
   - Asegúrate de que el servidor backend esté ejecutándose
   - La app detecta automáticamente la IP del host Metro Bundler
   - Para configuración manual, edita `src/services/apiService.js`

4. **Ejecutar tests (opcional)**:
   ```bash
   npm test
   ```

5. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

## 📁 Estructura del Proyecto

```
NFCTransportApp/
├── App.js                 # Punto de entrada principal
├── app.json              # Configuración de Expo
├── package.json          # Dependencias del proyecto
├── babel.config.js       # Configuración de Babel
├── __tests__/            # Tests automatizados
│   ├── components/       # Tests de componentes
│   ├── context/         # Tests de contexto
│   ├── hooks/           # Tests de hooks
│   ├── screens/         # Tests de pantallas
│   └── services/        # Tests de servicios
├── src/
│   ├── components/
│   │   └── CenteredLoader.js    # Componente de carga
│   ├── context/
│   │   └── AuthContext.js       # Contexto de autenticación
│   ├── hooks/
│   │   └── useAuthState.js      # Hook para estado de auth
│   ├── screens/
│   │   ├── LoginScreen.js       # Pantalla de login dual
│   │   ├── DashboardScreen.js   # Pantalla principal
│   │   ├── CardsScreen.js       # Gestión de tarjetas
│   │   ├── HistoryScreen.js     # Historial de transacciones
│   │   └── RechargeScreen.js    # Pantalla de recarga
│   └── services/
│       └── apiService.js        # Servicios de API
└── assets/
    └── images/           # Imágenes y recursos
```

## 🔧 Configuración del Backend

La aplicación requiere un servidor backend con los siguientes endpoints:

### Autenticación
- `POST /api/auth/login` - Login con credenciales
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login-card` - Login con UID de tarjeta

### Tarjetas
- `GET /api/saldo/:uid` - Obtener información de la tarjeta
- `GET /api/usuario/:userId/tarjetas` - Obtener tarjetas del usuario
- `POST /api/usuario/:userId/tarjetas` - Agregar tarjeta a usuario
- `DELETE /api/tarjetas/:uid` - Eliminar tarjeta
- `PATCH /api/tarjetas/:uid` - Actualizar alias de tarjeta

### Transacciones
- `GET /api/historial/:uid` - Obtener historial de transacciones
- `POST /api/recargar` - Procesar recarga de tarjeta
- `POST /api/validar` - Validar uso de tarjeta

## 🎯 Uso

### Modo Credenciales (Recomendado)
1. **Registro**: Crea una cuenta con username y contraseña
2. **Login**: Inicia sesión con tus credenciales
3. **Gestión de Tarjetas**: Agrega, elimina o renombra tus tarjetas
4. **Selección**: Elige qué tarjeta usar como activa
5. **Operaciones**: Recarga, consulta historial, etc.

### Modo Tarjeta NFC (Rápido)
1. **Acceso Directo**: Ingresa el UID de tu tarjeta NFC
2. **Uso Inmediato**: Accede directamente a la funcionalidad
3. **Limitaciones**: Solo una tarjeta por sesión

## 🧪 Testing

El proyecto incluye una suite completa de tests:

### Tests Unitarios
- **Componentes**: Validación de renderizado y comportamiento
- **Contextos**: Estado de autenticación y gestión de datos
- **Hooks**: Lógica de estado y efectos
- **Servicios**: Llamadas a API y manejo de errores

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### Cobertura de Tests
- ✅ Componentes principales testeados
- ✅ Contextos de autenticación validados
- ✅ Servicios de API cubiertos
- ✅ Hooks personalizados testeados

## 🎨 Navegación

### Estructura de Navegación
```
App
├── Login (Stack Navigator)
└── Main (Drawer Navigator)
    ├── Inicio (Tab Navigator)
    │   ├── Dashboard
    │   ├── History
    │   └── Recharge
    └── Cards (Drawer Screen)
```

### Características de Navegación
- **Drawer Navigation**: Menú hamburguesa siempre accesible
- **Tab Navigation**: Navegación rápida entre pantallas principales
- **Stack Navigation**: Navegación con historial para pantallas específicas
- **Gestión de Estado**: Context API para estado global

## 🔧 Desarrollo

### Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web

# Ejecutar tests
npm test

# Limpiar caché
expo r -c
```

### Configuración de Entorno

Para desarrollo local, asegúrate de:
- Tener Node.js instalado (versión 16 o superior)
- Tener Expo CLI instalado globalmente
- Configurar un emulador Android/iOS o usar un dispositivo físico
- Tener el backend ejecutándose en la red local

### Configuración de IP Automática

La app detecta automáticamente la IP del host Metro Bundler:
- **Expo Go**: Usa la IP del debuggerHost
- **EAS Build**: Usa la IP del hostUri
- **Fallback**: Usa localhost o configuración manual

## 🆕 Nuevas Funcionalidades

### Gestión Avanzada de Tarjetas
- **Agregar Tarjetas**: Añadir nuevas tarjetas a usuarios existentes
- **Eliminar Tarjetas**: Desactivar tarjetas (no se eliminan físicamente)
- **Renombrar Tarjetas**: Asignar alias personalizados
- **Selección de Tarjetas**: Cambiar entre múltiples tarjetas

### Sistema de Autenticación Mejorado
- **Login Dual**: Credenciales tradicionales o UID de tarjeta
- **Registro Seguro**: Validación de datos y encriptación
- **Persistencia**: Mantiene sesión entre reinicios de app
- **Modo Tarjeta**: Acceso rápido sin registro

### Interfaz de Usuario Mejorada
- **Menú Hamburguesa**: Navegación intuitiva
- **Indicadores Visuales**: Estados de tarjetas y transacciones
- **Feedback Inmediato**: Confirmaciones y errores claros
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Ejecuta los tests (`npm test`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

### Guías de Contribución
- Seguir las convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario
- Verificar que todos los tests pasen antes del PR

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@nfctransporte.bo
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Documentación: [API Documentation](../backend/API_DOCUMENTATION.md)

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Notificaciones push para recargas y viajes
- [ ] Integración con lectores NFC físicos
- [ ] Modo offline con sincronización
- [ ] Temas personalizables
- [ ] Soporte para múltiples idiomas
- [ ] Analytics y reportes de uso
