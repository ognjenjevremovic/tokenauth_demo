//  Dependancies
var dater  = require("../dater");


//  Session Data Access Object Constructor
function SessionDAO(db) {
    "use strict";


    //  Must be called as constructor
    if ((this instanceof SessionDAO) === false) {
        return new SessionDAO(db);
    }


    //  "sessions" collection
    var sessionsCollection = db.collection("sessions");


    /**
    *   Add session document
    *       -   -   -
    *   1.  Return promise
    *   2.  Insert into database
    *   3.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session exists                  == resolve(null, sessionDocument)
    *       =>  session already exists          == resolve(sessionConflict, null)
    *       =>  error inserting into database  == reject(Error)
    *
    */
    this.add            = function(session, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Insert into database
            sessionsCollection
                .insertOne(session)
                .then(insertUser_cb);


            //  Insert callback
            function insertSession_cb(notInserted, result) {

                //  Problem inserting the session document
                if(notInserted) {
                    switch (notInserted.code) {

                        //  [Warning]   -   session conflict (should not happen, as session ID is uniquely generated using timestamp and therefore no duplicates)
                        case 11000:
                            var sessionIdConflict   =   {
                                message     :   "There was a problem logging you in. Please try again."
                            };
                            //  3. Resolve the promise with a warning
                            return resolve({
                                warning :   sessionIdConflict,
                                session :   null
                            });

                        //  [Error]     -   mongodb native
                        default:
                            var databaseInsertError =   {
                                message :   "There was an error inserting the session document into database!",
                                trace   :   "Line 33, file: " + __filename,
                                time    :   dater(Date.now()).now
                            };
                            //  3. Reject the promise
                            return reject(databaseInsertError);

                    }
                }

                //  Session document inserted
                if(!notInserted && result) {
                    //  Session object to return
                    var session             =   {};
                        session._id         =   result.ops[0]._id;
                        session.user        =   result.ops[0].user;
                        session.validUntill =   result.ops[0].validUntill;
                    //  3. Resolve the promise with a session
                    return callback({
                        warning :   null,
                        session :   session
                    });
                }

            }

        });

    };

    /**
    *   Get session document
    *       -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session found               == resolve(null, sessionDocument)
    *       =>  no session for the user     == resolve(noSessionFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.get    =   function(query, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Query the database
            sessionsCollection
                .findOne(query)
                .then(findSession_cb);


            //  Find session callback
            function findSession_cb(error, sessionFound) {

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
                if(!sessionFound) {
                    //  Session does not exist
                    var sessionNotFound =   {
                        message         :   "Session not found for the user!"
                    };
                    //  3. Resolve the promise with a warning
                    return callback({
                        warning :   sessionNotFound,
                        session :   null
                    });
                }

                //  Session found
                if(!error && sessionFound) {
                    //  Session object to return
                    var session =   {};
                    session._id         =   sessionFound._id;
                    session.user        =   sessionFound.user;
                    session.validUntil  =   sessionFound.validUntil;
                    //  3. Resolve the promise with a session document
                    return callback({
                        warning :   null,
                        session : session
                    });
                }

            }

        });

    };

    /**
    *   Remove session document
    *       -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *       =>  session found               == resolve(null, sessionDocument)
    *       =>  no session for the user     == resolve(noSessionFound, null)
    *       =>  error querying the database == reject(Error)
    *   3.  Remove the document from the database
    *   4.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session removed             == resolve(null, true)
    *       =>  no session for the user     == resolve(noSessionFound, false)
    *       =>  error deleting the document == reject(Error)
    *
    */
    this.remove     =   function(query, callback) {
        var session =   this;

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Query the database
            session.get()
                .then(removeSession)
                .catch(exception);

            //  Remove session document
            function removeSession(params) {
                //  Store the parameters
                var session         =   params.session  ||  null,
                    noSessionFound  =   params.warning  ||  null;

                //  No active session for the user
                if(noSessionFound) {
                    //  4. Resolve the promise with a warning
                    return resolve({
                        warning :   noSessionFound,
                        deleted :   false
                    });
                }

                //  Session found
                if(!noSessionFound && session) {
                    //  3. Remove the document from the database
                    sessionsCollection
                        .deleteOne({
                            _id :   params.session._id
                        })
                        .then(deleteSession_cb);

                }

                //  Delete session callback
                function deleteSession_cb(error, sessionDeleted) {

                    //  [Error]
                    if (error) {
                        //  Error deleting the session (mongodb native)
                        var sessionRemoveError  =   {
                            message :   "There was an error deleting the session document!",
                            trace   :   "Line 93, file: " + __filename,
                            time    :   dater(Date.now()).now
                        };
                        //  4. Reject the promise
                        return reject(sessionRemoveError);
                    }

                    //  Session deleted
                    if(!error && (sessionDeleted.ok === 1)) {
                        //  4. Resolve the promise with a boolean
                        return resolve({
                            warning :   null,
                            deleted :   true
                        });
                    }

                }

            }

            //  Catch the exception
            function exception(error) {
                //  4. Reject the promise
                return reject(error);
            }

        });

    };






    // Start a new sessions for the user
    this.startSession       = function(username_id, firstName, lastName, isAdmin, callback) {


        // Get the current time object (in pretty format)
        var dateObject = dater(Date.now());


        /*
        *   Session object constructor
        *       New instance object => fields:
        *           _id,
        *           dateCreated,
        *           validUntill,
        *           user
        */
        function Session_constructor(username_id, firstName, lastName, isAdmin) {

            // Generate a unique session id
            this._id = (function() {
                // First #13 digits of ID (timestamp)
                var timestamp_13 = (dateObject.timestamp).toString();
                // Last #5 digits of ID (random 5 digits generated)
                var randomNum_5 = (function() {
                    // Generate random number
                    var numGenerated = Math.floor(Math.random() * 100000).toString();
                    // Make a random number generated 5 digit number
                    if(numGenerated.length === 1) {
                        numGenerated += "0000";
                    } else if(numGenerated.length === 2) {
                        numGenerated += "000";
                    } else if(numGenerated.length === 3) {
                        numGenerated += "00";
                    } else if(numGenerated.length === 4) {
                        numGenerated += "0";
                    }
                    // Return the random 5 digit number generated
                    return numGenerated;
                })();
                // Concatenate the numbers => unique #18 digits session ID
                return timestamp_13 + randomNum_5;
            })();
            // Construct a date object
            this.dateCreated = {
                timestamp   : dateObject.timestamp,
                date        : dater(dateObject.timestamp).now
            };
            // Define a validUntill field (session in the database last 8 hours! - serverSide time)
            this.validUntill = {
                timestamp   : dateObject.timestamp + 6*60*60*1000,              // +8 hours (timestamp)    -   28800000
                date        : dater(dateObject.timestamp + 6*60*60*1000).now    // +8 hours (date)         -   28800000
            };
            // Define a user field
            this.user = {
                username_id : username_id,
                name        : firstName + " " + lastName,
                isAdmin     : isAdmin
            };

        } // End Session_constructor


        // insertOne method callback (session document insertion)
        function insertSession_callback(err, result) {

            // Error inserting the document (native)
            if(err) {
                // Construct a friendly error message
                var sessionInsert_error = {
                    message : "There was an error inserting the session object into database!",
                    trace   : "Line 117, file: " + __filename,
                    time    : dater(Date.now()).now
                };
                // Pass the error object to a callback
                return callback(sessionInsert_error, null);
            /* Session object successfuly inserted into database */
            }

            // Store the inserted session object into a variable
            var newSessionStarted = result.ops[0];
            // Pass in the user object to a callback
            return callback(null, newSessionStarted);

        }


        /*
        *   1. Construct a new session object document to be inserted (with the login information provided)
        *   2. Store the session object into database
        *   3. Run the callback function providing the appropriate parameter (error || sessionObject)
        *
        *       if the session was successfuly created the callback function will be provided with the session object
        *       else, the error object will be passed to callback
        */
        var newSession_doc = new Session_constructor(username_id, firstName, lastName, isAdmin);
        sessionsCollection.insertOne(newSession_doc, insertSession_callback);


    };

    // Get session for the user (cookie provided)
    this.validateSession    = function(username, callback) {


        // Query object
        var sessionQuery = {
            "user.username_id" : username
        };


        // Define the findOne method callback (querying the sessions collection)
        function validateSession_callback(err, sessionFound) {

            // Error querying database (native)
            if(err) {
                // Construct a friendly error message
                var querySessions_error = {
                    message : "There was an error querying the sessions collection!",
                    trace   : "Line 190, file: " + __filename,
                    time    : dater(Date.now()).now
                };
                // Pass the error object to a callback
                return callback(querySessions_error, null);
            /* Session collection successfuly queried */
            }

            // No session for the user
            if(!sessionFound) {
                // Construct a friendly warning message
                var sessionNotFound_warn = {
                    message : "Molimo pristupite Vašem korisničkom nalogu, kako biste pristupili ovoj stranici.",
                    sessionNotFound : true
                };
                // Pass the warning object to a callback
                return callback(sessionNotFound_warn, null);
            /* Session object found (session valid) */
            }

            // Pass in the truthy value
            callback(null, true);

        }


        /*
        *   1. Define the query object
        *   2. Check if the session exist (ie, cookies are provided with the request)
        *   3. Query the session database by sessionID
        *   4. Run the callback function providing the appropriate parameter (error || userObject)
        *
        *       if the session was successfuly validated the callback function will be provided with the user object
        *       else, the warning object will be passed to callback
        *
        */
        sessionsCollection.findOne(sessionQuery, validateSession_callback);


    };

    // Remove session for the user
    this.removeExpiredSession  = function(sessionID, username_id, callback) {


        // Query object
        var queryObject = {};
        // sessionID parameter NOT provided (query by username)
        if(!sessionID) {
            // No cookie on the client side, but session for the user exist in the database ('sessions' collection)
            queryObject["user.username_id"] = username_id;
        /* Else, sessionID parameter is passed  */
        } else {
            // Cookie exists on the client, but it expired and needs to be removed from the database
            queryObject._id = sessionID;
        }


        // findOneAndDelete method callback (remove session)
        function deleteSession_callback(err, result) {

            // Error querying the database (native)
            if(err) {
                // Construct a friendly error message
                var removeSession_error = {
                    message : "There was an error deleting the session from the 'sessions' collection!",
                    trace   : "Line 233, file: " + __filename,
                    time    : dater(Date.now()).now
                };
                // Pass the error object to a callback
                return callback(removeSession_error);
            /* There were no errors removing the session from the database */
            }

            // Run the callback
            return callback(null);

        }


        /*
        *   1. Define a query for finding the session to be removed
        *   2. Delete the session from the database
        *   3. Run the callback function with appropriate parameter (error || null)
        *
        *       if the session was successfuly removed the callback function will be provided with null value
        *       else, the error object will be passed to callback
        */
        sessionsCollection.findOneAndDelete(queryObject, deleteSession_callback);


    };

}


// Export the module
module.exports = SessionDAO;
