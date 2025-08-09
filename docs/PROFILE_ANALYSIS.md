# 📊 Análisis de Perfiles EAS Build - QUIVO

## 🔍 **Perfiles Actuales**

### 1. **`development`**
```json
{
  "developmentClient": true,
  "distribution": "internal"
}
```
- **Uso**: Desarrollo con Expo Go
- **Backend**: Local (detectado automáticamente)
- **Estado**: ✅ **NECESARIO** - Para desarrollo local

### 2. **`preview`**
```json
{
  "distribution": "internal"
}
```
- **Uso**: Preview sin configuración específica
- **Backend**: No especificado (usa configuración por defecto)
- **Estado**: ❌ **REDUNDANTE** - No tiene configuración útil

### 3. **`production`**
```json
{
  "autoIncrement": true
}
```
- **Uso**: Producción con Expo Go
- **Backend**: No especificado (usa configuración por defecto)
- **Estado**: ❌ **REDUNDANTE** - Si usas development para producción

### 4. **`apk`**
```json
{
  "android": {
    "buildType": "apk"
  },
  "distribution": "internal"
}
```
- **Uso**: APK con Expo Go
- **Backend**: Local (detectado automáticamente)
- **Estado**: ❌ **REDUNDANTE** - Si usas standalone para producción

### 5. **`apk-standalone`**
```json
{
  "android": {
    "buildType": "apk"
  },
  "distribution": "internal",
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
  }
}
```
- **Uso**: APK standalone para distribución
- **Backend**: Render.com
- **Estado**: ✅ **NECESARIO** - Para distribución final

### 6. **`production-standalone`**
```json
{
  "autoIncrement": true,
  "env": {
    "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
  }
}
```
- **Uso**: Producción standalone
- **Backend**: Render.com
- **Estado**: ✅ **NECESARIO** - Para versión final de producción

## 🎯 **Análisis de Redundancia**

### ❌ **Perfiles REDUNDANTES:**

#### 1. **`preview`**
- **Razón**: No tiene configuración específica
- **Alternativa**: Usar `development` o `apk-standalone`

#### 2. **`production`**
- **Razón**: Si usas `development` para producción
- **Alternativa**: Usar `production-standalone`

#### 3. **`apk`**
- **Razón**: Si usas standalone para distribución
- **Alternativa**: Usar `apk-standalone`

### ✅ **Perfiles NECESARIOS:**

#### 1. **`development`**
- **Uso**: Desarrollo local con Expo Go
- **Backend**: Local automático
- **Mantener**: ✅

#### 2. **`apk-standalone`**
- **Uso**: Distribución de APK standalone
- **Backend**: Render.com
- **Mantener**: ✅

#### 3. **`production-standalone`**
- **Uso**: Versión final de producción
- **Backend**: Render.com
- **Mantener**: ✅

## 🧹 **Configuración Optimizada Recomendada**

```json
{
  "cli": {
    "version": ">= 16.17.3",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "apk-standalone": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
      }
    },
    "production-standalone": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://quivo-backend-3vhv.onrender.com/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 📋 **Resumen de Cambios**

### ❌ **Eliminar:**
- `preview` - Sin configuración útil
- `production` - Redundante con development
- `apk` - Redundante con apk-standalone

### ✅ **Mantener:**
- `development` - Para desarrollo local
- `apk-standalone` - Para distribución
- `production-standalone` - Para versión final

## 🎯 **Comandos Finales**

### Para Desarrollo:
```bash
eas build --platform android --profile development
```

### Para Distribución:
```bash
eas build --platform android --profile apk-standalone
```

### Para Producción:
```bash
eas build --platform android --profile production-standalone
```

**Resultado**: 3 perfiles limpios y específicos en lugar de 6 redundantes. 