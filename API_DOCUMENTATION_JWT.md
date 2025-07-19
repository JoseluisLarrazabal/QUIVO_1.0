# API Documentation - Sistema NFC Transporte Público (Con JWT)

## Base URL
```
http://localhost:3000/api
```

## Autenticación JWT

El sistema ahora utiliza **JWT (JSON Web Tokens)** para autenticación segura. Cada usuario recibe dos tokens:
- **Access Token**: Para acceder a recursos protegidos (expira en 24h)
- **Refresh Token**: Para renovar el access token (expira en 7 días)

### Headers de Autenticación
```
Authorization: Bearer <access_token>
```

## Endpoints de Autenticación

### 1. Login con Credenciales

#### POST /auth/login
Autenticar usuario con username y password.

**Request:**
```json
{
  "username": "juan.perez",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "juan.perez",
      "nombre": "Juan Pérez",
      "tipo_tarjeta": "adulto",
      "email": "juan@example.com",
      "telefono": "70123456"
    },
    "cards": [
      {
        "uid": "A1B2C3D4",
        "saldo_actual": 25.00,
        "alias": "Mi Tarjeta Principal",
        "fecha_creacion": "2024-01-15T10:30:00Z"
      }
    ],
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Contraseña incorrecta",
  "code": "AUTHENTICATION_FAILED"
}
```

### 2. Login con Tarjeta NFC

#### POST /auth/login-card
Autenticar usuario con UID de tarjeta NFC.

**Request:**
```json
{
  "uid": "A1B2C3D4"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "card": {
      "uid": "A1B2C3D4",
      "saldo_actual": 25.00,
      "alias": "Mi Tarjeta",
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "usuario": {
        "nombre": "Juan Pérez",
        "tipo_tarjeta": "adulto"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "authMode": "card"
  }
}
```

### 3. Registro de Usuario

#### POST /auth/register
Registrar nuevo usuario en el sistema.

**Request:**
```json
{
  "username": "nuevo.usuario",
  "password": "123456",
  "nombre": "Nuevo Usuario",
  "tipo_tarjeta": "adulto",
  "email": "nuevo@example.com",
  "telefono": "70123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "username": "nuevo.usuario",
      "nombre": "Nuevo Usuario",
      "tipo_tarjeta": "adulto",
      "email": "nuevo@example.com",
      "telefono": "70123456"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 4. Refresh Token

#### POST /auth/refresh
Renovar access token usando refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Logout

#### POST /auth/logout
Cerrar sesión y revocar tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### 6. Verificar Token

#### GET /auth/verify
Verificar si un token es válido.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "juan.perez",
      "nombre": "Juan Pérez",
      "tipo_tarjeta": "adulto",
      "email": "juan@example.com"
    },
    "message": "Token válido"
  }
}
```

## Endpoints Protegidos

### Tarjetas (Requieren Autenticación)

#### GET /usuario/:userId/tarjetas
Obtener tarjetas de un usuario específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "uid": "A1B2C3D4",
      "saldo_actual": 25.00,
      "alias": "Mi Tarjeta Principal",
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "usuario": {
        "nombre": "Juan Pérez",
        "tipo_tarjeta": "adulto"
      }
    }
  ]
}
```

#### POST /usuario/:userId/tarjetas
Agregar tarjeta a usuario existente.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "uid": "NEW456",
  "alias": "Tarjeta de Trabajo",
  "tipo_tarjeta": "adulto",
  "saldo_inicial": 15.00
}
```

