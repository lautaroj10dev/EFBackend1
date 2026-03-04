import { Router } from "express";

import { ProductModel } from "../models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    
    const limit = Number(req.query.limit) || 10; 
    const page = Number(req.query.page) || 1;    
    const sort = req.query.sort;                 
    const query = req.query.query;               

    let filter = {};

    if (query) {
      const [key, value] = query.split(":");

      if (key === "category") {

        filter = { category: value };
      }

      if (key === "status") {
  
        filter = { status: value === "true" };
      }
    }

   // orden de productos por precio
    let sortOption = {};
    if (sort === "asc") sortOption = { price: 1 }; 
    if (sort === "desc") sortOption = { price: -1 };

    //paginación, control de páginas y links prev/next
    const totalDocs = await ProductModel.countDocuments(filter);

    const totalPages = Math.ceil(totalDocs / limit) || 1;

    const currentPage = page < 1 ? 1 : page;

    const skip = (currentPage - 1) * limit;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);


    const hasPrevPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const prevPage = hasPrevPage ? currentPage - 1 : null;
    const nextPage = hasNextPage ? currentPage + 1 : null;


    const baseLink = "/api/products";

    // función para construir links con los mismos parámetros
    const buildLink = (targetPage) => {
      const params = new URLSearchParams();

      params.set("limit", limit);
      params.set("page", targetPage);

      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);

      return `${baseLink}?${params.toString()}`;
    };

    const prevLink = hasPrevPage ? buildLink(prevPage) : null;
    const nextLink = hasNextPage ? buildLink(nextPage) : null;

    res.json({
      status: "success",
      payload: products,  
      totalPages,
      prevPage,
      nextPage,
      page: currentPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });

  } catch (error) {
    // manejo de error interno del servidor
    res.status(500).json({
      status: "error",
      payload: [],
      error: "Error al obtener productos"
    });
  }
});

// método para obtener un producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // ID del producto

    const product = await ProductModel.findById(pid);

    // si no existe el producto
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(product);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// método para crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    } = req.body;

    // creamos el producto en la base de datos
    const newProduct = await ProductModel.create({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    });

    res.status(201).json(newProduct);

  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// método para actualizar un producto por ID
router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // actualiza el producto y devuelve el nuevo documento actualizado
    const updated = await ProductModel.findByIdAndUpdate(
      pid,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// método para eliminar un producto por ID
router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const deleted = await ProductModel.findByIdAndDelete(pid);

    if (!deleted)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto eliminado" });

  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// exportamos el router para usarlo en la aplicación principal
export default router;