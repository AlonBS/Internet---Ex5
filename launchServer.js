/**
 * Created by orenstal on 02/02/2015.
 */

var crypto = require('crypto');

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


    server.get('/item', function(req, res, next) {
        // should returns the entire list
        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        //username = req.cookies.username;
        //sessionId = req.cookies.sessionId;
        username = scanUserInput(req.cookies.username);
        sessionId = scanUserInput(req.cookies.sessionid);
        console.log("username: " + username + ", sessionId: " + sessionId);

        // for debug use
        //username = 'tal';
        //sessionId = '0';
        //res.cookie('sessionId', '0');
        //res.cookie('username', 'tal');
        // end debug

        retVal = data.getAllTodoList(username, sessionId); // {

        sendResponse(retVal, res);
    });


    server.post('/item', function(req, res, next) {
        // should creates new todo item body:{id:..,value:} if id exists for that user return error 500
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = scanUserInput(req.cookies.username);
        sessionId = scanUserInput(req.cookies.sessionid);

        // for debug use
        //username = scanUserInput('tal');
        //sessionId = scanUserInput('0');
        //res.cookie('sessionId', '0');
        //res.cookie('username', 'tal');
        // end debug

        itemId = scanUserInput(req.param('id'));
        content = scanUserInput(req.param('value'));

        retVal = data.addToDo(username, sessionId, itemId, content);

        sendResponse(retVal, res);
    });

    server.put('/item', function(req, res, next) {
        // should update item body: {id:..value:..,status:(0 for active, 1 for complete}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = scanUserInput(req.cookies.username);

        sessionId = scanUserInput(req.cookies.sessionid);

        // for debug use
        //username = scanUserInput('tal');
        //sessionId = scanUserInput('0');
        //res.cookie('sessionId', '0');
        //res.cookie('username', 'tal');
        // end debug

        itemId = scanUserInput(req.param('id'));
        content = scanUserInput(req.param('value'));
        itemStatus = scanUserInput(req.param('status'));

        retVal = data.changeTodoItem(username, sessionId, itemId,itemStatus, content);

        sendResponse(retVal, res);
    });

    server.delete('/item', function(req, res, next) {
        // should delete item {id: (either item ID or -1 to delete it all)}
        // should return {status:(0 for success or 1 for failure), msg:(failure reason)}

        // if relevant- the cookie should be sent to verify which user is it. if the sessionId is unknown or expired
        // you should return error 400 and show the login virtual page with some message

        username = scanUserInput(req.cookies.username);
        sessionId = scanUserInput(req.cookies.sessionid);

        // todo for debug use
        //username = scanUserInput('tal');
        //sessionId = scanUserInput('0');
        //res.cookie('sessionId', '0');
        //res.cookie('username', 'tal');
        // end debug

        itemId = scanUserInput(req.param('id'));

        retVal = data.deleteTodoItem(username, sessionId, itemId);

        sendResponse(retVal, res);
    });


    server.post('/register', function(req, res, next) {

        var fullname = scanUserInput(req.param('fullname'));
        var password = scanUserInput(req.param('password'));
        var sessionId = generateSessionId();
        username = scanUserInput(req.param('username'));

        retVal = data.addUser(username, password, sessionId, fullname);

        if (retVal['status'] === 0) {
            res.cookie('sessionId', sessionId);
            res.cookie('username', username);
        }

        sendResponse(retVal, res);
    });


    server.get('/login', function(req, res, next) {

        var password = scanUserInput(req.param('password'));
        username = scanUserInput(req.param('username'));
        sessionId = generateSessionId();


        retVal = data.isCorrectLoginInputs(username, password);

        if (retVal['status'] === 0) {
            res.cookie('sessionId', sessionId);
            res.cookie('username', username);
            data.setSessionId(username, sessionId);
        }

        sendResponse(retVal, res);
    });

    server.get('/activeSession', function(req, res, next) {
        username = scanUserInput(req.cookies.username);
        sessionId = scanUserInput(req.cookies.sessionid);

        if (data.isValidRequest(username, sessionId)) {
            res.json({'page': 'todolist'});
        }
        else {
            res.json({'page': 'login'});
        }

    });


    server.use('/', webServer.static("./"));

    //server.stop();
});


function sendResponse(retVal, res) {
    var errorCode;

    if (retVal['status'] === FAILURE_STATUS) {

        if (retVal['msg'] === UNAUTHORIZED_USER) {
            errorCode = 400;
        }
        else if (retVal['msg'] === INVALID_ITEM_ID) {
            errorCode = 500;
        }

        res.status(errorCode);
    }

    res.json(retVal);
}

function scanUserInput(content) {
    if (content === undefined)
        return;


    var startBracketIndex = content.indexOf("<");
    var endBracketIndex = content.indexOf(">");
    var startBracketCodeIndex = content.indexOf("%3C");
    var endBracketCodeIndex = content.indexOf("%3E");
    var contentLowerCase = content.toLowerCase();


    if ((startBracketCodeIndex !== -1 || startBracketIndex !== -1) &&
        (endBracketCodeIndex !== -1 || endBracketIndex !== -1) &&
        ((contentLowerCase.indexOf("script") !== -1) ||
        (contentLowerCase.indexOf("src") !== -1) ||
        (contentLowerCase.indexOf("rel") !== -1) ||
        (contentLowerCase.indexOf(".cookie") !== -1))){

        //the content contains the word 'script' and has both '>' and '<' signs
        content = content.replace(/\\<|%3C/g, '(');
        content = content.replace(/\\>|%3E/g, ')');
    }

    content = decodeURIComponent(content);

    return content;
}


function generateSessionId() {
    return crypto.randomBytes(20).toString('hex');
    //return '0';
}