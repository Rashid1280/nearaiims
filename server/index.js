require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const propertyRoutes = require('./routes/propertyRoutes');
const path = require('path');
const bookingRoutes = require('./routes/bookingRoutes')
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // only for front end requests
  credentials: true, // allow cookies to be sent with requests
}));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
    res.send(`NearAIIMS API is running`)
})

// error handler is always placed in last after every route
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
    
})
