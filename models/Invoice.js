const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    item_name: String,
    item_qty: Number,
    item_rate: Number,
    item_discount_percentage: Number,
    item_discount_amount: Number,
    item_amount: Number
});

const invoiceSchema = new mongoose.Schema({
  client_name: String,
  date: Date,
  items: [itemSchema],
  total_amount:Number
});

const Invoice = mongoose.model('Invoice',invoiceSchema);

module.exports = Invoice;
