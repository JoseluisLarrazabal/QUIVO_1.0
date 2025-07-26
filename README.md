# ⚙️ Backend - NFC Transport App API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Jest](https://img.shields.io/badge/Jest-29.7+-yellow.svg)](https://jestjs.io/)
[![Tests](https://img.shields.io/badge/tests-25%20passed-brightgreen)](https://github.com/your-org/nfc-transport-app)

> **API RESTful para el sistema de transporte público con autenticación JWT y gestión de tarjetas NFC**

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Características](#-características)
- [⚙️ Instalación](#️-instalación)
- [🔧 Configuración](#-configuración)
- [📚 API Endpoints](#-api-endpoints)
- [🗄️ Base de Datos](#️-base-de-datos)
- [🧪 Testing](#-testing)
- [🔒 Seguridad](#-seguridad)
- [📦 Deployment](#-deployment)

## 🎯 Descripción

El backend de NFC Transport App es una API RESTful construida con Node.js y Express que proporciona todos los servicios necesarios para la gestión de usuarios, tarjetas NFC, transacciones y autenticación del sistema de transporte público.

### 🎯 Objetivos
- **API RESTful** con endpoints bien documentados
- **Autenticación segura** con JWT y refresh tokens
- **Gestión de tarjetas** NFC con validación de propiedad
- **Sistema de transacciones** para viajes y recargas
- **Escalabilidad** y mantenibilidad del código

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Routes    │  │ Middleware  │  │  Services   │        │
│  │             │  │             │  │             │        │
│  │ • auth      │  │ • auth      │  │ • auth      │        │
│  │ • cards     │  │ • validation│  │ • cards     │        │
│  │ • users     │  │ • rate limit│  │ • users     │        │
│  │ • transact  │  │ • cors      │  │ • transact  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           │               │               │               │
│           └───────────────┼───────────────┘               │
│                           │                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Models    │  │   Config    │  │   Utils     │        │
│  │             │  │             │  │             │        │
│  │ • User      │  │ • database  │  │ • logger    │        │
│  │ • Card      │  │ • logger    │  │ • validator │        │
│  │ • Transaction│ │ • jwt       │  │ • helpers   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Estructura del Proyecto

```
Backend/
├── config/                 # Configuraciones
│   ├── database.js        # Configuración de MongoDB
│   ├── logger.js          # Configuración de logs
│   └── metrics.js         # Métricas y monitoreo
├── middleware/            # Middlewares personalizados
│   ├── auth.js           # Autenticación JWT
│   └── validation.js     # Validación de datos
├── models/               # Modelos de MongoDB
│   ├── User.js          # Modelo de usuario
│   ├── Card.js          # Modelo de tarjeta
│   └── Transaction.js   # Modelo de transacción
├── routes/               # Rutas de la API
│   ├── auth.js          # Autenticación
│   ├── cards.js         # Gestión de tarjetas
│   ├── transactions.js  # Transacciones
│   └── users.js         # Usuarios
├── services/            # Lógica de negocio
│   └── authService.js   # Servicios de autenticación
├── scripts/             # Scripts de utilidad
│   ├── seed-data.js     # Datos de prueba
│   └── setup-env.js     # Configuración inicial
├── __tests__/           # Tests automatizados
├── server.js            # Punto de entrada
└── package.json         # Dependencias
```

## 🚀 Características

### 🔐 Autenticación y Autorización
- ✅ **JWT Tokens** con expiración configurable
- ✅ **Refresh Tokens** para renovación automática
- ✅ **Bcrypt** para encriptación de contraseñas
- ✅ **Rate Limiting** para prevenir abusos
- ✅ **CORS** configurado para seguridad

### 💳 Gestión de Tarjetas NFC
- ✅ **Registro de tarjetas** con validación de UID
- ✅ **Asociación a usuarios** con verificación de propiedad
- ✅ **Múltiples tarjetas** por usuario
- ✅ **Alias personalizados** para identificación
- ✅ **Estado activo/inactivo** para gestión

### 💰 Sistema de Transacciones
- ✅ **Registro de viajes** automático
- ✅ **Sistema de recarga** con múltiples métodos
- ✅ **Historial completo** con filtros
- ✅ **Validación de saldo** antes de transacciones
- ✅ **Reportes y estadísticas**

### 🗄️ Base de Datos
- ✅ **MongoDB Atlas** para escalabilidad
- ✅ **Mongoose ODM** para modelado
- ✅ **Indexes optimizados** para performance
- ✅ **Validación de esquemas** robusta
- ✅ **Backup automático** configurado

## ⚙️ Instalación

### 📋 Prerrequisitos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **npm** o **yarn**
- **MongoDB** (local o Atlas)
- **Git**

### 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/your-org/nfc-transport-app.git
cd nfc-transport-app/Backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar en desarrollo
npm run dev

# 5. Verificar instalación
npm test
```

### 🔧 Configuración Detallada

Consulta la [Guía de Configuración de Entorno](ENV_SETUP.md) para configuraciones avanzadas.

## 🔧 Configuración

### 📝 Variables de Entorno

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/nfc-transport
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/nfc-transport

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### 🗄️ Configuración de Base de Datos

```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
```

## 📚 API Endpoints

### 🔐 Autenticación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Login con credenciales | No |
| POST | `/api/auth/login-card` | Login con tarjeta NFC | No |
| POST | `/api/auth/refresh` | Renovar token | Refresh Token |
| POST | `/api/auth/logout` | Cerrar sesión | JWT |
| GET | `/api/auth/verify` | Verificar token | JWT |

### 💳 Gestión de Tarjetas

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/usuario/:userId/tarjetas` | Obtener tarjetas | JWT |
| POST | `/api/usuario/:userId/tarjetas` | Agregar tarjeta | JWT |
| PATCH | `/api/tarjetas/:uid` | Actualizar alias | JWT |
| DELETE | `/api/tarjetas/:uid` | Eliminar tarjeta | JWT |
| GET | `/api/saldo/:uid` | Consultar saldo | JWT |

### 💰 Transacciones

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/recargar` | Procesar recarga | JWT |
| GET | `/api/historial/:uid` | Historial de transacciones | JWT |
| POST | `/api/validar` | Validar tarjeta | JWT |

### 📊 Documentación Completa

Consulta la [Documentación Completa de la API](API_DOCUMENTATION_JWT.md) para detalles de todos los endpoints, parámetros, respuestas y códigos de error.

## 🗄️ Base de Datos

### 📊 Modelos

#### User Model
```javascript
{
  username: String,        // Usuario único
  password: String,        // Encriptado con bcrypt
  nombre: String,          // Nombre completo
  email: String,           // Email único
  telefono: String,        // Teléfono
  tipo_tarjeta: String,    // 'adulto', 'estudiante', 'adulto_mayor'
  fecha_registro: Date,    // Fecha de registro
  activo: Boolean          // Estado del usuario
}
```

#### Card Model
```javascript
{
  uid: String,             // UID único de la tarjeta NFC
  usuario_id: ObjectId,    // Referencia al usuario
  alias: String,           // Alias personalizado
  saldo_actual: Number,    // Saldo en bolivianos
  tipo_tarjeta: String,    // Tipo de tarjeta
  fecha_creacion: Date,    // Fecha de registro
  activa: Boolean          // Estado de la tarjeta
}
```

#### Transaction Model
```javascript
{
  tarjeta_uid: String,     // UID de la tarjeta
  tipo: String,            // 'viaje', 'recarga'
  monto: Number,           // Monto de la transacción
  ubicacion: String,       // Ubicación del evento
  resultado: String,       // 'exitoso', 'fallido'
  fecha_hora: Date,        // Timestamp
  detalles: Object         // Información adicional
}
```

### 🔍 Indexes Optimizados

```javascript
// User indexes
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true })

// Card indexes
db.cards.createIndex({ "uid": 1 }, { unique: true })
db.cards.createIndex({ "usuario_id": 1 })

// Transaction indexes
db.transactions.createIndex({ "tarjeta_uid": 1 })
db.transactions.createIndex({ "fecha_hora": -1 })
db.transactions.createIndex({ "tipo": 1, "fecha_hora": -1 })
```

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
npm test -- --testNamePattern="auth"
```

### 📊 Cobertura de Tests

- ✅ **25 tests** en 8 suites
- ✅ **100% cobertura** en rutas críticas
- ✅ **Tests de integración** para flujos completos
- ✅ **Tests unitarios** para servicios
- ✅ **Tests de autenticación** y autorización

### 🧪 Tipos de Tests

```javascript
// Test de integración
describe('POST /api/auth/login', () => {
  it('should authenticate user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens).toBeDefined();
  });
});
```

## 🔒 Seguridad

### 🛡️ Medidas Implementadas

- **JWT Tokens** con expiración configurable
- **Bcrypt** para encriptación de contraseñas
- **Rate Limiting** para prevenir ataques de fuerza bruta
- **CORS** configurado para orígenes permitidos
- **Helmet.js** para headers de seguridad
- **Validación de entrada** con express-validator
- **Sanitización** de datos de entrada

### 🔐 Autenticación

```javascript
// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de acceso requerido' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};
```

### 🚫 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  }
});
```

## 📦 Deployment

### 🚀 Producción

```bash
# 1. Configurar variables de producción
export NODE_ENV=production
export MONGODB_URI_PROD=your-production-mongodb-uri
export JWT_SECRET=your-production-jwt-secret

# 2. Instalar dependencias de producción
npm ci --only=production

# 3. Iniciar servidor
npm start
```

### 🐳 Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### ☁️ Cloud Deployment

- **Heroku**: Configurado para despliegue automático
- **AWS**: EC2 con PM2 para gestión de procesos
- **Google Cloud**: App Engine con escalado automático
- **Azure**: App Service con CI/CD integrado

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-org/nfc-transport-app/issues)
- **Documentación**: [API Docs](API_DOCUMENTATION_JWT.md)
- **Email**: backend@nfc-transport-app.com

---

**Desarrollado con ❤️ por el equipo de NFC Transport App**
