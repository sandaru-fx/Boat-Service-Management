import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	partNumber: {
		type: String,
		required: true,
	},
	company: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: false, // ✅ not strictly required, we can default it
		default: "Uncategorized",
	},
	quantity: {
		type: Number,
		required: true,
	},
}, {
	timestamps: true, // creates createdAt, updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;
