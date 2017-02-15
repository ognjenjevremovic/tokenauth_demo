//  Dependancies
var ContentDAO  = require("../contentDAO"),
    dater       = require("../dater"),
    log         = require("../logger");


//  Content handler Constructor
function ContentHandler(db) {
    "use strict";


    //  Must be called as a Constructor
    if((this instanceof ContentHandler) === false) {
        return new ContentHandler(db);
    }


    //  Content CRUD
    var content = new ContentDAO(db);


    /**
    *   Retrieve public content from the database
    *   [GET]   =>  "api/content/public"
    *           - - -
    *   Accessible for everyone
    */
    this.retrievePublicContent    = function(req, res, next) {

        /*
        *   1. Extract the query from the request
        *   2. Query the database collection
        *       =>  [warning]   no document(s) found
        *       =>  [error]     querying database (critical err! => [mongodb native])
        *   3. Send the response back to the client
        */
        content.pullPublicContent(query, pullPublicContent_cb);


        //  Query document
        var query   =   {};

        //  Retrieve public content callback
        function pullPublicContent_cb(error, warning, contentFound) {

            //  [Error]
            if(error) {
                //  Error querying the database
                return next(error);
            }

            //  [Warning]
            if(warning) {
                //  No content matching the query
                return res
                    .status(404)
                    .json({
                        warning     :   warning.message,
                        content     :   warning.content,
                        error       :   null,
                    });

            }

            //  Content found
            if(!error && !warning && contentFound) {
                return res
                        .status(200)
                        .json({
                            content     :   contentFound,
                            error       :   null,
                            warning     :   null
                        });
            }

        }

    };

    /*
    *   Retrieve locked content from the database
    *   [GET]   =>  "api/content/locked
    *           - - -
    *   Only loggedin users!
    */
    this.retrieveLockedContent    = function(req, res, next) {

        /*
        *   1. Extract the query from the request
        *   2. Query the database collection
        *       =>  [warning]   no document(s) found
        *       =>  [error]     querying database (critical err! => [native])
        *   3. Send the response back to the client
        */
        content.pullLockedContent(query, pullLockedContent_cb);


        //  Query document
        var query   =   {};

        //  Retrieve locked content callback
        function pullLockedContent_cb(error, warning, contentFound) {

            //  [Error]
            if(error) {
                //  Error querying the database
                return next(error);
            }

            //  [Warning]
            if(warning) {
                return res
                    .status(404)
                    .json({
                        warning     :   warning,
                        error       :   null,
                        content     :   null,
                    });
            }

            //  Content found
            if(!error && !warning && contentFound) {
                return res
                    .status(200)
                    .json({
                        content     :   contentFound,
                        error       :   null,
                        warning     :   null
                    });
            }

        }

    };

}


// Export the module
module.exports = ContentHandler;
