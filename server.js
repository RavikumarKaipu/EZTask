const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');  // Correct the path here
const fileRoutes = require('./routes/fileRoutes');
require('dotenv').config();  // Make sure dotenv is configured properly

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);


  

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
