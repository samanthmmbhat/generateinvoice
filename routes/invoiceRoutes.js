const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

//Create Invoice
router.post('/', async (req, res) => {
  try {
    const { client_name, date} = req.body;
    const newInvoice = new Invoice({ client_name, date, items: [],total_amount:0});
    const savedInvoice = await newInvoice.save();
    res.json({ invoice_id: savedInvoice._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Add Invoice Item
router.post('/:invoice_id/items', async (req, res) => {
    try {
        const { invoice_id } = req.params;
        const { item_name, item_qty, item_rate, item_discount_percentage } = req.body;
    
        const invoice = await Invoice.findById(invoice_id);
    
        if (!invoice) {
          return res.status(404).json({ error: 'Invoice not found.' });
        }
    
        const item_amount = item_qty * item_rate;
        const item_discount_amount = (item_discount_percentage / 100) * item_amount;
    
        const newItem = {
          item_name,
          item_qty,
          item_rate,
          item_discount_percentage,
          item_discount_amount,
          item_amount,
        };
        invoice.items.push(newItem);
        invoice.total_amount += newItem.item_amount - newItem.item_discount_amount;
        
        const updatedInvoice = await invoice.save();
    
        res.json(updatedInvoice);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});

//Remove Invoice Item
router.delete('/:invoice_id/items/:item_id', async (req, res) => {
    try {
        const { invoice_id, item_id } = req.params;
    
        const invoice = await Invoice.findById(invoice_id);
    
        if (!invoice) {
          return res.status(404).json({ error: 'Invoice not found.' });
        }
    
        const itemIndex = invoice.items.findIndex(item => item._id.toString() === item_id);
    
        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Item not found in the invoice.' });
        }
    
        const removedItem = invoice.items.splice(itemIndex, 1)[0];
        invoice.total_amount -= removedItem.item_amount - removedItem.item_discount_amount;
    
        const updatedInvoice = await invoice.save();
    
        res.json(updatedInvoice);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});

//Fetch Invoices
router.get('/', async (req, res) => {
    try {
        const { page = 0, pagesize = 10 } = req.query;
    
        const invoices = await Invoice.find()
          .skip(page * pagesize)
          .limit(pagesize);
    
        res.json(invoices);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});

//Summary API
router.get('/summary', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        
        //const dateArray = invoices.map(invoice => invoice.date.toISOString().split('T')[0]);
        const dateArray = invoices.map(invoice => (invoice.date ? invoice.date.toISOString().split('T')[0] : null));

        const invoiceCount = invoices.length;
        const itemCount = invoices.reduce((total, invoice) => total + invoice.items.length, 0);
        const totalDiscountValue = invoices.reduce((total, invoice) =>
          total + invoice.items.reduce((itemTotal, item) => itemTotal + item.item_discount_amount, 0), 0);
        const totalAmount = invoices.reduce((total, invoice) => total + invoice.total_amount, 0);
    
        const summary = {
          date: dateArray,
          invoice_count: invoiceCount,
          item_count: itemCount,
          total_discount_value: totalDiscountValue,
          total_amount: totalAmount,
        };
    
        res.json(summary);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
});

module.exports = router;
