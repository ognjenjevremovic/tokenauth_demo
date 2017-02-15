// Export the module
module.exports = function(params) {

    // Use JavaScript in the strict mode
    "use strict";


    // Define a object that will hold the date in object and timestamp format
    var dateObject = {};

    // Check if the parameter is supplied to a function, if not set the default value
    params = params || Date.now();


    /* Params format:
        1.  timestamp format
        2.  date object
        3.  invalid parameter supplied
    */
    // Params options is in the timestamp format
    if(typeof params === "number") {
        // Add the values to the dateObj
        dateObject.timestamp   = params;
        dateObject.date        = new Date(params);
    } else if(typeof params === "object") {
        // Add the values to the dateObj
        dateObject.timestamp   = params.getTime();
        dateObject.date        = params;
    } else {
        // Add the values to the dateObj
        dateObject.timestamp   = Date.now();
        dateObject.date        = new Date();
    }


    // Store the date & time information in a nicer looking format
    dateObject = {
        year        : (dateObject.date.getFullYear()).toString(),
        month       : (dateObject.date.getMonth() + 1).toString(),
        day         : (dateObject.date.getDate()).toString(),
        hours       : (dateObject.date.getHours()).toString(),
        minutes     : (dateObject.date.getMinutes()).toString(),
        seconds     : (dateObject.date.getSeconds()).toString(),
        timestamp   : dateObject.timestamp
    };

    // Closure
        // Pretty the dateObject format
    (function() {
        // Pretty the month result
        if (dateObject.month.length === 1) {
            dateObject.month = "0" + dateObject.month;
        }
        // Pretty the day result
        if (dateObject.day.length === 1) {
            dateObject.day = "0" + dateObject.day;
        }
        // Pretty the hours result
        if (dateObject.hours.length === 1) {
            dateObject.hours = "0" + dateObject.hours;
        }
        // Pretty the minutes result
        if (dateObject.minutes.length === 1) {
            dateObject.minutes = "0" + dateObject.minutes;
        }
        // Pretty the seconds result
        if (dateObject.seconds.length === 1) {
            dateObject.seconds = "0" + dateObject.seconds;
        }
    })();

    // Add more fields to the dateObject, for ease of use
    dateObject.date = dateObject.month + "/" + dateObject.day + "/" + dateObject.year;
    dateObject.time = dateObject.hours + ":" + dateObject.minutes + ":" + dateObject.seconds;
    dateObject.now  = "Time: " + dateObject.time + " - Date: " + dateObject.date;


    // Return the object with all the values
    return dateObject;

};
