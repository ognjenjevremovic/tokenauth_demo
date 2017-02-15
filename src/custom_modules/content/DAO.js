//  Dependancies
var ContentCRUD =   require('./CRUD');


//  Content data access object Constructor
function ContentDAO(db) {
    "use strict";


    //  Must be called as a Constructor
    if((this instanceof ContentDAO) === false) {
        return ContentDAO(db);
    }

    //  Instantiate the CRUD operator
    var content =   new ContentCRUD();


    //  "content" database collection
    var publicContent   = db.collection("public"),
        lockedContent   = db.collection("locked");


    /**
    *   Get content (all users)
    *           -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *       -   content found               => documents found  [Array]
    *       -   no content found            => warning document [Warning]
    *       -   error querying the database => native error     [Error]
    *   3.  Resolve/reject Promise (warning && arrayOfDocuments || error)
    *       =>  content found               == resolve(null, arrayOfDocuments)
    *       =>  no content found            == resolve(noContentFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.getPublic  =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            content
                //  2. Query the database
                .get(publicContent, query)
                //  3. Resolve the promise
                .then(returnContent)
                //  3. Reject the promise
                .catch(exception);


            //  Return content
            function returnContent(params) {
                //  Store the parameters
                var noContentFound  =   params.warning,
                    contentFound    =   params.content;

                //  [Warning]
                if(noContentFound && !contentFound) {
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   noContentFound,
                        content :   null
                    });
                }

                //  Content found
                if(!noContentFound && contentFound) {
                    //  3. Resolve a promise with content found
                    return resolve({
                        warning :   null,
                        content :   contentFound
                    });
                }

            }

            //  Catch exception
            function exception(error) {
                //  3. Reject the promise
                return reject(error);
            }

        });

    };

    /**
    *   Get content (loggedin users only)
    *           -   -   -
    *   1.  Return promise
    *   2.  Query the database
    *       -   content found               => documents found  [Array]
    *       -   no content found            => warning document [Warning]
    *       -   error querying the database => native error     [Error]
    *   3.  Resolve/reject Promise (warning && arrayOfDocuments || error)
    *       =>  content found               == resolve(null, arrayOfDocuments)
    *       =>  no content found            == resolve(noContentFound, null)
    *       =>  error querying the database == reject(Error)
    *
    */
    this.getLocked  =   function(query) {

        //  1. Return promise
        return new Promise(function(resolve, reject) {

            content
                //  2. Query the database
                .get(lockedContent)
                //  3. Resolve the promise
                .then(returnContent)
                //  3. Reject the promise
                .catch(exception);


            //  Get content
            function returnContent(params) {
                //  Store the parameters
                var noContentFound  =   params.warning,
                    contentFound    =   params.content;

                //  [Warning]
                if(noContentFound && !contentFound) {
                    //  3. Resolve the promise with a warning
                    return resolve({
                        warning :   noContentFound,
                        content :   null
                    });
                }

                //  Content found
                if(!noContentFound && contentFound) {
                    //  3. Resolve a promise with content found
                    return resolve({
                        warning :   null,
                        content :   contentFound
                    });
                }

            }

            //  Catch exception
            function exception(error) {
                //  3. Reject the promise
                return reject(error);
            }

        });

    };

}


// Export the module
module.exports  =   ContentDAO;
