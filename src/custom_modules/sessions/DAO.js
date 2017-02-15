//  Dependancies
var SessionsCRUD    =   require("./CRUD"),
    dater           =   require('../dater');


//  Session Data Access Object Constructor
function SessionDAO(db) {
    "use strict";


    //  Must be called as constructor
    if ((this instanceof SessionDAO) === false) {
        return new SessionDAO(db);
    }


    //  Instantiate the CRUD operator
    var session =   new SessionsCRUD();


    /**
    *   Add session document
    *           -   -   -
    *   1.  Return promise
    *   2.  Construct a session document
    *   3.  Insert into database
    *       -   session exists                  == session found    [Object]
    *       -   session already exists          == warning document [Warning]
    *       -   error inserting into database   == native error     [Error]
    *   4.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session exists                  == resolve(null, sessionDocument)
    *       =>  session already exists          == resolve(sessionConflict, null)
    *       =>  error inserting into database   == reject(Error)
    *
    */
    this.startSession   =   function(user) {
        //  Set the session duration
        var sessionDuration =   12*60*60*1000;      //  12 hours (default)

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Construct a session document
            constructSession(user)
                //  3./4. Insert into database && Resolve the promise
                .then(insertSession)
                //  4. Reject the promise
                .catch(exception);


            //  Session constructor
            function Session(user) {
                this._id    =   this.generateID();
                this.user   =   user;
                this.dateCreated    =   {
                    timestamp   :   dater().timestamp,
                    date        :   dater().now
                };
                this.validUntill    =   {
                    timestamp   :   dater().timestamp + sessionDuration,
                    date        :   dater(Date.now() + sessionDuration)
                };
            }
            Session.prototype.generateID    =   function() {
                // #13 digit timestamp
                var timestamp_13    =   (dater().timestamp).toString(),
                //  #5 digit random number
                    randomNum_5     =   generateNumber();

                //  #18 digits session ID
                return timestamp_13 + randomNum_5;

                //  Generate random 5 digit number
                function generateNumber() {
                    // Generate random number
                    var numGenerated = Math.floor(Math.random() * 100000).toString();

                    // Make a random number generated 5 digit number
                    switch (numGenerated.length) {
                        case 1:
                            numGenerated    +=  "0000";
                            break;
                        case 2:
                            numGenerated    +=  "000";
                            break;
                        case 3:
                            numGenerated    +=  "00";
                            break;
                        case 4:
                            numGenerated    +=  "0";
                            break;
                        default:
                            break;
                    }

                    // Return the random 5 digit number generated
                    return numGenerated;
                }

            };


            //  2. Construct a session document
            function constructSession(user) {
                //  Return promise
                return new Promise(function(resolve, reject) {
                    //  Resolve the promise with a session document
                    var sessionDocument =   new Session(user);
                    return resolve(sessionDocument);
                });
            }

            //  3. Insert into database
            function insertSession(sessionDocument) {

                session
                    //  Insert session document
                    .add(sessionDocument)
                    //  Resolve the promise
                    .then(insertSession_cb)
                    //  Reject the promise
                    .catch(exception);


                //  Insert session callback
                function insertSession_cb(params) {
                    //  Store the parameters
                    var warningInsertingSession =   params.warning,
                        sessionInserted         =   params.session;

                    //  [Warning]
                    if(warningInsertingSession && !sessionInserted) {
                        //  Resolve the promise with a warning
                        return resolve({
                            warning :   warningInsertingSession,
                            session :   null
                        });
                    }
                    //  Session document inserted
                    if(!warningInsertingSession && sessionInserted) {
                        //  Resolve the promise with a session
                        return resolve({
                            warning :   null,
                            session :   sessionInserted
                        });
                    }

                }

            }

            //  Catch exceptions
            function exception(error) {
                //  4. Reject the promise
                return reject(error);
            }

        });

    };

    /**
    *   Get session document
    *           -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *       -   session found                   == session found    [Object]
    *       -   session not found               == warning document [Warning]
    *       -   error querying the database     == native error     [Error]
    *   3.  Resolve/reject Promise (warning && sessionDocument || error)
    *       =>  session exists                  == resolve(null, sessionDocument)
    *       =>  session already exists          == resolve(sessionNotFound, null)
    *       =>  error inserting into database   == reject(Error)
    *
    */
    this.getSession     =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            session
                //  2. Query the database
                .get(query)
                //  3. Resolve the promise
                .then(findSession_cb)
                //  3. Reject the promise
                .catch(exception);


            //  Find session callback
            function findSession_cb(params) {
                //  Store the parameters
                var sessionNotFound =   params.warning,
                    sessionFound    =   params.session;

                //  [Warning]
                if(sessionNotFound && !sessionFound) {
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   sessionNotFound,
                        session :   null
                    });
                }

                //  Session found
                if(!sessionNotFound && sessionFound) {
                    //  3. Resolve the promise with a session document
                    return resolve({
                        warning :   null,
                        session :   sessionFound
                    });
                }

            }


            //  Catch expcetion
            function exception(error) {
                //  3. Reject the promise
                return reject(error);
            }

        });

    };

    /**
    *   Remove session document
    *       -   -   -
    *   1.  Return promise
    *   2.  Remove the session document from the database
    *       -   session found                   == session found    [Object]
    *       -   session not found               == warning document [Warning]
    *       -   error querying the database     == native error     [Error]
    *   3.  Resolve/reject Promise (warning && boolean || error)
    *       =>  session removed             == resolve(null, true)
    *       =>  no session for the user     == resolve(noSessionFound, false)
    *       =>  error deleting the document == reject(Error)
    *
    */
    this.removeSession  =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            session
                //  2./3. Remove the session document && Resolve the promise
                .remove(removeSession_cb)
                //  3.  Reject the promise
                .catch(exception);


            //  Remove session document
            function removeSession_cb(params) {
                //  Store the parameters
                var sessionDeleted  =   params.session,
                    noSessionFound  =   params.warning;

                //  No active session for the user
                if(noSessionFound && !sessionDeleted) {
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   noSessionFound,
                        deleted :   false
                    });
                }

                //  Session found
                if(!noSessionFound && sessionDeleted) {
                    //  3. Resolve the promise
                    return resolve({
                        warning :   null,
                        deleted :   true
                    });

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


// Export the module
module.exports  =   SessionDAO;
