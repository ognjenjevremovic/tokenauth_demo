//  Dependancies
var bcrypt = require("bcrypt-nodejs"),
    dater  = require("../dater");


//  User Data Access Object Constructor
function UserDAO(db) {
    "use strict";


    //  Must be called as a constructor
    if((this instanceof UserDAO) === false) {
        return new UserDAO(db);
    }


    //  "users" database collection
    var usersCollection = db.collection("users");


    /**
    *   Add user
    *       -   -   -
    *   1.  Return promise
    *   2.  Insert into database
    *   3.  Resolve/reject Promise (warning && user || error)
    *       =>  user found                      == resolve(null, user)
    *       =>  username already taken          == resolve(usernameTaken, null)
    *       =>  error inserting into database   == reject(Error)
    *
    */
    this.add    = function(user, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Insert into database
            usersCollection
                .insertOne(user)
                .then(insertUser_cb);


            //  Insert callback
            function insertUser_cb(notInserted, inserted) {

                //  User not inserted
                if(notInserted) {
                    switch (notInserted.code) {

                        //  [Warning]   -   username already taken
                        case 11000:
                            var usernameTaken   =   {
                                message     :   "Username " + username_id + " is already taken. Please choose a different username."
                            };
                            //  3. Resolve the promise with a warning
                            return resolve({
                                warning :   usernameTaken,
                                user    :   null
                            });

                        //  [Error]     -   mongodb native
                        default:
                            var databaseInsertError =   {
                                message :   "There was an error inserting the user into database!",
                                trace   :   "Line 34, file: " + __filename,
                                time    :   dater(Date.now()).now
                            };
                            //  3. Reject the promise
                            return reject(databaseInsertError);

                    }

                }

                //  User inserted
                if(!notInserted && (inserted.result.ok === 1)) {
                    //  User document inserted
                    var userInserted        =   {};
                    userInserted.username   =   inserted.ops[0]._id;
                    //  3. Resolve the promise with a user
                    return resolve({
                        warning :   null,
                        user    :   userInserted
                    });
                }

            }

        });

    };

    /**
    *   Get user
    *       -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && user || error)
    *       =>  user found                  == resolve(null, user)
    *       =>  user not found              == resolve(userNotFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.get    = function(query, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Query the database
            usersCollection
                .findOne(query)
                .then(findUser_cb);


            //  Find user callback
            function findUser_cb(error, userFound) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  =   {
                        message :   "There was an error querying the database!",
                        trace   :   "Line 93, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!userFound) {
                    //  User not found
                    var userNotFound    =   {
                        message         :   "User " + query._id + " does not exist!"
                    };
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   userNotFound,
                        user    :   null
                    });
                }

                //  User found
                if(!error && userFound) {
                    //  User object to return
                    var user    =   {};
                    user.username   =   userFound._id;
                    user.password   =   userFound.password;
                    //  3. Resolve the promise with a user
                    return resolve({
                        warning :   null,
                        user    :   user
                    });
                }

            }

        });

    };


    //  Add new user
    this.addUser        = function(credentialsSupplied, callback) {

        /*
        *   1.  Generate hash
        *   2.  Encrypt the password provided
        *   3.  Construct a new user object
        *   4.  Store the user object into database
        *   5.  Run the callback with appropriate parameter (error || warning || user)
        *       =>  user successfuly inserted   == callback(null, null, userInserted)
        *       =>  username already taken      == callback(null, usernameTaken, null)
        *       =>  error inserting the user    == callback(errorInserting, null, null)
        *
        *       if the user was successfuly inserted the callback function will be provided with the user inserted
        *       else, either error or warning will be passed to callback
        *
        */
        generateSalt()
            .then(hashPassword)
            .then(constructUser)
            .then(insertUser)
            .then(exit)
            .catch(exception);

        ////////

        //  User Constructor
        function User(params) {
            this._id        =   params.username;
            this.password   =   params.password;
            this.name       =   params.name;
            this.admin      =   params.admin;
        }


        //  Generate the salt
        function generateSalt() {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  Number of rounds
                var roundsNo    =   10;     // default  = 10
                //  Generate salt
                bcrypt.generateSalt(roundsNo, generateSalt_cb);


                //  Salt generation callback
                function generateSalt_cb(error, salt) {

                    //  [Error]
                    if(error) {
                        //  Error generating salt (native)
                        var generateSaltError   = {
                            message :   "There was an error generating the salt!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateSaltError);
                    }

                    //  Salt generated
                    if(!error && salt) {
                        //  Resolve the Promise with salt
                        return resolve(salt);
                    }

                }

            }

        }

        //  Hash the password
        function hashPassword(salt) {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  Hash the password
                bcrypt.hash(credentialsSupplied.plainPassword, salt, hashPassword_cb);


                //  Password hashing callback
                function hashPassword_cb(error, hashedPassword) {

                    //  [Error]
                    if(error) {
                        //  Error hashing password (native)
                        var generateHashError   = {
                            message :   "There was an error hashing the password!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateHashError);
                    }

                    //  Password hashed
                    if(!error && hashedPassword) {
                        //  Resolve the promise with hash
                        return resolve(hashedPassword);
                    }

                }

            }

        }

        //  Construct user object
        function constructUser(hashedPassword) {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve) {

                //  Attach a hash
                delete credentialsSupplied.plainPassword;
                credentialsSupplied.password    =   hashedPassword;
                //  Resolve the Promise with user object
                var user    =   new User(credentialsSupplied);
                return resolve(user);

            }

        }

        //  Insert user into database
        function insertUser(user) {

            //  Returns Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  Insert the user into database
                usersCollection.insertOne(user, insertUser_cb);


                //  Insert user callback
                function insertUser_cb(error, result) {

                    //  [Error]
                    if(error) {
                        //  Username taken
                        if(error.code === 11000) {
                            var usernameTakenWarning    =   {
                                message         :   "User " + username_id + " already exists! Please choose a different username.",
                                usernameTaken   :   true
                            };
                            //  Return warning
                            return resolve({
                                warning :   usernameTakenWarning
                            });
                        }
                        //  Error inserting user (native)
                        var databaseInsertError =   {
                            message :   "There was an error inserting the user into database!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(databaseInsertError);
                    }

                    //  User inserted
                    var inserted    =   result.ops[0];
                    delete inserted.password;
                    if(!error && inserted) {
                        resolve({
                            user    :   inserted
                        });
                    }

                }

            }

        }

        //  Run the callback with user || warning
        function exit(params) {
            return callback(null, params.warning || null, params.user || null);
        }

        //  Catch the exception
        function exception(error) {
            return callback(error, null, null);
        }

    };

    //  Authenticate user
    this.authenticate   = function(credentialsSupplied, callback) {

        /*
        *   1.  Construct the query
        *   2.  Query the database with the credentials
        *   3.  Generate salt
        *   4.  Hash the password provided
        *   5.  Compare the passwords
        *   6.  Run the callback function providing the appropriate parameter (error || warning || user)
        *       =>  user successfuly inserted   == callback(null, null, userInserted)
        *       =>  username already taken      == callback(null, usernameTaken, null)
        *       =>  error inserting the user    == callback(errorInserting, null, null)
        *
        *       if the user was successfuly validated the callback function will be provided with the user
        *       else, either error or warning will be passed to callback
        *
        */
        constructQuery()
            .then(findUser)
            .then(generateSalt)
            .then(hashPassword)
            .then(comparePasswords)
            .then(exit)
            .catch(exception);

        ////////

        //  Construct the query document
        function constructQuery() {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve) {

                //  Construct the query
                var query   =   {};
                query._id   =   credentialsSupplied.username;
                return resolve(query);

            }

        }

        //  Query the database
        function findUser(query) {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  Query the database
                usersCollection.findOne(query, findUser_cb);


                //  Find user callback
                function findUser_cb(error, userFound) {

                    //  [Error]
                    if(error) {
                        //  Error generating salt (native)
                        var databaseQueryError  =   {
                            message :   "There was an error querying the database!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(databaseQueryError);
                    }

                    //  [Warning]
                    if(!userFound) {
                        //  User not found
                        var userNotFound    =   {
                            message :   "User " + query._id + " does not exist!",
                            user    :   null
                        };
                        //  Return warning
                        return resolve({
                            warning :   userNotFound
                        });
                    }

                    //  User found
                    if(!error && userFound) {
                        //  Resolve the promise with user
                        return resolve({
                            user    :   userFound
                        });
                    }

                }

            }

        }

        //  Generate the salt
        function generateSalt(params) {

            //  Store the parameters
            var userNotFound    =   params.warning  ||  null,
                user            =   params.user     ||  null;

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if(userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }


                //  Number of rounds
                var roundsNo    =   10;     // default  = 10
                //  Generate salt
                bcrypt.generateSalt(roundsNo, generateSalt_cb);


                //  Salt generation callback
                function generateSalt_cb(error, salt) {

                    //  [Error]
                    if(error) {
                        //  Error generating salt (native)
                        var generateSaltError   = {
                            message :   "There was an error generating the salt!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateSaltError);
                    }

                    //  Salt generated
                    if(!error && salt) {
                        //  Resolve the Promise with salt
                        return resolve({
                            salt    :   salt,
                            user    :   user
                        });
                    }

                }

            }

        }

        //  Hash the password
        function hashPassword(params) {

            //  Store the parameters
            var userNotFound    =   params.warning  ||  null,
                user            =   params.user     ||  null,
                salt            =   params.salt     ||  null;

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if (userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }


                //  Hash the password
                bcrypt.hash(credentialsSupplied.plainPassword, salt, hashPassword_cb);


                //  Password hashing callback
                function hashPassword_cb(error, hashedPassword) {

                    //  [Error]
                    if(error) {
                        //  Error hashing password (native)
                        var generateHashError   = {
                            message :   "There was an error hashing the password!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateHashError);
                    }

                    //  Password hashed
                    if(!error && hashedPassword) {
                        //  Resolve the promise with hash
                        return resolve({
                            user        :   user,
                            password    :   hashedPassword
                        });
                    }

                }

            }

        }

        //  Compare passwords
        function comparePasswords(params) {

            //  Store the parameters
            var userNotFound    =   params.warning      ||  null,
                user            =   params.user         ||  null,
                password        =   params.password     ||  null;


            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if (userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }

                //  [Warning]
                if(user.password !== password) {
                    //  Passwords don't match
                    var incorrectPassword   =   {
                        message :   "Incorrect password!",
                        user    :   null
                    };
                    //  Return warning
                    return resolve({
                        warning :   incorrectPassword
                    });
                }

                //  Passwords match
                if(user.password === password) {
                    //  Return user
                    delete user.password;
                    return resolve({
                        user    :   user
                    });
                }

            }

        }

        //  Run the callback with user || warning
        function exit(params) {
            return callback(null, params.warning || null, params.user || null);
        }

        //  Catch the exception
        function exception(error) {
            return callback(error, null, null);
        }

    };

    //  Authorize user
    this.authenticate   = function(credentialsSupplied, callback) {

        /*
        *   1.  Construct the query
        *   2.  Query the database with the credentials
        *   3.  Generate salt
        *   4.  Hash the password provided
        *   5.  Compare the passwords
        *   6.  Run the callback function providing the appropriate parameter (error || warning || user)
        *       =>  user successfuly inserted   == callback(null, null, userInserted)
        *       =>  username already taken      == callback(null, usernameTaken, null)
        *       =>  error inserting the user    == callback(errorInserting, null, null)
        *
        *       if the user was successfuly validated the callback function will be provided with the user
        *       else, either error or warning will be passed to callback
        *
        */
        constructQuery()
            .then(findUser)
            .then(generateSalt)
            .then(hashPassword)
            .then(comparePasswords)
            .then(exit)
            .catch(exception);

        ////////

        //  Construct the query document
        function constructQuery() {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve) {

                //  Construct the query
                var query   =   {};
                query._id   =   credentialsSupplied.username;
                return resolve(query);

            }

        }

        //  Query the database
        function findUser(query) {

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  Query the database
                usersCollection.findOne(query, findUser_cb);


                //  Find user callback
                function findUser_cb(error, userFound) {

                    //  [Error]
                    if(error) {
                        //  Error generating salt (native)
                        var databaseQueryError  =   {
                            message :   "There was an error querying the database!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(databaseQueryError);
                    }

                    //  [Warning]
                    if(!userFound) {
                        //  User not found
                        var userNotFound    =   {
                            message :   "User " + query._id + " does not exist!",
                            user    :   null
                        };
                        //  Return warning
                        return resolve({
                            warning :   userNotFound
                        });
                    }

                    //  User found
                    if(!error && userFound) {
                        //  Resolve the promise with user
                        return resolve({
                            user    :   userFound
                        });
                    }

                }

            }

        }

        //  Generate the salt
        function generateSalt(params) {

            //  Store the parameters
            var userNotFound    =   params.warning  ||  null,
                user            =   params.user     ||  null;

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if(userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }


                //  Number of rounds
                var roundsNo    =   10;     // default  = 10
                //  Generate salt
                bcrypt.generateSalt(roundsNo, generateSalt_cb);


                //  Salt generation callback
                function generateSalt_cb(error, salt) {

                    //  [Error]
                    if(error) {
                        //  Error generating salt (native)
                        var generateSaltError   = {
                            message :   "There was an error generating the salt!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateSaltError);
                    }

                    //  Salt generated
                    if(!error && salt) {
                        //  Resolve the Promise with salt
                        return resolve({
                            salt    :   salt,
                            user    :   user
                        });
                    }

                }

            }

        }

        //  Hash the password
        function hashPassword(params) {

            //  Store the parameters
            var userNotFound    =   params.warning  ||  null,
                user            =   params.user     ||  null,
                salt            =   params.salt     ||  null;

            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if (userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }


                //  Hash the password
                bcrypt.hash(credentialsSupplied.plainPassword, salt, hashPassword_cb);


                //  Password hashing callback
                function hashPassword_cb(error, hashedPassword) {

                    //  [Error]
                    if(error) {
                        //  Error hashing password (native)
                        var generateHashError   = {
                            message :   "There was an error hashing the password!",
                            trace   :   "Line 50, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  Return error
                        return reject(generateHashError);
                    }

                    //  Password hashed
                    if(!error && hashedPassword) {
                        //  Resolve the promise with hash
                        return resolve({
                            user        :   user,
                            password    :   hashedPassword
                        });
                    }

                }

            }

        }

        //  Compare passwords
        function comparePasswords(params) {

            //  Store the parameters
            var userNotFound    =   params.warning      ||  null,
                user            =   params.user         ||  null,
                password        =   params.password     ||  null;


            //  Return Promise
            return new Promise(promise_cb);


            //  Promise callback
            function promise_cb(resolve, reject) {

                //  User not found
                if (userNotFound) {
                    return resolve({
                        warning :   userNotFound
                    });
                }

                //  [Warning]
                if(user.password !== password) {
                    //  Passwords don't match
                    var incorrectPassword   =   {
                        message :   "Incorrect password!",
                        user    :   null
                    };
                    //  Return warning
                    return resolve({
                        warning :   incorrectPassword
                    });
                }

                //  Passwords match
                if(user.password === password) {
                    //  Return user
                    delete user.password;
                    return resolve({
                        user    :   user
                    });
                }

            }

        }

        //  Run the callback with user || warning
        function exit(params) {
            return callback(null, params.warning || null, params.user || null);
        }

        //  Catch the exception
        function exception(error) {
            return callback(error, null, null);
        }

    };

}



// Export the UserDAO module
module.exports = UserDAO;
