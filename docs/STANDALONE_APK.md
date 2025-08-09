# APK Standalone para QUIVO

## Descripción

Esta configuración permite generar un APK standalone que se conecta directamente al backend en Render.com sin necesidad de Expo Go.

## Configuraciones Agregadas

### 1. Nuevos Perfiles de Build en `eas.json`

- **`apk-standalone`**: Genera un APK que se conecta al backend de producción
- **`production-standalone`**: Genera un build de producción standalone

### 2. URLs de API Configuradas

- **Desarrollo**: `http://172.20.10.2:3000/api` (configuración existente)
- **Producción**: `https://quivo-backend-3vhv.onrender.com/api` (nueva configuración)

### 3. Detección Automática

El `apiService.js` detecta automáticamente si la app está en modo standalone y usa la URL correspondiente.

## Comandos para Generar APK

### Development (Desarrollo con Expo Go)
```bash
cd Frontend
npm run build:development
```

### APK Standalone (Distribución)
```bash
cd Frontend
npm run build:apk-standalone
```

### Production Standalone (Versión final)
```bash
cd Frontend
npm run build:production-standalone
```

## Diferencias entre Configuraciones

| Configuración | Expo Go | Backend | Uso |
|---------------|---------|---------|-----|
| `development` | ✅ Requerido | Local | Desarrollo |
| `apk-standalone` | ❌ No requerido | Render.com | Distribución |
| `production-standalone` | ❌ No requerido | Render.com | Producción |

## Instalación y Uso

1. **Generar APK**:
   ```bash
   cd Frontend
   npm run build:apk-standalone
   ```

2. **Descargar APK**: El build se generará en EAS Build y podrás descargarlo

3. **Instalar en dispositivo**: Instalar directamente en dispositivos Android

4. **No requiere Expo Go**: La app funcionará independientemente

## Configuración de Red

### Permisos Android Agregados
- `INTERNET`: Para conexiones HTTP/HTTPS
- `ACCESS_NETWORK_STATE`: Para verificar conectividad

### URLs Configuradas
- **Desarrollo local**: `http://172.20.10.2:3000/api`
- **Producción**: `https://quivo-backend-3vhv.onrender.com/api`

## Troubleshooting

### Problemas de Conexión
1. Verificar que el dispositivo tenga conexión a internet
2. Confirmar que el backend en Render.com esté funcionando
3. Revisar logs de la app para errores de red

### Problemas de Build
1. Verificar que EAS CLI esté instalado: `npm install -g @expo/eas-cli`
2. Asegurar que estés logueado en Expo: `eas login`
3. Verificar configuración de EAS: `eas build:configure`

## Notas Importantes

- El APK standalone es más grande que la versión con Expo Go
- La primera carga puede ser más lenta
- No requiere instalación de Expo Go en dispositivos
- Funciona offline para funcionalidades que no requieren servidor
- Se conecta automáticamente al backend de producción 