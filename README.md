# ⚙️ Backend - QUIVO API

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
| POST | `/api/auth/refresh` | Renovar access token | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/verify` | Verificar token | Sí |

### 💳 Tarjetas

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/cards` | Obtener tarjetas del usuario | Sí |
| POST | `/api/cards` | Registrar nueva tarjeta | Sí |
| PUT | `/api/cards/:id` | Actualizar tarjeta | Sí |
| DELETE | `/api/cards/:id` | Eliminar tarjeta | Sí |
| GET | `/api/cards/:uid/saldo` | Obtener saldo de tarjeta | No |

### 💰 Transacciones

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/transactions` | Historial de transacciones | Sí |
| POST | `/api/transactions/recharge` | Recargar tarjeta | Sí |
| POST | `/api/transactions/travel` | Registrar viaje | Sí |
| GET | `/api/transactions/stats` | Estadísticas de uso | Sí |

### 👥 Usuarios

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Obtener perfil | Sí |
| PUT | `/api/users/profile` | Actualizar perfil | Sí |
| GET | `/api/users/cards` | Obtener tarjetas | Sí |

## 🗄️ Base de Datos

### 📊 Modelos

#### User
```javascript
{
  username: String,        // Único, requerido
  password: String,        // Encriptado con bcrypt
  nombre: String,          // Nombre completo
  tipo_tarjeta: String,    // adulto, estudiante, adulto_mayor
  email: String,           // Opcional, validado
  telefono: String,        // Opcional
  activo: Boolean,         // Por defecto true
  createdAt: Date,
  updatedAt: Date
}
```

#### Card
```javascript
{
  uid: String,             // Único, requerido
  usuario_id: ObjectId,    // Referencia a User
  saldo_actual: Number,    // Saldo en bolivianos
  alias: String,           // Nombre personalizado
  activa: Boolean,         // Por defecto true
  fecha_creacion: Date,
  updatedAt: Date
}
```

#### Transaction
```javascript
{
  tarjeta_uid: String,     // UID de la tarjeta
  tipo: String,            // 'recharge' o 'travel'
  monto: Number,           // Monto en bolivianos
  ubicacion: String,       // Ubicación del validador
  validador_id: String,    // ID del validador
  fecha_hora: Date,        // Timestamp
  estado: String,          // 'success', 'pending', 'failed'
  detalles: Object         // Información adicional
}
```

### 🔍 Índices Optimizados

```javascript
// User indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ tipo_tarjeta: 1 });
userSchema.index({ activo: 1 });

// Card indexes
cardSchema.index({ uid: 1 }, { unique: true });
cardSchema.index({ usuario_id: 1 });
cardSchema.index({ activa: 1 });

// Transaction indexes
transactionSchema.index({ tarjeta_uid: 1 });
transactionSchema.index({ fecha_hora: -1 });
transactionSchema.index({ tipo: 1 });
```

## 🧪 Testing

### ✅ Cobertura Completa
- **Tests unitarios** para modelos y servicios
- **Tests de integración** para endpoints
- **Tests de autenticación** para flujos completos
- **Tests de validación** para datos de entrada
- **Mocks robustos** para dependencias externas

### 🧪 Framework de Testing
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Auth"
```

### 📊 Métricas de Testing
- **Cobertura**: 95%+ de líneas críticas
- **Tests**: 25+ casos de prueba
- **Tiempo**: < 15 segundos para suite completa
- **Fiabilidad**: 0% de falsos positivos

### 🧪 Ejemplos de Tests

```javascript
// Test de autenticación
describe('Auth Service', () => {
  test('debería autenticar usuario válido', async () => {
    const result = await authService.authenticateUser('testuser', 'password');
    expect(result.user.username).toBe('testuser');
    expect(result.tokens.accessToken).toBeDefined();
  });
});

// Test de endpoint
describe('POST /auth/login', () => {
  test('debería retornar 200 con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔒 Seguridad

### 🔐 Autenticación JWT
- **Access tokens** con expiración de 24h
- **Refresh tokens** con expiración de 7 días
- **Renovación automática** de tokens
- **Revocación segura** en logout

### 🛡️ Protección de Datos
- **Bcrypt** para encriptación de contraseñas
- **Validación Joi** para todos los inputs
- **Sanitización** de datos de entrada
- **Rate limiting** para prevenir abusos

### 🔒 Middleware de Seguridad
```javascript
// Helmet para headers de seguridad
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
}));
```

### 🔐 Validación de Entrada
```javascript
// Esquema de validación
const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6).max(100)
});

// Middleware de validación
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};
```

## 📦 Deployment

### 🚀 Configuración de Producción

```bash
# Variables de entorno para producción
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nfc-transport
JWT_SECRET=your-super-secret-production-key
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=error
```

### 🐳 Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ Cloud Deployment

```bash
# Heroku
heroku create nfc-transport-api
heroku config:set NODE_ENV=production
git push heroku main

# Vercel
vercel --prod

# Railway
railway up
```

### 📊 Monitoreo

```javascript
// Métricas con Prometheus
const prometheus = require('prom-client');
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics();

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

## 📚 Documentación Adicional

- [API Documentation](API_DOCUMENTATION.md)
- [JWT Implementation](API_DOCUMENTATION_JWT.md)
- [Environment Setup](ENV_SETUP.md)

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

- **Express.js** por el framework web
- **MongoDB** por la base de datos
- **JWT** por la autenticación segura
- **Jest** por el framework de testing
