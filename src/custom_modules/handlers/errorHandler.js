// Require the dependancie modules
var dater   = require("../dater"),
    log     = require("../logger");


// Export the error handling middleware module as a method
module.exports.errorHandler = function(err, req, res, next) {

    // Use JavaScript in the strict mode
    "use strict";


    // Construct a friendly error message
    var errorHandling_errObj = {
        message     : "Something went horribly wrong! Error handling middleware points you to this error; please contact me at jevremovic.ognjen@gmail.com for more information on this error with the following info (stack trace): \n ",
        moreInfo    : err.message,
        trace       : err.trace,
        time        : dater(Date.now())
    };

    // Log out the error message
    log("error", errorHandling_errObj);

    // Send back the response to client
    return res
        .status(500)
        .json({
            user    : null,
            message : "Ouch! " + err.message + " Please try again later, thank you."
        });

};
