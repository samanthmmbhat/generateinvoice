const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
//portNumber
const port = 3000;

app.use(bodyParser.json());

// MongoDB connection 
mongoose.connect('mongodb://localhost:27017/invoiceGen', { useNewUrlParser: true, useUnifiedTopology: true });

//Routes
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
