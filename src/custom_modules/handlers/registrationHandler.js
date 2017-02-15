// Require the dependancie modules
var UsersDAO    = require("../usersDAO"),
    dater       = require("../dater"),
    log         = require("../logger");


// Define a Constructor
function RegistrationHandler(db) {

    // Use JavaScript in the strict mode
    "use strict";


    // Check if the Constructor is called improperly without "new" keyword
    if((this instanceof RegistrationHandler) === false) {
        // Return the new instance of Constructor
        return new RegistrationHandler(db);
    }


    // Construct Data Access Object, for handling Content(Article) CRUD operations
    var users = new UsersDAO(db);


    // Inser new user to the database => ("/api/users/register")    -   [HTTP POST Method]
    this.registerUser   = function(req, res, next) {

        // Extract the information from the request body (submitedd via the register form)
            /*  Containing fileds:
            *       - firstName
            *       - lastName
            *       - username
            *       - password
            */
        var user = {
            _id     : req.body.username,
            password: req.body.password,
            name    : {
                first   : req.body.firstName,
                last    : req.body.lastName
            }
        };


        /* Critical error (error inserting user into database)
        *   -   error hashing the password      [native]
        *   -   error inserting the document    [native]
        */
        function addUser_callback(err, userRegistered) {

            // Error validating the user data
            if(err) {
                /* User with that userame already exists (err.code === 11000 [duplicate key error]) */
                if(err.userAlreadyExist) {
                    // Send the response object back to client
                    return res
                        .status(401)
                        .json({
                            user         : null,
                            errorMessage : err.message
                        });
                /* Error (hashing the password || inserting the user into database) [native] */
                } else {
                    // Pass the error object to error handling middleware
                    return next(err);
                }
            /* User successfuly created in */
            }

            // Proceed with the login
            return next();

        }

        // Add a new user to the database
        users.addUser(
            user._id,
            user.name.first,
            user.name.last,
            user.password,
            addUser_callback
        );

    };


}


// Export the module
module.exports = RegistrationHandler;
