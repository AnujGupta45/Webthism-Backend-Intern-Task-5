import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

router.route("/")
  .get(getProducts)
  .post(protect, restrictTo("ADMIN"), createProduct);

router.route("/:id")
  .get(getProductById)
  .put(protect, restrictTo("ADMIN"), updateProduct)
  .delete(protect, restrictTo("ADMIN"), deleteProduct);

export default router;
