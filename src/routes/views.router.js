import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

const router = Router();
//home con productos
router.get("/", async (req, res) => {
  const products = await ProductModel.find().lean();
  res.render("home", { products });
});
//realtime
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});
//productos
router.get("/products", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort;
    const query = req.query.query;

    let filter = {};
    if (query) {
      const [key, value] = query.split(":");
      if (key === "category") filter = { category: value };
      if (key === "status") filter = { status: value === "true" };
    }

    let sortOption = {};
    if (sort === "asc") sortOption = { price: 1 };
    if (sort === "desc") sortOption = { price: -1 };

    const totalDocs = await ProductModel.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit) || 1;

    const currentPage = page < 1 ? 1 : page;
    const skip = (currentPage - 1) * limit;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      params.set("limit", limit);
      params.set("page", targetPage);
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      return `/products?${params.toString()}`;
    };

    res.render("index", {
      products,
      page: currentPage,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null
    });
  } catch (error) {
    res.status(500).send("Error al cargar /products");
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cart", { cart });
  } catch (error) {
    res.status(500).send("Error al cargar carrito");
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await ProductModel.findById(pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    const cartId = req.query.cartId || null;

    res.render("productDetail", { product, cartId });
  } catch (error) {
    res.status(500).send("Error al cargar detalle");
  }
});

export default router;