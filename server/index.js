require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
    res.send(`NearAIIMS API is running`)
})

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
    
})