#### DELETE /tarjetas/:uid
Eliminar (desactivar) tarjeta (requiere propiedad).

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PATCH /tarjetas/:uid
Actualizar alias de tarjeta (requiere propiedad).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "alias": "Nuevo Alias"
}
```

## Códigos de Error

### Códigos de Autenticación
- `TOKEN_MISSING`: Token de acceso requerido
- `TOKEN_INVALID`: Token inválido
- `TOKEN_EXPIRED`: Token expirado
- `USER_INVALID`: Usuario no encontrado o inactivo
- `AUTHENTICATION_FAILED`: Error en autenticación
- `CARD_AUTHENTICATION_FAILED`: Error en autenticación por tarjeta
- `REGISTRATION_FAILED`: Error en registro
- `REFRESH_TOKEN_FAILED`: Error al refrescar token
- `LOGOUT_FAILED`: Error al cerrar sesión

### Códigos de Validación
- `MISSING_CREDENTIALS`: Usuario y contraseña requeridos
- `MISSING_CARD_UID`: UID de tarjeta requerido
- `MISSING_REQUIRED_FIELDS`: Campos obligatorios faltantes
- `MISSING_REFRESH_TOKEN`: Refresh token requerido

### Códigos de Autorización
- `AUTH_REQUIRED`: Autenticación requerida
- `INSUFFICIENT_PERMISSIONS`: Permisos insuficientes
- `CARD_OWNERSHIP_DENIED`: La tarjeta no pertenece al usuario

## Implementación en Frontend

### Almacenamiento de Tokens
```javascript
// Guardar tokens en AsyncStorage
await AsyncStorage.setItem('accessToken', response.data.tokens.accessToken);
await AsyncStorage.setItem('refreshToken', response.data.tokens.refreshToken);
```

### Interceptor HTTP
```javascript
// Agregar token a todas las requests
apiService.addRequestInterceptor((config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar token expirado
apiService.addResponseInterceptor((response) => {
  if (response.status === 401 && response.data.code === 'TOKEN_EXPIRED') {
    // Intentar refresh token
    return refreshTokenAndRetry(response.config);
  }
  return response;
});
```

### Refresh Token Automático
```javascript
const refreshTokenAndRetry = async (originalRequest) => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const response = await apiService.post('/auth/refresh', { refreshToken });
    
    // Guardar nuevos tokens
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Reintentar request original
    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
    return apiService.request(originalRequest);
  } catch (error) {
    // Refresh token expirado, redirigir a login
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    navigation.replace('Login');
  }
};
```

## Seguridad

### Características de Seguridad Implementadas
- ✅ **JWT con expiración**: Access tokens expiran en 24h
- ✅ **Refresh tokens**: Renovación automática de sesiones
- ✅ **Rate limiting**: 100 requests por 15 minutos
- ✅ **Validación de entrada**: Sanitización de datos
- ✅ **Encriptación de contraseñas**: bcrypt con salt
- ✅ **Verificación de propiedad**: Usuarios solo acceden a sus recursos
- ✅ **CORS configurado**: Orígenes permitidos restringidos
- ✅ **Headers de seguridad**: Helmet.js implementado

### Mejores Prácticas
1. **Nunca almacenar tokens en localStorage** (solo AsyncStorage en React Native)
2. **Implementar refresh automático** antes de que expire el access token
3. **Validar tokens en cada request** a recursos protegidos
4. **Revocar tokens en logout** (implementación futura con blacklist)
5. **Usar HTTPS en producción** para transmisión segura

## Testing

### Ejecutar Tests de Autenticación
```bash
npm test -- --testNamePattern="Sistema de Autenticación JWT"
```

### Tests Incluidos
- ✅ Login con credenciales válidas/inválidas
- ✅ Login con tarjeta NFC
- ✅ Registro de usuarios
- ✅ Refresh de tokens
- ✅ Logout
- ✅ Verificación de tokens
- ✅ Middleware de autenticación
- ✅ Middleware de autorización
- ✅ Verificación de propiedad de tarjetas

## Migración desde Sistema Anterior

### Cambios en Frontend
1. **Actualizar AuthContext** para manejar tokens JWT
2. **Implementar interceptors** para refresh automático
3. **Actualizar AsyncStorage** para tokens
4. **Modificar navegación** para verificar tokens

### Cambios en Backend
1. **Todas las rutas protegidas** ahora requieren `Authorization: Bearer <token>`
2. **Nuevos endpoints**: `/auth/refresh`, `/auth/logout`, `/auth/verify`
3. **Respuestas actualizadas** incluyen tokens en login/register
4. **Códigos de error** estandarizados con códigos específicos

## Próximos Pasos

### Semana 2: Logs y Monitoreo
- Implementar Winston para logs estructurados
- Configurar métricas de autenticación
- Dashboard de monitoreo de tokens

### Semana 3: Cache y Performance
- Redis para cache de sesiones
- Optimización de consultas de autenticación
- Compresión de respuestas

### Semana 4: Producción
- Dockerfile optimizado
- CI/CD pipeline
- Despliegue en cloud 