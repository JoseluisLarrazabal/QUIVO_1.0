const mongoose = require("mongoose")
require("dotenv").config()

const User = require("../models/User")
const Card = require("../models/Card")
const Validator = require("../models/Validator")

const seedData = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nfc_transport")
    console.log("✅ Conectado a MongoDB")

    // Limpiar datos existentes y eliminar colecciones para evitar conflictos de índices
    await mongoose.connection.dropCollection('users').catch(() => console.log("Colección users no existía"))
    await mongoose.connection.dropCollection('cards').catch(() => console.log("Colección cards no existía"))
    await mongoose.connection.dropCollection('validators').catch(() => console.log("Colección validators no existía"))
    console.log("🗑️ Colecciones eliminadas")

    // Crear usuarios de ejemplo
    const users = await User.create([
      {
        username: "juan.perez",
        password: "123456",
        nombre: "Juan Pérez",
        tipo_tarjeta: "adulto",
        telefono: "59171234567",
        email: "juan.perez@email.com"
      },
      {
        username: "maria.garcia",
        password: "123456",
        nombre: "María García",
        tipo_tarjeta: "estudiante",
        telefono: "59172345678",
        email: "maria.garcia@email.com"
      },
      {
        username: "carlos.mamani",
        password: "123456",
        nombre: "Carlos Mamani",
        tipo_tarjeta: "adulto_mayor",
        telefono: "59173456789",
        email: "carlos.mamani@email.com"
      },
      // Usuario con varias tarjetas
      {
        username: "multi.tarjetas",
        password: "123456",
        nombre: "Multi Tarjetas",
        tipo_tarjeta: "adulto",
        telefono: "59170000001",
        email: "multi.tarjetas@email.com"
      },
      // Usuario con tarjeta inactiva
      {
        username: "inactivo",
        password: "123456",
        nombre: "Usuario Inactivo",
        tipo_tarjeta: "estudiante",
        telefono: "59170000002",
        email: "inactivo@email.com"
      }
    ])

    console.log("👥 Usuarios creados:", users.length)

    // Crear tarjetas de ejemplo
    const cards = await Card.create([
      {
        uid: "A1B2C3D4",
        usuario_id: users[0]._id,
        saldo_actual: 25.00
      },
      {
        uid: "E5F6G7H8",
        usuario_id: users[1]._id,
        saldo_actual: 15.50
      },
      {
        uid: "I9J0K1L2",
        usuario_id: users[2]._id,
        saldo_actual: 30.00
      },
      // Tarjetas para usuario multi.tarjetas
      {
        uid: "MULTI1",
        usuario_id: users[3]._id,
        saldo_actual: 40.00
      },
      {
        uid: "MULTI2",
        usuario_id: users[3]._id,
        saldo_actual: 10.00
      },
      // Tarjeta inactiva para usuario inactivo
      {
        uid: "INACTIVA1",
        usuario_id: users[4]._id,
        saldo_actual: 5.00,
        activa: false
      }
    ])

    console.log("💳 Tarjetas creadas:", cards.length)

    // Crear validadores de ejemplo
    const validators = await Validator.create([
      {
        id_validador: "VAL001",
        bus_id: "BUS001",
        ubicacion: "Línea A - El Alto",
        operador: "Transporte El Alto S.A.",
        estado: "activo"
      },
      {
        id_validador: "VAL002",
        bus_id: "BUS002",
        ubicacion: "Línea B - Zona Sur",
        operador: "Micro Sur Ltda.",
        estado: "activo"
      },
      {
        id_validador: "VAL003",
        bus_id: "BUS003",
        ubicacion: "Línea C - Centro",
        operador: "Transporte Centro",
        estado: "activo"
      }
    ])

    console.log("🔧 Validadores creados:", validators.length)

    console.log("\n🎉 Datos de ejemplo creados exitosamente!")
    console.log("\n📋 Resumen:")
    console.log(`- Usuarios: ${users.length}`)
    console.log(`- Tarjetas: ${cards.length}`)
    console.log(`- Validadores: ${validators.length}`)
    
    console.log("\n🧪 Datos de prueba:")
    console.log("Tarjetas disponibles:")
    cards.forEach(card => {
      const user = users.find(u => u._id.toString() === card.usuario_id.toString())
      console.log(`- ${card.uid}: ${user ? user.nombre : 'Sin usuario'} (${user ? user.tipo_tarjeta : 'N/A'}) - ${card.saldo_actual} Bs`)
    })

    console.log("\nValidadores disponibles:")
    validators.forEach(validator => {
      console.log(`- ${validator.id_validador}: ${validator.ubicacion}`)
    })

  } catch (error) {
    console.error("❌ Error al crear datos de ejemplo:", error)
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Conexión cerrada")
    process.exit(0)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData()
}

module.exports = seedData 