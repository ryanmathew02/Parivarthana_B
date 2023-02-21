const e = require('express');
//const { estimatedDocumentCount } = require('../models/user');

const router = require('express').Router();

//mongoDB user module
const userModule = require("./../../models/user");


//mongoDB user Verification module
const UserVerification = require("./../../models/UserVerification");


// Password handler
const bcrypt = require('bcrypt');

// email handler
const nodemailer = require("nodemailer");

// unique string
const {v4: uuidv4} = require("uuid");

// env variable
require("dotenv").config();


//path for static verified page
const path = require("path");
const user = require('../../models/user');


// nodemailer transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})


// testing transporter 
transporter.verify((error, success) => {
    if(error) {
        console.log(error);
    } else {
        console.log("ready for messages");
        console.log(success);

    }
})


//send verfications
const sendVerificationEmail = ({_id, email}, res) => {
    console.log("SendVerfication function:");
    console.log("Unique ID "+_id);
    console.log("Email "+email);
    
    //url to be used after hosting
    const currentUrl = "http://localhost:5000/";
    
    const uniqueString = uuidv4() + _id;
    console.log("Unique String " + uniqueString);

    //mail option
    const mailOption = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your Email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This Link <b>expires in 6 hours</b>.</p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed.</p>`
    }

    // hash the uniqueString
    const saltRounds = 10;
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            //set values in userVerification collection

            const newVerification = new UserVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000
            });

            newVerification
                .save()
                .then( () => {
                    transporter
                        .sendMail(mailOption)
                        .then( () => {
                            // email has been sent and verification record saved
                            res.status(200).json({
                                status: "Pending",
                                message: "Verification Mail sent"
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Verification email failed"
                            });
                        })
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Couldn't save Verification email data"
                    });
                })

        })
        .catch( () => {
            res.json({
                status: "FAILED",
                message: "An error occured while hashing email details"
            });
        })
}

// verify email
router.get("/verify/:Id/:uniqueString", (req, res) => {

    const Id = req.params.Id;
    const uniqueString = req.params.uniqueString;
    console.log("_id in users collections: " + Id);
    console.log("uniqueString: " + uniqueString);
    UserVerification
        .find({Id})
        .then( (result) => {
            console.log("Result to find(verify) " + result);
            if(result) {
                // user verification record exist so we proceed
                const expiresAt = result[0].expiresAt;
                const hashedUniqueString = result[0].uniqueString;

                //checking for expired unique string
                if(expiresAt < Date.now()){
                    // record has been expired so we delete
                    UserVerification
                        .deleteOne({Id})
                        .then( result => {
                            user
                                .deleteOne({_id: Id})
                                .then( () => {
                                    let message = "Link has expired. Please sign up again";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                                .catch( error => {
                                    let message = "Clearing user with expired ubique string failed";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                        })
                        .catch((error) => {
                            let message = "An error occured while clearing expired user verification";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                } else {
                    //valid record exist so we validate the user string
                    // first compare the hashed value of unique string
                    bcrypt.compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if(result) {
                                // string  matches
                                user.updateOne({_id: Id}, {verified: true})
                                .then(() => {
                                    UserVerification.deleteOne({Id})
                                    .then(() => {
                                        res.sendFile(path.join(__dirname, "./../../views/verified.html"));
                                    })
                                    .catch(error => {
                                        let message = "An error occured while finalizing successful verification";
                                        res.redirect(`/user/verified/error=true&message=${message}`);
                                    })
                                })
                                .catch(error => {
                                    let message = "An error occured while updating the user verified true";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })

                            } else {
                                // existing record but incorrect verification details passed.
                                let message = "Invalid Verification details passed. check your inbox";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            }
                        })
                        .catch( error => {
                            let message = "An error occured while comparing the unique string";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                }


            } else {
                // user verification record doesn't exist
                let message = "Account record doesn;t exist or has been verifed already. please sign up or login in.";
                res.redirect(`/user/verified/error=true&message=${message}`);   
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for the existing user verification record";
            res.redirect(`/user/verified/error=true&message=${message}`);
        })

})


//verfication page route
router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../../views/verified.html"));
})


// Signup
router.post('/signup', (req, res) => {
    //let {name, email, password, dateOfBirth} = req.body;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const dateOfBirth = "12-01-2001";
    console.log(name,email,password,dateOfBirth);

    if(name == "" || email == "" || password == "" || dateOfBirth == ""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if(!/^[a-zA-Z ]*$/.test(name)){
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
                console.log("Unique email");

                //password handling (we use the bcrypt to hash the plane password)
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new userModule({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,
                        verified: false
                    });

                    newUser.save().then(result => {
                        // handle email Verifications
                        console.log(result);
                        sendVerificationEmail(result, res);
                        console.log("CHECKING RETURN FROM FUNCTION");
                        res.json({
                            status: "SUCCESS",
                            message: "Mail send"
                        })

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
                // user exist


                // check if user is verified
                if(!data[0].verified){
                    res.json({
                        status: "FAILED",
                        message: "User has not been verified"
                    });
                } else {
                    
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

                }        
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

router.post("/signIn-google", (req, res) => {
    
    let {name,email} = req.body;
    name = name.trim();
    email = email.trim();
    console.log(name);
    console.log(email);

    if(email == "" || name == ""){
        console.log("CHECK12");
        res.json({
            status: "FAILED",
            message: "Empty fields!!"
        });
    } else {
        console.log("Checking 1");
        userModule.findOne({email}, function(err, result){
            console.log(result);
            if(err){
                console.log("Checking 2");
                res.json({
                    status: "FAILED",
                    message: "error while find user"
                })
            } else if( result == null || !result ){
                console.log("Checking 3");
                const saltRounds = 10;
                bcrypt.hash("Hello-world", saltRounds).then(hashedPassword => {
                    const newUser = new userModule({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth: "01-01-2001",
                        verified: true
                    })
                    
                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "new user registered",
                        })
                    })
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "error while registering account"
                    })
                })
            } else {
                res.json({
                    status: "SUCCESS",
                    message: "Already a user"
                })
            }
        })
    }

})

module.exports = router;