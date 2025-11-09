import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let filter = {};

    if (category) filter.category = category;

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (size) {
      filter["sizes.size"] = size;
      filter["sizes.stock"] = { $gt: 0 };
    }

    if (color) {
      filter["colors.name"] = { $regex: color, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Create product review
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) return res.status(400).json({ message: "Product already reviewed" });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
