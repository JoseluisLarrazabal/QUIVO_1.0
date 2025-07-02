const mongoose = require("mongoose")

// Configuración de conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/nfc_transport"
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log("✅ MongoDB Atlas conectado exitosamente")
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:", error.message)
    process.exit(1)
  }
}

// Eventos de conexión
mongoose.connection.on("connected", () => {
  console.log("Mongoose conectado a MongoDB Atlas")
})

mongoose.connection.on("error", (err) => {
  console.error("Error de conexión de Mongoose:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose desconectado de MongoDB Atlas")
})

// Manejo de cierre graceful
process.on("SIGINT", async () => {
  await mongoose.connection.close()
  console.log("Conexión de MongoDB cerrada por terminación de la aplicación")
  process.exit(0)
})

module.exports = {
  connectDB,
  mongoose,
}
