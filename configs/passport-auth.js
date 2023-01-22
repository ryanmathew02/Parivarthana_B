const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/user");

module.exports = (passport) => {
        passport.use(new GoogleStrategy({
            clientID: process.env.Client_Id,
            clientSecret: process.env.Client_Secret,
            callbackURL: "http://localhost:5000/auth/google/redirect",
            passReqToCallback : true
          },
          async (request, accessToken, refreshToken, profile, done) => {
            try {
                let existingUser = await User.findOne({ 'google.id': profile.id });
                // if user exists return the user</em> 
                if (existingUser) {
                  return done(null, existingUser);
                }
                // if user does not exist create a new user</em> 
                console.log('Creating new user...');
                const newUser = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: 'vwohvowoiwjv',
                        dateOfBirth: "12-03-2002",
                        verified: true
                      });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
          }
        ));
    }