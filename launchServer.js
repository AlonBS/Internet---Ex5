/**
 * Created by orenstal on 02/02/2015.
 */

var webServer = require('./ex4Server/hujiwebserver.js');
var dataModule = require('./dataModule');

var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';

webServer.start(8888,  function(err, server) {
    var data, sessionId, username, retVal,itemId, content, itemStatus;

    if (err) {
        console.log("Error: " + err);
        //server.close();
        return
    }

    console.log("Server Connected Successfully!");
    console.log("------------------------------");

    data = new dataModule();

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

        username = req.cookies.username;
        sessionId = req.cookies.sessionId;

        // for debug use
        username = 'tal';
        sessionId = '0';
        res.cookie('sessionId', '0');
        res.cookie('username', 'tal');
        // end debug

        retVal = data.getAllTodoList(username, sessionId);

        sendResponse(retVal, res);
    });


    server.post('/item', function(req, res, next) {
        // should creates new todo item body:{id:..,value:} if id exists for that user return error 500
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = req.cookies.username;
        sessionId = req.cookies.sessionId;

        // for debug use
        username = 'tal';
        sessionId = '0';
        res.cookie('sessionId', '0');
        res.cookie('username', 'tal');
        // end debug

        itemId = req.params.id;
        content = req.params.value;

        retVal = data.addToDo(username, sessionId, itemId, content);

        sendResponse(retVal, res);
    });

    server.put('/item', function(req, res, next) {
        // should update item body: {id:..value:..,status:(0 for active, 1 for complete}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = req.cookies.username;

        sessionId = req.cookies.sessionId;

        // for debug use
        username = 'tal';
        sessionId = '0';
        res.cookie('sessionId', '0');
        res.cookie('username', 'tal');
        // end debug

        itemId = req.params.id;
        content = req.params.value;
        itemStatus = req.params.status;

        retVal = data.changeTodoItem(username, sessionId, itemId,itemStatus, content);

        sendResponse(retVal, res);
    });

    server.delete('/item', function(req, res, next) {
        // should delete item {id: (either item ID or -1 to delete it all)}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = req.cookies.username;

        sessionId = req.cookies.sessionId;

        // for debug use
        username = 'tal';
        sessionId = '0';
        res.cookie('sessionId', '0');
        res.cookie('username', 'tal');
        // end debug

        itemId = req.params.id;

        retVal = data.deleteTodoItem(username, sessionId, itemId);

        sendResponse(retVal, res);
    });

    server.use('/', webServer.static("./"));

    //server.stop();
});

function getLoginWindowCode(reason) {
    var content = "<p>bla bla</p>";

    return content;
}

function sendResponse(retVal, res) {
    var errorCode;

    if (retVal['status'] === FAILURE_STATUS) {

        if (retVal['content'] === UNAUTHORIZED_USER) {
            errorCode = 400;
            retVal['content'] = getLoginWindowCode(retVal['content']);
        }
        else if (retVal['content'] === INVALID_ITEM_ID) {
            errorCode = 500;
        }

        res.status(errorCode);
    }

    res.json(retVal);
}