/**
 * Created by Alon Ben-Shimol & Tal Orenstein on 02/02/2015.
 * This file server as the actual back-end server. It registers all the resources needed
 * in order to properly handle and allow a item-adding application "todoApp" to run.
 */


var crypto = require('crypto');

var webServer = require('./ex4Server/hujiwebserver.js');
var dataModule = require('./www/dataModule');

var FAILURE_STATUS = 1;
var USERNAME_IN_USED = 'The chosen username is in used. Please choose different username';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';

var serverPort = 8888;

exports.startServer = webServer.start(serverPort,  function(err, server) {

    var data;

    if (err) {
        console.log("Error: " + err);
        return
    }

    console.log("Server Connected Successfully!");
    console.log("------------------------------");

    data = new dataModule();

    /**
     *  Returns the entire (items) lists.
     *   if relevant - the cookie should be sent to verify which user it is. if the sessionId is
     *   unknown or expired, error 400 is returned.
     */
    server.get('/item', function(req, res, next) {
        var sessionId, retVal;

        sessionId = scanUserInput(req.cookies.sessionid); // we prevent injection using cookies as well
        retVal = data.getAllTodoList(sessionId);

        sendResponse(retVal, res);
    });

    /**
     *  Creates a new item body:{id:..,value:}. if id exists for that user return error 500.
     *  returns {status:(0 (for success) or 1 (for failure)), msg:(failure reason)}
     *  if relevant - the cookie should be sent to verify which user is it. if the sessionId is
     *  unknown or expired error 400 is returned.
     */
    server.post('/item', function(req, res, next) {
        var sessionId, retVal,itemId, content;

        //prevents injections from each possible input
        sessionId = scanUserInput(req.cookies.sessionid);
        itemId = scanUserInput(req.param('id'));
        content = scanUserInput(req.param('value'));

        retVal = data.addToDo(sessionId, itemId, content);
        sendResponse(retVal, res);
    });

    /**
     * Updates a specific item. Returns { status:0 }, or {status : 1, msg : reason } if
     * failed.
     * In case cookie is relevant - it is used to identify the current logged-on session.
     * If expired - 400 is returned.
     */
    server.put('/item', function(req, res, next) {
        var sessionId, retVal,itemId, content, itemStatus;

        // prevents all kinds of injections
        sessionId = scanUserInput(req.cookies.sessionid);
        itemId = scanUserInput(req.param('id'));
        content = scanUserInput(req.param('value'));
        itemStatus = scanUserInput(req.param('status'));

        retVal = data.changeTodoItem(sessionId, itemId,itemStatus, content);
        sendResponse(retVal, res);
    });

    /**
     * Deletes a specific item. On success returns { status: 0, }, on failue { status: 1, msg : reason }.
     * If cookie is relevant - verifies which user. If session is expired - 400 is returned.
     */
    server.delete('/item', function(req, res, next) {
        var sessionId, retVal,itemId;

        // prevents injections from all kinds of input
        sessionId = scanUserInput(req.cookies.sessionid);
        itemId = scanUserInput(req.param('id'));
        retVal = data.deleteTodoItem(sessionId, itemId);

        sendResponse(retVal, res);
    });

    /**
     * Registers a new user.
     * Note that the server itself makes additional input tests, in order to prevent
     * malicious attack which doesn't necessarily use ClientSide.js as source for attack.
     */
    server.post('/register', function(req, res, next) {
        var retVal;

        // prevent injections from all possible inputs
        var fullname = scanUserInput(req.param('fullname'));
        var password = scanUserInput(req.param('password'));
        var sessionId = generateSessionId();
        var username = scanUserInput(req.param('username'));

        if (isValidUserRegisterationInputs(fullname, username, password)) {
            retVal = data.addUser(username, password, sessionId, fullname);
        }
        else {
            retVal = {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
        }


        if (retVal['status'] === 0) {
            res.cookie('sessionId', sessionId);
        }

        sendResponse(retVal, res);
    });


    /**
     * Allows a user to log in to the application (if already registered before)
     * Upon success - a valid cookie is set and sent to the remote-end
     */
    server.get('/login', function(req, res, next) {
        var retVal;

        var password = scanUserInput(req.param('password'));
        var username = scanUserInput(req.param('username'));
        var sessionId = scanUserInput(req.cookies.sessionid);

        if (sessionId === undefined) {
            sessionId = generateSessionId();
        }

        retVal = data.isCorrectLoginInputs(username, password);

        if (retVal['status'] === 0) {
            res.cookie('sessionId', sessionId);
            data.setSessionId(username, sessionId);
        }

        sendResponse(retVal, res);
    });

    /**
     * Returns only the relevant portion of the application which will be displayed to the
     * remote end (either the log in screen, or the actual application)
     */
    server.get('/showPage', function(req, res, next) {

        var sessionId = scanUserInput(req.cookies.sessionid);
        if (data.isValidRequest(sessionId)) {
            res.json({'page': 'todolist'});
        }
        else {
            res.json({'page': 'login'});
        }
    });


    /**
     * Registers this server as a static resource handler (for the initial request)
     */
    server.use('/', webServer.static("www"));

});


/**
 * Sends a response to the remote end, with retVal as body, and 'res' as the response object
 */
function sendResponse(retVal, res) {

    var resCode=200;

    if (retVal['status'] === FAILURE_STATUS) {

        if (retVal['msg'] === UNAUTHORIZED_USER) {
            resCode = 400;
        }
        else if (retVal['msg'] === INVALID_ITEM_ID || retVal['msg'] === USERNAME_IN_USED) {
            resCode = 500;
        }

        res.status(resCode);
    }

    res.json(retVal);
}


/**
 * Scans the user input. A similar (yet less rigid) test is performed at the client side.
 * However, we do not trust requests to arrive only from within the ClientSide.js file, so
 * we test it on the server side as well. It adds extra security (and less network traffic)
 * if done also at the client-end.
 */
function scanUserInput(content) {

    if (content === undefined) return;


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


/**
 * Scans the user form input(registeration or login). A similar (yet less rigid) test is performed at the client side.
 * However, we do not trust requests to arrive only from within the ClientSide.js file, so
 * we test it on the server side as well. It adds extra security (and less network traffic)
 * if done also at the client-end.
 */
function isValidUserRegisterationInputs(fullname, username, pass) {
    if (!fullname || !username || !pass) {
        return false;
    }

    // input legality testing
    var checkNameAndUsernameRegex = /^[A-Za-z0-9 _]{3,20}$/;
    var checkPasswordRegex = /^[A-Za-z0-9 _]{6,20}$/;

    if (!checkNameAndUsernameRegex.test(fullname) || !checkNameAndUsernameRegex.test(username) ||
        !checkPasswordRegex.test(pass)) {
        return false;
    }

    return true;
}


function generateSessionId() {
    return crypto.randomBytes(20).toString('hex');
}