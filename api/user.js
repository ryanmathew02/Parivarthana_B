const e = require('express');
const { estimatedDocumentCount } = require('../models/user');

const router = require('express').Router();

const userModule = require("./../models/user");


// Password handler
const bcrypt = require('bcrypt');


// Signup
router.post('/signup', (req, res) => {
    let {name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if(name == "" || email == "" || password == "" || dateOfBirth == ""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if(!/^[a-zA-Z]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid Name enterred"
        });
    } else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email enterred"
        });
    } else if (!new Date(dateOfBirth).getTime()){
        res.json({
            status: "FAILED",
            message: "Invalid date of birth enterred"
        });
    } else if (password.lenght < 8 ){
        res.json({
            status: "FAILED",
            message: "Invalid... password to small(need > 8)"
        });
    } else{
        // checking if the email is already used or not
        userModule.find({email}).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User with this mail already exist"
                });
            } else {
                // try to create a new user


                //password handling (we use the bcrypt to hash the plane password)
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new userModule({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "Success",
                            message: "Signup Successfull",
                            date: result,
                        });
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "Error while save the user account"
                        });
                    })

                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password"
                    });
                })
            }

        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user!"
            });
        })
    }
})

//signin
router.post("/signin", (req, res) => {

    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();
    console.log(email);
    console.log(password);

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty fields!!"
        });
    }else {
        //check if the email user exist
        userModule.find({email}).then(data => {
            if(data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        //password correct(matched)
                        res.json({
                            status: "Success",
                            message: "Signin Successfull!",
                            data: data
                        });
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid Password"
                        });
                    }
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred comparing passwords!"
                    });
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid crendiatials(no match for emails)"
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            });
        })
    }
})

module.exports = router;