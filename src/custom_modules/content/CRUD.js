//  Dependancies
var dater   = require("../dater");


//  Content CRUD object constructor
function ContentCRUD() {
    "use strict";


    //  Must be called as a Constructor
    if((this instanceof ContentCRUD) === false) {
        return ContentCRUD(db);
    }


    /**
    *   Get content
    *           -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *   3.  Resolve/reject Promise (warning && arrayOfDocuments || error)
    *       =>  content found               == resolve(null, arrayOfDocuments)
    *       =>  no content found            == resolve(noContentFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.get    =   function(contentCollection, query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            contentCollection
                //  2. Query the collection
                .find(query)
                //  3. Resolve/Reject the promise
                .toArray(getContent_cb);


            //  Find document(s) callback
            function getContent_cb(error, content) {

                //  [Error]
                if(error) {
                    //  Error querying database (mongodb native)
                    var databaseQueryError  = {
                        message :   "There was an error querying the 'content' collection!",
                        trace   :   "Line 34, file: " + __filename,
                        time    :   dater(Date.now()).now
                    };
                    //  3. Reject the promise
                    return reject(databaseQueryError);
                }

                //  [Warning]
                if(!content) {
                    //  No document found
                    var contentNotFound =   {
                        message     :   "No records found matching the parameters."
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
module.exports  =   ContentCRUD;
