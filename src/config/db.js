import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGO_URL = "mongodb://localhost:27017/";

    await mongoose.connect(MONGO_URL);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.log("Error al conectar a MongoDB:", error);
  }
};