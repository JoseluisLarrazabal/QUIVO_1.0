# NFC Transport App

Aplicación móvil para gestión de tarjetas de transporte público con tecnología NFC en Bolivia.

## Características

- **Autenticación por UID**: Acceso mediante el UID de la tarjeta NFC
- **Gestión de Saldo**: Visualización y actualización del saldo de la tarjeta
- **Historial de Transacciones**: Consulta de movimientos recientes
- **Recarga de Tarjeta**: Múltiples métodos de pago (efectivo, QR, Tigo Money)
- **Tipos de Tarjeta**: Soporte para adulto, estudiante y adulto mayor
- **Interfaz Intuitiva**: Diseño moderno y fácil de usar

## Tecnologías Utilizadas

- **React Native** con Expo
- **React Navigation** para navegación
- **React Native Paper** para componentes UI
- **AsyncStorage** para persistencia local
- **React Native Vector Icons** para iconografía

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd NFCTransportApp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el backend**:
   - Asegúrate de que el servidor backend esté ejecutándose en `http://localhost:3000`
   - O modifica la URL en `src/services/apiService.js`

4. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

## Estructura del Proyecto

```
NFCTransportApp/
├── App.js                 # Punto de entrada principal
├── app.json              # Configuración de Expo
├── package.json          # Dependencias del proyecto
├── src/
│   ├── context/
│   │   └── AuthContext.js    # Contexto de autenticación
│   ├── screens/
│   │   ├── LoginScreen.js    # Pantalla de login
│   │   ├── DashboardScreen.js # Pantalla principal
│   │   ├── HistoryScreen.js  # Historial de transacciones
│   │   └── RechargeScreen.js # Pantalla de recarga
│   └── services/
│       └── apiService.js     # Servicios de API
└── assets/
    └── images/           # Imágenes y recursos
```

## Configuración del Backend

La aplicación requiere un servidor backend con los siguientes endpoints:

- `GET /api/saldo/:uid` - Obtener información de la tarjeta
- `GET /api/historial/:uid` - Obtener historial de transacciones
- `POST /api/recargar` - Procesar recarga de tarjeta
- `POST /api/validar` - Validar uso de tarjeta

## Uso

1. **Iniciar Sesión**: Ingresa el UID de tu tarjeta NFC
2. **Ver Saldo**: Consulta tu saldo actual y viajes disponibles
3. **Recargar**: Agrega saldo a tu tarjeta con diferentes métodos de pago
4. **Historial**: Revisa tus transacciones recientes

## Desarrollo

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
```

### Configuración de Entorno

Para desarrollo local, asegúrate de:
- Tener Node.js instalado (versión 16 o superior)
- Tener Expo CLI instalado globalmente
- Configurar un emulador Android/iOS o usar un dispositivo físico

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.
