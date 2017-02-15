//  Dependancies
var bodyParser  = require("body-parser");


//  General purpose handler (constructor)
function GeneralPurposeHandler() {
    'use strict';


    //  Must be called as a constructor
    if((this instanceof GeneralPurposeHandler) === false) {
        return new GeneralPurposeDAO();
    }


    //  Send the client application
    this.sendApp    =   function(req, res, next) {

        //  Index path
        var index_path = {
            root : __dirname + "/../public"
        };
        //  Send the application back to user
        return res
                .status(200)
                .sendFile("index.html", index_path);

    };

    //  Test the user loggin [Delete afterwards!]
    this.testLogin  =   function(req, res, next) {

        return res
                .status(200)
                .json({
                    message: "User is logged in!"
                });

    };

}


//  Export the module
module.exports  =   GeneralPurposeHandler;
