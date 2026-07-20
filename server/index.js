require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
    res.send(`NearAIIMS API is running`)
})

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
    
})
