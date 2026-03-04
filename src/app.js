import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";

import { connectDB } from "./config/db.js";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import { ProductModel } from "./models/product.model.js";

const app = express();

//Middlewares para lecutra de json y datos
app.use(express.json());
app.use (express.urlencoded({ extended: true }));

//Archivos estaticos
app.use(express.static("src/public"));

//Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set ("views", "src/views");

//Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

//Servidor
const server = http.createServer(app);

//Socket.io
const io = new Server(server);

//socket en app por si lo necesito despues
app.set("io", io);


//Conectamos con mongo
await connectDB();

//Eventos del socket
io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado", socket.id);

  // enviar lista inicial
  const products = await ProductModel.find().lean();
  socket.emit("products", products);

  socket.on("createProduct", async (productData) => {
    await ProductModel.create(productData);
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });

  socket.on("deleteProduct", async (pid) => {
    await ProductModel.findByIdAndDelete(pid);
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });
});

//Servidor corriendo en puerto 8080

server.listen(8080, () => {
    console.log("Servidor corriendo en puerto 8080");
});