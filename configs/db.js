require('dotenv').config();
const mongoose = require('mongoose');

MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connected");
}).catch((err) => console.log(err));