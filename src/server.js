//  Dependancies
var express     = require('express'),
    favicon     = require('serve-favicon'),
    MongoClient = require('mongodb').MongoClient,
    dater       = require('./custom_modules/dater'),
    log         = require('./custom_modules/logger'),
    envVars     = require('./custom_modules/envReader'),
    routes      = require('./routes');


//  Populate the ENVIRONMENT_VARIABLES
envVars.load(__dirname + '/.envVars');

//  Initialize the framework
var app = express();

//  Database params
var db  = {};
db.name         =   process.env.DB_NAME;
db.connection   =   'mongodb://localhost:27017/' + db.name;


//  Connect to the database
MongoClient.connect(db.connection, function(errorConnection, db) {
    'use strict';


    //  Db Error connection
    if(errorConnection) {
        //  Error out
        var databaseConnection_error = {
            message : "There was an error connecting to the database!",
            trace   : "Line 26, file: " + __filename,
            time    :  dater(Date.now()).now
        };
        throw log("error", databaseConnection_error);
    }

    //  Static file serve
    app.use("/", express.static(__dirname + "/public"));
    app.use(favicon(__dirname + '/public/img/logo.png'));

    //  Register the application routes
    routes(app, db);


    //  Listen for requests
    app.listen(process.env.PORT || 3000, function() {
        log('info', [
            'Starting. . .',
            'Web server listening on the port ' + (process.env.PORT ? process.env.PORT : 3000),
            'http://localhost:' + process.env.PORT ? process.env.PORT : 3000
        ]);
    });

});
