//  Dependancies
var bodyParser              = require('body-parser'),
    applicationHandlers     = require('../custom_modules/handlers');


//  Application handlers
var handlers    =   {};
handlers.constructors   =   {
    GeneralPurpose      :   applicationHandlers.GeneralPurpose,
    UserRegistration    :   applicationHandlers.UserRegistration,
    Sessions            :   applicationHandlers.Sessions,
    Content             :   applicationHandlers.Content
};
handlers.instances      =   {
    errorHandler        :   applicationHandlers.errorHandler
};

//  Application routes
var routes  =   {};
routes.root     =   '/';
routes.users    =   {
    register    :   '/api/user/register',
    login       :   '/api/user/login',
    testLogin   :   '/api/user/testLogin'
};
routes.content  =   {
    public          :   '/api/content/public',
    requiresLogin   :   '/api/content/locked'
};


//  Application route handler
function appRoutes(app, db) {
    'use strict';


    //  Handler instances
    handlers.instances.generalPurpose   =   new handlers.constructors.GeneralPurpose();
    handlers.instances.sessions         =   new handlers.constructors.Sessions(db);
    handlers.instances.content          =   new handlers.constructors.Content(db);
    handlers.instances.userRegistration =   new handlers.constructors.UserRegistration(db);


            /*  =   =   =   > APP MIDDLEWARES   <   =   =   =   */

    //  Extract the request body (data)
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());



            /*  =   =   =   > APP ROUTES   <   =   =   =   */

    /**
    *   Send the app to the user
    *   [GET]   =>  "/"
    */
    app.get(
        routes.root,
        ////////
        handlers.instances.generalPurpose.sendApp
    );

    /**
    *   Test if the user is logged in (token exists)    = [Delete afterwards!]
    *   [GET]   =>  "/api/user/testLogin"
    */
    app.get(
        routes.users.testLogin,
        ////////
        handlers.instances.sessions.isLoggedIn,
        handlers.instances.generalPurpose.testLogin
    );

    /**
    *   Register new user
    *   [POST]  =>  "/api/user/register"
    */
    app.post(
        routes.users.register,
        ////////
        handlers.instances.userRegistration.registerUser,
        handlers.instances.sessions.handleLoginRequest
    );

    /**
    *   Login existing user
    *   [POST]  =>  "/api/user/login"
    */
    app.post(
        routes.users.login,
        ////////
        handlers.instances.sessions.handleLoginRequest
    );

    /**
    *   Pull public content
    *   [GET]   =>  "/api/content/public"
    */
    app.get(
        routes.content.public,
        ////////
        handlers.instances.content.retrievePublicContent
    );

    /**
    *   Pull locked content (only logged in users!)
    *   [GET]   =>  "/api/content/locked"
    */
    app.get(
        routes.content.requiresLogin,
        ////////
        handlers.instances.sessions.isLoggedIn,
        handlers.instances.content.retrieveLockedContent
    );

}


// Export the module
module.exports = appRoutes;
