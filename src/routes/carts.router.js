import { Router } from "express";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid).populate("products.product");
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

// Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const product = await ProductModel.findById(pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    // Buscar si el producto ya está en el carrito
    const index = cart.products.findIndex((item) => item.product.toString() === pid);

    if (index === -1) {
      // Si no existe, lo agregamos con quantity 1
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      // Si existe, incrementamos quantity
      cart.products[index].quantity += 1;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});


router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = cart.products.filter((item) => item.product.toString() !== pid);

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

// Actualiza los productos del carrito con un arreglo
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const products = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    cart.products = products;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
});

// Actualiza quantity del producto indicado
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const index = cart.products.findIndex((item) => item.product.toString() === pid);
    if (index === -1) return res.status(404).json({ error: "Producto no está en el carrito" });

    cart.products[index].quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar cantidad" });
  }
});

// DELETE vacia el carrito
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

export default router;