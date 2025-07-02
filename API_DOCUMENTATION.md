# API Documentation - Sistema NFC Transporte Público

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Endpoints

### 1. Autenticación

#### POST /auth/login
Autenticar usuario con UID de tarjeta.

**Request:**
\`\`\`json
{
  "uid": "A1B2C3D4"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "uid": "A1B2C3D4",
    "nombre": "Juan Pérez",
    "tipo_tarjeta": "adulto",
    "saldo_actual": 25.00
  }
}
\`\`\`

### 2. Tarjetas

#### GET /saldo/:uid
Obtener información de saldo de una tarjeta.

**Response:**
\`\`\`json
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
\`\`\`

#### POST /tarjetas
Crear nueva tarjeta.

**Request:**
\`\`\`json
{
  "uid": "NEW123",
  "nombre": "Nuevo Usuario",
  "tipo_tarjeta": "adulto",
  "telefono": "70123456",
  "email": "usuario@email.com",
  "saldo_inicial": 10.00
}
\`\`\`

### 3. Transacciones

#### GET /historial/:uid
Obtener historial de transacciones.

**Query Parameters:**
- `limit`: Número de transacciones (default: 50)
- `offset`: Offset para paginación (default: 0)

**Response:**
\`\`\`json
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
    }
  ]
}
\`\`\`

#### POST /recargar
Recargar saldo de tarjeta.

**Request:**
\`\`\`json
{
  "uid": "A1B2C3D4",
  "monto": 20.00,
  "metodo_pago": "efectivo"
}
\`\`\`

### 4. Validadores

#### POST /validar
Validar tarjeta en bus (descontar pasaje).

**Request:**
\`\`\`json
{
  "uid": "A1B2C3D4",
  "validador_id": "VAL001"
}
\`\`\`

**Response:**
\`\`\`json
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
\`\`\`

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
- `404`: Not Found - Recurso no encontrado
- `429`: Too Many Requests - Rate limit excedido
- `500`: Internal Server Error - Error del servidor

## Tarifas por Tipo de Usuario

- **Adulto**: 2.50 Bs
- **Estudiante**: 1.00 Bs
- **Adulto Mayor**: 1.50 Bs
\`\`\`

README con instrucciones de instalación:
