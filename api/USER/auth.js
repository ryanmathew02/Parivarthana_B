const passport = require('passport');
const router = require('express').Router();
const path = require('path');

router.get("/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
    );


// Retrieve user data using the access token received</em> 
router.get("/google/redirect",
        passport.authenticate("google", { session: false }),
        (req, res) => {
            console.log(req);
            console.log("DONE:::");

        res.redirect("/auth/home");
    }
    );


    // profile route after successful sign in</em> 
router.get("/home", (req, res) => {
        console.log(req);
        res.sendFile(path.join(__dirname,'..','views','verified.html'));
    });

module.exports = router;