//  Dependancies
var UserDAO     = require("../usersDAO"),
    SessionDAO  = require("../sessionsDAO"),
    dater       = require("../dater"),
    log         = require("../logger"),
    jwt         = require("jsonwebtoken");


//  Session handler Constructor
function SessionHandler(db) {
    "use strict";


    //  Must be called as a constructor
    if((this instanceof SessionHandler) === false) {
        return new SessionHandler(db);
    }


    //  Users CRUD
    var user    = new UserDAO(db),
    //  Sessions CRUD
        session = new SessionDAO(db);


    /**
    *   Handle user login
    *   [POST]   =>  "api/user/login"
    *           - - -
    *   Accessible for everyone
    */
    this.handleLoginRequest = function(req, res, next) {

        /*
        *   1.  Extract the user information provided
        *   2.  Try login the user
        *       =>  [warning]   user not found
        *       =>  [warning]   wrong password
        *       =>  [error]     querying database   (critical error! => [mongodb native])
        *       =>  [error]     password comparison (critical error! => [bcrypt  native])
        *   3.  Remove old session
        *   4.  Construct new session
        *   5.  Send token back to client
        */
        user.validateLogin(credentialsSupplied, validateUserLogin);

        //  Validate the information passed     OVO SAM DODAO!
        function validateLogin() {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb (resolve, reject) {

                //  Perform the validation
                user.validateLogin(credentialsSupplied, validateLogin_cb);


                //  Validate Login callback
                function validateLogin_cb(error, warning, user) {

                    //  [Error]
                    if(error) {
                        //  Error querying the database || Error comparing passwords
                        return reject(error);
                    }

                    //  [Warning]
                    if(warning) {
                        //  Invalid username || password
                        return resolve({
                            warning :    warning
                        });
                    }

                    //  User credentials correct
                    if(!error && !warning && user) {
                        return resolve({
                            user    :   user
                        });
                    }

                    /*
                    *   1. Pass the user ID as a query
                    *   2. Delete the session from the database
                    *       - removed.code      === 200 [OK]    =>  return null
                    *       - notRemoved.code   !== 200 [BAD]   =>  return new Error()
                    */
                    session.removeExpiredSession(null, userObj._id, removeExpiredSession_callback);

                }

            }

        }


        // Extract the information from the request body (submitedd via the login form)
        var credentialsSupplied =   {
            username    :   req.body.username,
            password    :   req.body.password
        },
        // Hold the user object if successfuly logged in
            loggedUser;


        // startSession callback (send cookie back to client)
        function startNewSession(err, sessionObject) {

            // Critical error (error inserting session document into database)
            if(err) {
                // Call the error handling middleware
                return next(err);
            /* No errors === session document successfuly inserted into db */
            }

            // Create a JWT (for authenticating the user)
            var JWTtoken = jwt.sign({username_id: sessionObject.user.username_id}, process.env.JWT_SECRET, {
                expiresIn:    3600              // seconds (3600 = 1hour)
            });
            // Construct a response
            var responseObj = {
                user : {
                    username_id         : sessionObject.user.username_id,
                    token               : JWTtoken,
                    sessionExpiration   : (new Date(Date.now() + 6*60*60*1000)).getTime(),
                    errorMessage        : null
                }
            };

            // Send back the response containing
            res.status(200)
                // Send user object back to client application
                .json(responseObj);

        }


        // removeExpiredSession method callback (remove expired session)
        function removeExpiredSession_callback(err) {

            // Critical error (error removing session document from the database)
            if(err) {
                // Handle the error
                return next(err);
            /* No errors === session document successfuly removed from the db */
            }

            // Start a new session for the user
            session.startSession(
                    loggedUser._id,
                    loggedUser.name.first,
                    loggedUser.name.last,
                    loggedUser.isAdmin,
                    startNewSession
                );

        }



    };


    // Cookies validation (is user logged in?)              - [MIDDLEWARE]
    this.isLoggedIn = function(req, res, next) {


        // Get the JSON Web Token send along with the request
        var JWTtoken_supplied = req.headers['x-access-token'];


        // getUsername callback (retrieve the logged user object)
        function checkIfSessionExists(err, sessionObj) {

            // Error getting the user object
            if (err) {
                // Cookie injection attack || "session" collection cleared (no matching document in 'sessions' collection for the sessionID[cookie] provided)
                if(err.sessionNotFound) {
                    // Send the response object back to client
                    return res
                        .status(401)
                        .json({
                            user            : null,
                            errorMessage    : err.message
                        });
                /* Error querying the session database [native] */
                }
                // Handle the error
                return next(err);
            /* Else no errors */
            }

            // User is logged in (cookie exists on the client side && is valid)
            if(sessionObj && !err) {
                // Proceed to the next chain in handling the login request
                return next();
            }

        }


        // User NOT logged in (no token supplied)
        if(!JWTtoken_supplied) {
            // Send the user back to the login
            return res
                    .status(401)
                    .json({
                        errorMessage    : "Molimo Vas prvo pristupite Vašem nalogu kako biste pristupili ovoj stranici.",
                        sessionExpired  : true,
                        user            : null,
                        token           : null
                    });
        /* Session exists on the request object - user logged in */
        }


        // Verify the user, by extracting the jwt provided
        jwt.verify(JWTtoken_supplied, process.env.JWT_SECRET, function(err, decoded) {

            // Error authenticating the user
            if(err) {
                // Token expired
                if(err.message === 'jwt expired') {
                    // Send the response back to user
                    return res
                                .status(401)
                                .json({
                                    errorMessage : "Vaša sesija je istekla! Molimo Vas pristupite Vašem nalogu kako biste pristupili ovoj stranici.",
                                    user         : null,
                                    token        : null
                                });
                }
                // Token injection (invalid token)
                if(err.message === 'invalid token') {
                    // Send the
                    return res
                                .status(401)
                                .json({
                                    errorMessage : "Molimo pristupite Vašem korisničkom nalogu, kako biste pristupili ovoj stranici.",
                                    user         : null,
                                    token        : null
                                });
                }

                // Other type of error (???)
                return next(err);

            /* Use successfuly validated */
            }

            /*
            *   1. Get the cookie from the request
            *       - cookie            === null    =>  send clien to login
            *       - cookie.expired    === true    =>  send clien to login
            *       - cookie.notValid   === true    =>  send clien to login
            *       - cookie.valid      === true    =>  proceed to the next route in chain
            */
            session.validateSession(jwt.decode(JWTtoken_supplied).username_id, checkIfSessionExists);
            // return next();

        });

    };


}


// Export the module
module.exports = SessionHandler;
