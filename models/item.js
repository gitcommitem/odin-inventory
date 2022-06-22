var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var itemSchema = new Schema({
  productname: { type: String, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imgsrc: { type: String },
  imgalt: { type: String, default: 'No image' }
});

module.exports = mongoose.model('Item', itemSchema);
