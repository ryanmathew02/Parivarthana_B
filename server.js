require('./configs/db');
const app = require('express')();
const PORT = process.env.PORT || 5000;
const UserRouter = require('./api/user');
const express = require("express");
const bodyparser = require('body-parser');

//env variables
require("dotenv").config();

//cors
const cors = require("cors");
app.use(cors());

const bodyParser = require('express').json;
//app.use(bodyParser());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded( {extended: true} ));

app.use('/user', UserRouter);

app.listen(PORT, () => {
    console.log(`server is running at port number ${PORT}`);
})