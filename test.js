/**
 * Created by Alon Ben-Shimol & Tal Orenstein on 09/02/2015.
 * This is a test file to the required API's (for registration, login and to-do list operations).
 */

var http = require('http');
var webServer = require('./main.js');


var SUCCESS_STATUS = 0;
var FAILURE_STATUS = 1;
var USERNAME_IN_USED = 'The chosen username is in used. Please choose different username';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';
var INVALID_LOGIN_INPUTS = 'invalid username and/or password';

// holds the sessionId received by the server (as a cookie)
var sessionId;


function createHttpRequest(options, body, testNum, expectedReturnCode, expectedStatus, expectedMsg) {
    var req = http.request(options, function (res) {

        res.setEncoding = 'utf8';

        if (res.headers['set-cookie'] !== undefined) {
            var regPattern = new RegExp(/sessionId=(.*);/);
            var extractedSessionId = regPattern.exec(res.headers['set-cookie']);

            if (extractedSessionId !== null) {
                sessionId = extractedSessionId[1];
            }

        }

        // actually tests the results
        res.on('data', function(data) {
            data = JSON.parse(data);

            if (res.statusCode === expectedReturnCode && data['status'] === expectedStatus) {
                if (typeof expectedMsg === 'string' && data['msg'] === expectedMsg) {
                    console.log("test " + testNum + ": pass");
                }
                // uses for test the to-do list content (return value of get(item) )
                else if (typeof expectedMsg === 'object') {
                    var i;
                    for (i=0; i < data['msg']['list'].length; i++) {

                        if (expectedMsg.indexOf(data['msg']['list'][i]['content']) === -1) {
                            console.log("test " + testNum + ": failed. got: return status code: " + res.statusCode + " instead of " +
                            expectedReturnCode + ", server status: " + data['status'] + " instead of " + expectedStatus +
                            ", elem: " + data['msg']['list'][i]['content']);

                            return;
                        }
                    }

                    console.log("test " + testNum + ": pass");
                }
            }
            else {
                console.log("test " + testNum + ": failed. got: return status code: " + res.statusCode + " instead of " +
                expectedReturnCode + ", server status: " + data['status'] + " instead of " + expectedStatus + ", msg: " +
                data['msg'] + " instead of " + expectedMsg);
            }

        });
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

    var body = {'username': 'liraz', fullname: 'liraz orenstein', password: 'abc123456'};
    body = JSON.stringify(body);

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'POST',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'application/json',
            'Content-Length' : body.length
        },
        path: '/register'

    };

    createHttpRequest(options, body, 3, 200, SUCCESS_STATUS, '');
}


// try to register with used username
function test4() {

    var body = "username=liraz&fullname=liraz orenstein&password=abc123456";

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

    var body = "username=liraz&password=abc12345";

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
        path: '/login?username=liraz&password=abc123456'

    };

    createHttpRequest(options, "", 7, 200, SUCCESS_STATUS, '');
}


// should return empty to-do list
function test8() {

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

    createHttpRequest(options, "", 8, 200, SUCCESS_STATUS, []);
}


// try to get to-do list for invalid sessionId
function test9() {

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'GET',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : 0,
            'cookie' : "sessionid=2lkjlkjwe23lkjgheor; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, "", 9, 400, FAILURE_STATUS, UNAUTHORIZED_USER);
}


// adding to-do
function test10() {
    var body = "id=0&value=submit internet ex 5";

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
        path: '/item'

    };

    createHttpRequest(options, body, 10, 200, SUCCESS_STATUS, '');
}


// trying to add another to-do with the same id
function test11() {
    var body = "id=0&value=watch TV";

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
        path: '/item'

    };

    createHttpRequest(options, body, 11, 500, FAILURE_STATUS, INVALID_ITEM_ID);
}


// verify that the to-do we added was kept in the server.
function test12() {

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

    createHttpRequest(options, "", 12, 200, SUCCESS_STATUS, ['submit internet ex 5']);
}


// update the content of the first task to be completed and change the task content
function test13() {
    var body = "id=0&value=updated todo&status=1";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'PUT',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, body, 13, 200, SUCCESS_STATUS, '');
}


// verify that the to-do content was updated in the server.
function test14() {

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

    createHttpRequest(options, "", 14, 200, SUCCESS_STATUS, ['updated todo']);
}


// send request to update to-do content for invalid item id
function test15() {
    var body = "id=3&value=doesnt matter&status=0";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'PUT',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, body, 15, 500, FAILURE_STATUS, INVALID_ITEM_ID);
}


// add another task
function test16() {
    var body = "id=1&value=second todo - active";

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
        path: '/item'

    };

    createHttpRequest(options, body, 16, 200, SUCCESS_STATUS, '');
}


// add the third task
function test17() {
    var body = "id=2&value=third todo";

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
        path: '/item'

    };

    createHttpRequest(options, body, 17, 200, SUCCESS_STATUS, '');
}


// verify that the to-do content was updated in the server.
function test18() {

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

    createHttpRequest(options, "", 18, 200, SUCCESS_STATUS, ['updated todo', 'second todo - active', 'third todo']);
}


// delete the third task
function test19() {
    var body = "id=2";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'DELETE',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, body, 10, 200, SUCCESS_STATUS, '');
}


// verify that the to-do list was updated in the server.
function test20() {

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

    createHttpRequest(options, "", 20, 200, SUCCESS_STATUS, ['updated todo', 'second todo - active']);
}


// delete all the not completed tasks
function test21() {
    var body = "id=-1";

    var options = {
        hostname: 'localhost',
        port: 8888,
        method: 'DELETE',
        headers: {
            'connection' : "keep-alive",
            'Content-Type' : 'text/plain',
            'Content-Length' : body.length,
            'cookie' : "sessionid=" + sessionId + "; path=/"
        },
        path: '/item'

    };

    createHttpRequest(options, body, 21, 200, SUCCESS_STATUS, '');
}


// verify that the to-do list was updated in the server.
function test22() {

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

    createHttpRequest(options, "", 22, 200, SUCCESS_STATUS, ['second todo - active']);
}


// during the tests, we wait sometimes at least 1 sec to make sure that the data is received by the server before we continue.
function testLoginPage() {
    test1();
    test2();
    test3();
    test4();
    test5();
    test6();

    setTimeout(function() {
        test7();
        setTimeout(function() {
            testTodoPage();
        }, 1000);
    }, 1000);
}



function testTodoPage() {
    test8();
    test9();
    test10();
    setTimeout(function () {
        test11();
        test12();
        test13();
        setTimeout(function() {
            test14();
            setTimeout(function() {
                test15();
                test16();
                test17();
                setTimeout(function () {
                    test18();
                    setTimeout(function() {
                        test19();
                        setTimeout(function() {
                            test20();
                            setTimeout(function() {
                                test21();
                                setTimeout(function() {
                                    test22();
                                    setTimeout(function() {
                                        console.log("Done the 22 tests. check results !!");
                                        console.log("Note that the server is remained open on port 8888");
                                    }, 1000);
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}



function runTests() {

    // start the server (listen on port 8888)
    webServer.startServer;

    console.log("start testing..");

    // Tests numbers 1-7 check the login and registration API. Tests 8-22 check the to-do list API.
    testLoginPage();
}

runTests();
