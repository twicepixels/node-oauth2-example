var passport = require('passport');
var User = require('../models/user');
var Token = require('../models/token');
var Client = require('../models/client');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

// var DigestStrategy = require('passport-http').DigestStrategy;
// Load required packages
// var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;


// passport.use(new ClientPasswordStrategy(
//     function(clientId, clientSecret, done) {
//         db.clients.findByClientId(clientId, function(err, client) {
//             if (err) { return done(err); }
//             if (!client) { return done(null, false); }
//             if (client.clientSecret != clientSecret) { return done(null, false); }
//             return done(null, client);
//         });
//     }
// ));

// passport.use(new DigestStrategy(
//   { algorithm: 'MD5', qop: 'auth' },
//   function(username, callback) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return callback(err); }
//
//       // No user found with that username
//       if (!user) { return callback(null, false); }
//
//       // Success
//       return callback(null, user, user.password);
//     });
//   },
//   function(params, callback) {
//     // validate nonces as necessary
//     callback(null, true);
//   }
// ));

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
    function (username, password, callback) {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return callback(err);
            }
            // No user found with that username
            if (!user) {
                return callback(null, false);
            }
            // Make sure the password is correct
            user.verifyPassword(password, function (err, isMatch) {
                if (err) {
                    return callback(err);
                }
                // Password did not match
                if (!isMatch) {
                    return callback(null, false);
                }
                // Success
                return callback(null, user);
            });
        });
    }
));

passport.use(new BasicStrategy(
    function (username, password, callback) {
        Client.findOne({id: username}, function (err, client) {
            if (err) {
                return callback(err);
            }
            // No client found with that id or bad password
            if (!client || client.secret !== password) {
                return callback(null, false);
            }
            // Success
            return callback(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function (accessToken, callback) {
        Token.findOne({value: accessToken}, function (err, token) {
            if (err) {
                return callback(err);
            }
            // No token found
            if (!token) {
                return callback(null, false);
            }
            User.findOne({_id: token.userId}, function (err, user) {
                if (err) {
                    return callback(err);
                }
                // No user found
                if (!user) {
                    return callback(null, false);
                }
                // Simple example with no scope
                callback(null, user, {scope: '*'});
            });
        });
    }
));

exports.isAuth = passport.authenticate(['basic', 'bearer'], {session: false});
exports.isBearer = passport.authenticate('bearer', {session: false});
