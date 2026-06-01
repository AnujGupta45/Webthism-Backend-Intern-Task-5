import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AppError } from "../middlewares/errorMiddleware";

// --- Categories ---

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new AppError("Category name is required", 400));
    }

    const existingCategory = await prisma.category.findUnique({ where: { name } });
    if (existingCategory) {
      return next(new AppError("Category already exists", 400));
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    res.status(201).json({
      status: "success",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// --- Products ---

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId, search, minPrice, maxPrice, sortBy, order } = req.query;

    const where: any = {};

    if (categoryId) {
      where.categoryId = String(categoryId);
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(String(minPrice));
      }
      if (maxPrice) {
        where.price.lte = parseFloat(String(maxPrice));
      }
    }

    const sortField = sortBy ? String(sortBy) : "createdAt";
    const sortOrder = order && (String(order).toLowerCase() === "asc" || String(order).toLowerCase() === "desc")
      ? String(order).toLowerCase()
      : "desc";

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        [sortField]: sortOrder
      }
    });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = id as string;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    if (!name || price === undefined || stock === undefined || !categoryId) {
      return next(
        new AppError("Please provide all required fields: name, price, stock, categoryId", 400)
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return next(new AppError("Category not found with the provided ID", 404));
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = id as string;
    const { name, description, price, stock, categoryId } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return next(new AppError("Product not found", 404));
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return next(new AppError("Category not found with the provided ID", 404));
      }
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = parseFloat(price);
    if (stock !== undefined) updatedData.stock = parseInt(stock);
    if (categoryId !== undefined) updatedData.categoryId = categoryId;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updatedData,
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(200).json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = id as string;

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return next(new AppError("Product not found", 404));
    }

    // Delete associated cart items and order items in a transaction to satisfy foreign keys
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: productId } });
      await tx.orderItem.deleteMany({ where: { productId: productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
