import { Router } from "express";

//modelos de Mongoose para Carrito y Producto
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// nuevo carrito vacío
router.post("/", async (req, res) => {
  try {
    // se crea un carrito con el arreglo de productos vacío
    const newCart = await CartModel.create({ products: [] });

    // si responde con 201 se creo correctamente
    res.status(201).json(newCart);
  } catch (error) {
    // si ocurre un error interno del servidor
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

// obtener carrito por id
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params; // se extrae el id del carrito desde los parámetros de la ruta

    // buscamos el carrito y aplicamos populate para los datos del producto
    const cart = await CartModel.findById(cid).populate("products.product");

    // si no existe, devuelve error 404
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // si existe, lo devuelve en formato JSON
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

// agrega productos al carrito o aumenta la cantidad si ya existe
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params; // IDs de carrito y producto

    // verifica que exista el carrito
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // verifica que exista el producto
    const product = await ProductModel.findById(pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    // busca si el producto ya existe en el carrito
    const index = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (index === -1) {
      // si NO existe en el carrito → lo agregamos con quantity = 1
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      // si YA existe → incrementamos la cantidad en 1
      cart.products[index].quantity += 1;
    }

    // guardamos los cambios en la base de datos
    await cart.save();

    // respondemos con el carrito actualizado
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// método que elimina producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // buscamos el carrito
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // filtramos el arreglo eliminando el producto indicado
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid
    );

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

// método para reemplazar los productos del carrito por un nuevo arreglo
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Se espera un arreglo completo de productos en el body
    const products = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // Reemplazamos el arreglo completo de productos
    cart.products = products;

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
});

// método para actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; 

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    // buscamos el producto dentro del carrito
    const index = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );

    // si el producto no está en el carrito
    if (index === -1)
      return res.status(404).json({ error: "Producto no está en el carrito" });

    // actualizamos la cantidad
    cart.products[index].quantity = quantity;

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

// método para vaciar el carrito completamente
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = [];

    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

// exportamos el router para usarlo en app.js o server.js
export default router;