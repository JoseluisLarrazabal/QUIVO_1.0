# Variables de Entorno para APK Standalone

## Configuración Recomendada

Para el APK standalone que se conecta directamente al backend en Render.com, usa estas variables de entorno:

```bash
# URL del backend de producción
EXPO_PUBLIC_API_BASE_URL=https://quivo-backend-3vhv.onrender.com/api

# Configuración de la app
EXPO_PUBLIC_APP_NAME=QUIVO
EXPO_PUBLIC_APP_VERSION=1.0.0

# Configuración de red
EXPO_PUBLIC_NETWORK_TIMEOUT=30000
EXPO_PUBLIC_RETRY_ATTEMPTS=3

# Configuración de logs
EXPO_PUBLIC_ENABLE_LOGS=true
EXPO_PUBLIC_LOG_LEVEL=info
```

## Configuración en EAS Build

Las variables de entorno ya están configuradas en los perfiles de build:

### Perfil `apk-standalone`
```json
{
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
  }
}
```

### Perfil `production-standalone`
```json
{
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
  }
}
```

## Diferencias con Desarrollo

| Variable | Desarrollo | Standalone |
|----------|------------|------------|
| API_BASE_URL | `http://172.20.10.2:3000/api` | `https://quivo-backend-3vhv.onrender.com/api` |
| Requiere Expo Go | ✅ Sí | ❌ No |
| Conexión | Local | Internet |

## Notas Importantes

- Las variables `EXPO_PUBLIC_*` son accesibles en el código de la app
- Las variables sin `EXPO_PUBLIC_` solo están disponibles en el servidor de build
- El APK standalone detecta automáticamente la URL de producción
- No es necesario configurar variables adicionales manualmente 