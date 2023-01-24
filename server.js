require('./configs/db');
const app = require('express')();
const PORT = process.env.PORT || 5000;
const UserRouter = require('./api/USER/user');
const express = require("express");
const bodyparser = require('body-parser');
const path = require('path');

//env variables
require("dotenv").config();

//cors
const cors = require("cors");
app.use(cors());

const bodyParser = require('express').json;
//app.use(bodyParser());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded( {extended: true} ));



const passport = require('passport');
require("./configs/passport-auth")(passport);
const auth = require("./api/USER/auth");

app.use('/user', UserRouter);
app.use('/auth', auth);
app.use('/', (req, res)=>{
    res.sendFile(path.join(__dirname+"/views/homepage.html"));
})

app.listen(PORT, () => {
    console.log(`server is running at port number ${PORT}`);
})