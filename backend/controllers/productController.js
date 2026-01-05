import mongoose from 'mongoose';
import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
	try {
		const products = await Product.find({});
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		console.error("Error fetching products:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const createProduct = async (req, res) => {
	const product = req.body; // user will send this data

	// Validate required fields
	if (!product.name || !product.price || !product.partNumber || !product.company || !product.quantity) {
		return res.status(400).json({
			success: false,
			message: "Please provide name, price, partNumber, and company",
		});
	}

	// ✅ Optional: Validate category
	if (!product.category || product.category.trim() === "") {
		product.category = "Uncategorized"; // fallback default
	}

	const newProduct = new Product(product);

	try {
		await newProduct.save();
		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error("Error creating product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const updateProduct = async (req, res) => {
	const { id } = req.params;
	const product = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product ID" });
	}

	try {
		// ✅ Ensure category stays present (avoid undefined category)
		if (!product.category || product.category.trim() === "") {
			product.category = "Uncategorized";
		}

		const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
		if (!updatedProduct) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		res.status(200).json({ success: true, data: updatedProduct });
	} catch (error) {
		console.error("Error updating product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const deleteProduct = async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(404).json({ success: false, message: "Invalid Product ID" });
	}

	try {
		const deletedProduct = await Product.findByIdAndDelete(id);
		if (!deletedProduct) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		res.status(200).json({ success: true, message: "Product deleted successfully" });
	} catch (error) {
		console.error("Error deleting product:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
