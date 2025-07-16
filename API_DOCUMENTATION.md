# API Documentation - Sistema NFC Transporte Público

## Base URL
```
http://localhost:3000/api
```

## Autenticación

La API soporta dos métodos de autenticación:
1. **Credenciales tradicionales** (username/password)
2. **UID de tarjeta** (acceso directo con tarjeta NFC)

## Endpoints

### 1. Autenticación

#### POST /auth/login
Autenticar usuario con credenciales tradicionales.

**Request:**
```json
{
  "username": "juan.perez",
  "password": "123456"
}
```

**Response:**
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
    "cards": [
      {
        "uid": "A1B2C3D4",
        "saldo_actual": 25.00,
        "alias": "Mi Tarjeta Principal",
        "activa": true
      }
    ]
  }
}
```

#### POST /auth/register
Registrar nuevo usuario.

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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "username": "nuevo.usuario",
      "nombre": "Nuevo Usuario",
      "tipo_tarjeta": "adulto"
    }
  }
}
```

#### POST /auth/login-card
Autenticar usuario con UID de tarjeta.

**Request:**
```json
{
  "uid": "A1B2C3D4"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "A1B2C3D4",
    "nombre": "Juan Pérez",
    "tipo_tarjeta": "adulto",
    "saldo_actual": 25.00
  }
}
```

### 2. Tarjetas

#### GET /saldo/:uid
Obtener información de saldo de una tarjeta.

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "A1B2C3D4",
    "nombre": "Juan Pérez",
    "tipo_tarjeta": "adulto",
    "saldo_actual": 25.00,
    "fecha_creacion": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /tarjetas
Crear nueva tarjeta con usuario.

**Request:**
```json
{
  "uid": "NEW123",
  "nombre": "Nuevo Usuario",
  "tipo_tarjeta": "adulto",
  "telefono": "70123456",
  "email": "usuario@email.com",
  "saldo_inicial": 10.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439013",
      "nombre": "Nuevo Usuario",
      "tipo_tarjeta": "adulto"
    },
    "tarjeta": {
      "uid": "NEW123",
      "saldo_actual": 10.00,
      "activa": true
    }
  }
}
```

#### GET /usuario/:userId/tarjetas
Obtener todas las tarjetas de un usuario.

**Response:**
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

**Request:**
```json
{
  "uid": "NEW456",
  "alias": "Tarjeta de Trabajo",
  "tipo_tarjeta": "adulto",
  "saldo_inicial": 15.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "NEW456",
    "usuario_id": "507f1f77bcf86cd799439011",
    "alias": "Tarjeta de Trabajo",
    "saldo_actual": 15.00,
    "activa": true
  }
}
```

#### DELETE /tarjetas/:uid
Eliminar (desactivar) una tarjeta.

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "A1B2C3D4",
    "activa": false
  }
}
```

#### PATCH /tarjetas/:uid
Actualizar alias de una tarjeta.

**Request:**
```json
{
  "alias": "Nuevo Alias"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "A1B2C3D4",
    "alias": "Nuevo Alias",
    "saldo_actual": 25.00,
    "activa": true
  }
}
```

#### GET /tarjetas
Listar todas las tarjetas (admin).

**Query Parameters:**
- `limit`: Número de tarjetas (default: 50)
- `offset`: Offset para paginación (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "uid": "A1B2C3D4",
      "saldo_actual": 25.00,
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "usuario": {
        "nombre": "Juan Pérez",
        "tipo_tarjeta": "adulto"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

### 3. Transacciones

#### GET /historial/:uid
Obtener historial de transacciones.

**Query Parameters:**
- `limit`: Número de transacciones (default: 50)
- `offset`: Offset para paginación (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tarjeta_uid": "A1B2C3D4",
      "monto": -2.50,
      "tipo": "viaje",
      "ubicacion": "Línea A - El Alto",
      "fecha_hora": "2024-01-15T08:30:00Z",
      "resultado": "exitoso"
    },
    {
      "id": 2,
      "tarjeta_uid": "A1B2C3D4",
      "monto": 20.00,
      "tipo": "recarga",
      "ubicacion": "Punto de Recarga Centro",
      "fecha_hora": "2024-01-15T07:00:00Z",
      "resultado": "exitoso"
    }
  ]
}
```

#### POST /recargar
Recargar saldo de tarjeta.

**Request:**
```json
{
  "uid": "A1B2C3D4",
  "monto": 20.00,
  "metodo_pago": "efectivo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recarga exitosa",
  "data": {
    "nuevo_saldo": 45.00,
    "transaccion": {
      "id": 3,
      "tarjeta_uid": "A1B2C3D4",
      "monto": 20.00,
      "tipo": "recarga",
      "resultado": "exitoso"
    }
  }
}
```

### 4. Validadores

#### POST /validar
Validar tarjeta en bus (descontar pasaje).

**Request:**
```json
{
  "uid": "A1B2C3D4",
  "validador_id": "VAL001"
}
```

**Response:**
```json
{
  "success": true,
  "saldo_anterior": 25.00,
  "saldo_actual": 22.50,
  "tarifa": 2.50,
  "usuario": {
    "nombre": "Juan Pérez",
    "tipo": "adulto"
  }
}
```

#### GET /validadores
Listar todos los validadores.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_validador": "VAL001",
      "ubicacion": "Línea A - El Alto",
      "activo": true,
      "fecha_instalacion": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /validadores
Crear nuevo validador.

**Request:**
```json
{
  "id_validador": "VAL004",
  "ubicacion": "Línea D - Zona Sur",
  "activo": true
}
```

#### PUT /validadores/:id/estado
Actualizar estado de validador.

**Request:**
```json
{
  "activo": false
}
```

### 5. Administración

#### GET /admin/dashboard
Obtener estadísticas del sistema.

#### GET /admin/reportes
Generar reportes por fecha.

**Query Parameters:**
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `fecha_fin`: Fecha de fin (YYYY-MM-DD)

## Códigos de Error

- `400`: Bad Request - Datos inválidos
- `401`: Unauthorized - No autenticado
- `403`: Forbidden - Sin permisos
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Recurso duplicado
- `429`: Too Many Requests - Rate limit excedido
- `500`: Internal Server Error - Error del servidor

## Tarifas por Tipo de Usuario

- **Adulto**: 2.50 Bs
- **Estudiante**: 1.00 Bs
- **Adulto Mayor**: 1.50 Bs

## Métodos de Pago

- **efectivo**: Pago en efectivo
- **qr**: QR Bancario
- **tigo_money**: Tigo Money

## Validaciones

### Tarjetas
- UID único y obligatorio
- Alias máximo 50 caracteres
- Saldo no puede ser negativo
- Usuario debe existir

### Usuarios
- Username único y obligatorio
- Password mínimo 6 caracteres
- Tipo de tarjeta válido
- Email opcional pero válido si se proporciona

### Transacciones
- UID de tarjeta válido
- Monto mayor a 0 para recargas
- Saldo suficiente para viajes
- Validador activo para validaciones
