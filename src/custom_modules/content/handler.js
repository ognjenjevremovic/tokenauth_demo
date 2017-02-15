//  Dependancies
var ContentDAO  = require("./DAO");


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
    *           -   -   -
    *       Accessible for everyone
    *           -   -   -
    *   1.  Extract the query from the request
    *   2.  Get the content matching the query
    *       -   content found               => documents found  [Array]
    *       -   no content found            => warning document [Warning]
    *       -   error querying the database => native error     [Error]
    *   3. Send the response back to the client
    *
    */
    this.retrievePublicContent    = function(req, res, next) {
        //  1. Extract the query
        var query   =   {};
        if (req.params) {
            query._id   =   req.params;
        }

        content
            //  2. Query the database
            .getPublic(query)
            //  3. Send the response
            .then(sendResponse)
            //  3. Send the response
            .catch(exception);

        //  3. Send the response back to client
        function sendResponse(params) {
            //  Store the params
            var noContentFound  =   params.warning,
                contentFound    =   params.content;

            //  [Warning]
            if(noContentFound && !contentFound) {
                return res
                    .status(404)
                    .json({
                        warning     :   warning.message,
                        content     :   null,
                        error       :   null,
                    });

            }

            //  Content found
            if(!noContentFound && contentFound) {
                return res
                    .status(200)
                    .json({
                        warning     :   null,
                        content     :   contentFound,
                        error       :   null,
                    });

            }

        }

        //  3. Send the response back to client
        function exception(error) {
            return res
                .status(500)
                .json({
                    warning :   null,
                    content :   null,
                    error   :   {
                        short   :   "Something went terribly wrong. Please try again later.",
                        long    :   "Ohhh, but why?! Seems like some little monkeys managed to get the hold on our keyboards. That's bad. We'll try serve them with bananas as soon as possible, untill then you can always try refresh the page and hope for the best. If not, mind sending us a few bananas?\n\n If this problem do persists however, please do contact us for further assistance. Cheers!"
                    }
                });
        }

    };

    /*
    *   Retrieve locked content from the database
    *   [GET]   =>  "api/content/locked
    *           -   -   -
    *       Only loggedin users!
    *           -   -   -
    *   1.  Extract the query from the request
    *   2.  Get the content matching the query
    *       -   content found               => documents found  [Array]
    *       -   no content found            => warning document [Warning]
    *       -   error querying the database => native error     [Error]
    *   3. Send the response back to the client
    *
    */
    this.retrieveLockedContent    = function(req, res, next) {
        //  1. Extract the query
        var query   =   {};
        if (req.params) {
            query._id   =   req.params;
        }

        content
            //  2. Query the database
            .getLocked(query)
            //  3. Send the response
            .then(sendResponse)
            //  3. Send the response
            .catch(exception);

        //  3. Send the response back to client
        function sendResponse(params) {
            //  Store the params
            var noContentFound  =   params.warning,
                contentFound    =   params.content;

            //  [Warning]
            if(noContentFound && !contentFound) {
                return res
                    .status(404)
                    .json({
                        warning     :   warning.message,
                        content     :   null,
                        error       :   null,
                    });

            }

            //  Content found
            if(!noContentFound && contentFound) {
                return res
                    .status(200)
                    .json({
                        warning     :   null,
                        content     :   contentFound,
                        error       :   null,
                    });

            }

        }

        //  3. Send the response back to client
        function exception(error) {
            return res
                .status(500)
                .json({
                    warning :   null,
                    content :   null,
                    error   :   {
                        short   :   "Something went terribly wrong. Please try again later.",
                        long    :   "Ohhh, but why?! Seems like some little monkeys managed to get the hold on our keyboards. That's bad. We'll try serve them with bananas as soon as possible, untill then you can always try refresh the page and hope for the best. If not, mind sending us a few bananas?\n\n If this problem do persists however, please do contact us for further assistance. Cheers!"
                    }
                });
        }

    };

}


// Export the module
module.exports = ContentHandler;
