require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI="mongodb+srv://ryan123:ryan123@servicelearning.sog9g7m.mongodb.net/loginDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connected");
}).catch((err) => console.log(err));