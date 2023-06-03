const mongoose = require('mongoose');
const Schema  = mongoose.Schema;


const ProductSchema = new Schema({
    name: String,
    images: [String],
    inStock: Boolean,
    des: String,
    cost: Number,
    // category: String
});

const product = mongoose.model('products', ProductSchema);

module.exports = product;