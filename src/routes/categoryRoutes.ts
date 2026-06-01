import { Router } from "express";
import { getCategories, createCategory } from "../controllers/productController";
import { protect, restrictTo } from "../middlewares/authMiddleware";

const router = Router();

router.route("/")
  .get(getCategories)
  .post(protect, restrictTo("ADMIN"), createCategory);

export default router;
