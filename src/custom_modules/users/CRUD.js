//  Dependancies
var dater   =   require('../dater');


//  Users CRUD object constructor
function UsersDAO(db) {
    'use strict';


    //  Must be called as a constructor
    if((this instanceof UsersDAO) === false) {
        return new UsersDAO(db);
    }


    //  Users collection
    var usersCollection =   db.collection('users');


    /**
    *   Add user
    *           -   -   -
    *   1.  Return promise
    *   2.  Insert the user
    *   3.  Resolve/reject Promise (warning && userInserted || error)
    *       =>  user inserted                   == resolve(null, userInserted)
    *       =>  username already taken          == resolve(usernameTaken, null)
    *       =>  error inserting into database   == reject(Error)
    *
    */
    this.add    =   function(user) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            usersCollection
                //  2. Insert the user
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
                                trace   :   "Line 38, file: " + __filename,
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
    *           -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && userFound || error)
    *       =>  user found                      == resolve(null, userFound)
    *       =>  username not found              == resolve(noUserFound, null)
    *       =>  error querying the database     == reject(Error)
    *
    */
    this.get    =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            usersCollection
                //  2. Query the database
                .findOne(query)
                .then(findUser_cb);


            //  Find user callback
            function findUser_cb(error, user) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  =   {
                        message :   "There was an error querying the 'users' collection!",
                        trace   :   "Line 110, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!user) {
                    //  User not registered/misstyped
                    var userNotFound    =   {
                        message         :   "User " + query._id + " not found. Please check your input."
                    };
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   userNotFound,
                        user    :   null
                    });
                }

                //  User found
                if(!error && user) {
                    //  3. Resolve the promise with a user document
                    return resolve({
                        warning :   null,
                        user    :   user
                    });
                }

            }

        });

    };

}
