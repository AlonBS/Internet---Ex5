/**
 * Created by orenstal on 02/02/2015.
 */

var webServer = require('./ex4Server/hujiwebserver.js');


webServer.start(8888,  function(err, server) {
    if (err) {
        console.log("Error: " + err);
        //server.close();
        return
    }

    console.log("Server Connected Successfully!");
    console.log("------------------------------");

    //server.use('/', function(req, res, next) {
    //    if (req.cookies.username in bla and bla bla) {
    //        // send to-do list..
    //    }
    //    else {
    //        // send login/registration window
    //    }
    //});

    server.get('/test', function(req, res, next){

        if (req.cookies.fname === "tal") {
            res.json({'content':"Hi Tal.<br> Welcome back !!"});
        }
        else {
            res.cookie('fname', 'tal').cookie('lname', 'orenstein').json({'content': "Hi!<br>This is your first time !!"});
        }
        //next();
    });

    server.get('/item', function(req, res, next) {
        // should returns the entire list
        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message
    });

    server.post('/item', function(req, res, next) {
        // should creates new todo item body:{id:..,value:} if id exists for that user return error 500
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message
    });

    server.put('/item', function(req, res, next) {
        // should update item body: {id:..value:..,status:(0 for active, 1 for complete}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message
    });

    server.delete('/item', function(req, res, next) {
        // should delete item {id: (either item ID or -1 to delete it all)}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message
    });

    server.use('/', webServer.static("./"));

    //server.stop();
});