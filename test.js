/**
 * Created by orenstal on 09/02/2015.
 */

var http = require('http');
var webServer = require('./main.js');

var SUCCESS_STATUS = 0;
var FAILURE_STATUS = 1;
var USERNAME_IN_USED = 'The chosen username is in used. Please choose different username';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';
var INVALID_LOGIN_INPUTS = 'invalid username and/or password';

var sessionId;


function createHttpRequest(options, body, testNum, expectedReturnCode, expectedStatus, expectedMsg) {
    var req = http.request(options, function (res) {



        res.setEncoding = 'utf8';

        console.log(res.headers['set-cookie']);

        if (res.headers['set-cookie'] !== undefined) {
            var regPattern = new RegExp(/sessionId=(.*);/);
            var extractedSessionId = regPattern.exec(res.headers['set-cookie']);

            if (extractedSessionId !== null) {
                sessionId = extractedSessionId[1];
                console.log("test " + testNum + ", sessionId: " + sessionId);
            }

        }

        res.on('data', function(data) {
            data = JSON.parse(data);

            if (res.statusCode === expectedReturnCode && data['status'] === expectedStatus && data['msg'] === expectedMsg)
            {
                console.log("test " + testNum + ": pass");
            }
            else {
                console.log("test " + testNum + ": failed. got: return status code: " + res.statusCode + " instead of " +
                expectedReturnCode + ", server status: " + data['status'] + " instead of " + expectedStatus + ", msg: " +
                data['msg'] + " instead of " + expectedMsg);
            }

        });

        //res.on('end', function() {
        //    console.log("ENDED");
        //})
    });

    req.on('error', function(e) {
        console.log("ERROR: test " + testNum + " - " + e);
        console.log("Failed test " + testNum);
    });


    req.write(body);
    req.end();
}


// the username doesn't exist.
function test1() {

    var body = "username=orenstal&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length
        },
        path: '/login'

    };


    createHttpRequest(options, body, 1, 200, FAILURE_STATUS, INVALID_LOGIN_INPUTS);
}


// invalid username (less than 3 characters) during registration
function test2() {

    var body = "username=al&fullname=Alon Ben Shimol&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'POST',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length
        },
        path: '/register'

    };


    createHttpRequest(options, body, 2, 400, FAILURE_STATUS, UNAUTHORIZED_USER);
}

// successful registration
function test3() {

    var body = "username=tal&fullname=tal orenstein&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'POST',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length
        },
        path: '/register'

    };


    createHttpRequest(options, body, 3, 200, SUCCESS_STATUS, '');
}

// try to register with used username
function test4() {

    var body = "username=tal&fullname=tal orenstein&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'POST',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/register'

    };


    createHttpRequest(options, body, 4, 500, FAILURE_STATUS, USERNAME_IN_USED);
}


// try to login with not existing username
function test5() {

    var body = "username=notExisting&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length
        },
        path: '/login'

    };

    createHttpRequest(options, body, 5, 200, FAILURE_STATUS, INVALID_LOGIN_INPUTS);
}

// try to login with existing username but with wrong password (the last digit - 6 - is missing)
function test6() {

    var body = "username=tal&password=abc12345";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/login'

    };

    createHttpRequest(options, body, 6, 200, FAILURE_STATUS, INVALID_LOGIN_INPUTS);
}

// login with existing username and correct password
function test7() {
    //var body = "username=tal&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/login?username=tal&password=abc123456'

    };

    createHttpRequest(options, "", 7, 200, SUCCESS_STATUS, '');
}


function test8() {
    //var body = "username=tal&password=abc123456";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, "", 8, 200, SUCCESS_STATUS, '');
}




function setUpServerAndUseCases() {

    webServer.startServer;

        //test1();
        //test2();
        test3();
        //test4();
        //test5();
        //test6();
        // wait 1 second to make sure that all the previous requests were handled, and then check the login
        setTimeout(function() {
            test7();
            setTimeout(function() {
                test8();
            }, 1000);
        }, 1000);

        //test9();
        //
        //server.stop();
    //});
}


function runTests() {

    setUpServerAndUseCases();
}

runTests();