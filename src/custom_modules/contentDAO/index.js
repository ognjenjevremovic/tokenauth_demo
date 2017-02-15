//  Dependancies
var dater   = require("../dater");


//  Content data access object Constructor
function ContentDAO(db) {
    "use strict";


    //  Must be called as a Constructor
    if((this instanceof ContentDAO) === false) {
        return ContentDAO(db);
    }


    //  "content" database collection
    var publicContentCollection = db.collection("public"),
        lockedContentCollection = db.collection("locked");


    /**
    *   Get content (all users)
    *       -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && arrayOfDocuments || error)
    *       =>  content found               == resolve(null, arrayOfDocuments)
    *       =>  no content found            == resolve(noContentFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.getPublic  = function(query, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2. Query the database
            publicContentCollection
                .find(query)
                .toArray(getContent_cb);


            //  Find document(s) callback
            function getContent_cb(error, content) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  = {
                        message :   "There was an error querying the database!",
                        trace   :   "Line 39, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!content) {
                    //  No document found
                    var contentNotFound =   {
                        message     :   "No records found matching the supplied parameters!"
                    };
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   contentNotFound,
                        content :   null
                    });
                }

                //  Content found
                if(!error && content) {
                    //  3. Resolve a promise with content found
                    return callback({
                        warning :   null,
                        content :   content
                    });
                }

            }

        });

    };

    /**
    *   Get content (only logged in users)
    *       -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && arrayOfDocuments || error)
    *       =>  content found               == resolve(null, arrayOfDocuments)
    *       =>  no content found            == resolve(noContentFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.getLocked  = function(query, callback) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            //  2.  Query the database
            lockedContentCollection
                .find(query)
                .toArray(getContent_cb);

            //  Find document(s) callback
            function getContent_cb(error, content) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  = {
                        message :   "There was an error querying the database!",
                        trace   :   "Line 103, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!content) {
                    //  No document found
                    var contentNotFound =   {
                        message         :   "No records found matching the supplied parameters!"
                    };
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   contentNotFound,
                        content :   null
                    });
                }

                //  Content found
                if(!error && content) {
                    //  3. Resolve the promise with content found
                    return resolve({
                        warning :   null,
                        content :   content
                    });
                }

            }

        });

    };

}


// Export the module
module.exports = ContentDAO;
