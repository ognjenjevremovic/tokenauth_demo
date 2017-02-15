//  Dependancies
var dater  = require("../dater");


//  Session CRUD object constructor
function SessionsCRUD(db) {
    "use strict";


    //  Must be called as constructor
    if ((this instanceof SessionsCRUD) === false) {
        return new SessionsCRUD(db);
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
    *       =>  error inserting into database   == reject(Error)
    *
    */
    this.add    =   function(session) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            sessionsCollection
                //  2. Insert into database
                .insertOne(session)
                //  3. Resolve/Reject the promise
                .then(insertUser_cb);


            //  Insert callback
            function insertSession_cb(notInserted, inserted) {

                //  Problem inserting the session document
                if(notInserted) {
                    switch (notInserted.code) {

                        //  [Warning]
                        case 11000:
                            //  Session conflict (should not happen, as session ID is uniquely generated using timestamp and therefore no duplicates) 
                            var sessionIdConflict   =   {
                                message     :   "There was a problem logging you in. Please try again."
                            };
                            //  3. Resolve the promise with a warning
                            return resolve({
                                warning :   sessionIdConflict,
                                session :   null
                            });

                        //  [Error]
                        default:
                            //  Error inserting the session document (mongodb native)
                            var databaseInsertError =   {
                                message :   "There was an error inserting the session document into 'sessions' collection!",
                                trace   :   "Line 38, file: " + __filename,
                                time    :   dater(Date.now()).now
                            };
                            //  3. Reject the promise
                            return reject(databaseInsertError);

                    }
                }

                //  Session document inserted
                if(!notInserted && (inserted.result.ok === 1)) {
                    //  3. Resolve the promise with a session
                    return resolve({
                        warning :   null,
                        session :   inserted.ops[0]
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
    this.get    =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            sessionsCollection
                //  2. Query the database
                .findOne(query)
                //  3. Resolve/Reject the promise
                .then(findSession_cb);


            //  Find session
            function findSession_cb(error, session) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  =   {
                        message :   "There was an error querying the database!",
                        trace   :   "Line 108, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!session) {
                    //  Session does not exist
                    var sessionNotFound =   {
                        message         :   "Session not found for the user!"
                    };
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   sessionNotFound,
                        session :   null
                    });
                }

                //  Session found
                if(!error && session) {
                    //  3. Resolve the promise with a session document
                    return resolve({
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
    *       -   session found               => session found    [Object]
    *       -   no session found            => warning document [Warning]
    *       -   error querying the database => native error     [Error]
    *   3.  Remove the session document from the database
    *   4.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session removed             == resolve(null, true)
    *       =>  no session for the user     == resolve(noSessionFound, false)
    *       =>  error deleting the document == reject(Error)
    *
    */
    this.remove =   function(query) {
        var session =   this;

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            session
                //  2. Query the database
                .get(query)
                //  3./4. Remove the session from the database && Resolve the promise
                .then(removeSession)
                //  4. Reject the promise
                .catch(exception);


            //  Remove session document
            function removeSession(params) {
                //  Store the parameters
                var sessionFound    =   params.session  ||  null,
                    noSessionFound  =   params.warning  ||  null;

                //  No active session for the user
                if(noSessionFound && !sessionFound) {
                    //  Resolve the promise with a warning
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
                            trace   :   "Line 181, file: " + __filename,
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

}


//  Export the module
module.exports  =   SessionsCRUD;
