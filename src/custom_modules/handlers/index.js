// Require the dependancie modules
var GeneralPurposeHandler   = require('./generalPurposeHandler'),
    SessionHandler          = require("./sessionHandler"),
    ContentHandler          = require("./contentHandler"),
    RegistrationHandler     = require("./registrationHandler"),
    errorHandler            = require("./errorHandler");

// Export the module
module.exports = {
    GeneralPurpose      :   GeneralPurposeHandler,
    Sessions            :   SessionHandler,
    Content             :   ContentHandler,
    UserRegistration    :   RegistrationHandler,
    errorHandler        :   errorHandler
};
