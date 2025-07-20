# 🔧 Configuración de Variables de Entorno

## 📋 Variables Requeridas para Rate Limiting

Para que el sistema de rate limiting funcione correctamente, necesitas configurar las siguientes variables en tu archivo `.env`:

### **Variables Nuevas (Agregar)**

```bash
# Rate Limiting (configuración actualizada)
RATE_LIMIT_MAX=100
TEST_RATE_LIMIT_MAX=100
```

### **Variables Existentes (Verificar)**

Tu archivo `.env` actual ya tiene estas variables, pero asegúrate de que estén configuradas:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## 🚀 Métodos de Configuración

### **Opción 1: Script Automático (Recomendado)**

Ejecuta el script que creamos para configurar automáticamente:

```bash
npm run setup-env
```

Este script:
- ✅ Detecta tu archivo `.env` actual
- ✅ Agrega las variables faltantes
- ✅ Crea un backup del archivo original
- ✅ Verifica que todo esté configurado correctamente

### **Opción 2: Configuración Manual**

Si prefieres hacerlo manualmente, agrega estas líneas a tu archivo `.env`:

```bash
# Rate Limiting (configuración actualizada)
RATE_LIMIT_MAX=100
TEST_RATE_LIMIT_MAX=100
```

## 📊 Configuración por Entorno

| Entorno | RATE_LIMIT_MAX | TEST_RATE_LIMIT_MAX | Ventana de Tiempo |
|---------|----------------|---------------------|-------------------|
| **Producción** | 100 | - | 15 minutos |
| **Desarrollo** | 100 | - | 15 minutos |
| **Test** | - | 100 | 1 minuto |

## 🔍 Verificación

Para verificar que todo funciona correctamente:

```bash
# Ejecutar tests
npm test

# Verificar que los tests de rate limiting pasen
npm test -- --testNamePattern="Rate Limiting"
```

## 🛠️ Solución de Problemas

### **Error: "Variables no encontradas"**
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto Backend
- Verifica que las variables estén escritas correctamente (sin espacios)

### **Error: "Rate limiting no funciona"**
- Verifica que `NODE_ENV` esté configurado correctamente
- Asegúrate de que las variables `RATE_LIMIT_MAX` y `TEST_RATE_LIMIT_MAX` estén definidas

### **Error: "Tests fallando"**
- Ejecuta `npm run setup-env` para configurar automáticamente
- Verifica que el archivo `.env` no tenga errores de sintaxis

## 📝 Notas Importantes

- 🔒 El archivo `.env` está en `.gitignore` por seguridad
- 💾 El script crea un backup automático antes de modificar
- ⚙️ Las variables se cargan automáticamente al iniciar el servidor
- 🧪 Los tests usan configuración específica para el entorno de test

## 🎯 Resultado Esperado

Después de la configuración, deberías ver:

```
✅ 9 suites de test pasando
✅ 146 tests pasando (incluyendo rate limiting)
✅ 0 tests fallando
```

¡Tu sistema de rate limiting estará completamente funcional! 🎉 