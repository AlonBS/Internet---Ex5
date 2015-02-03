/**
 * Created by Alon Tal on 17/01/2015.
 * This file runs the dynamic server and registers all its use cases.
 *
 */

var webServer = require('./ex4Server/hujiwebserver.js');
var portNum = 80;

function runServer() {

    webServer.start(portNum, function () {



        //var static = webServer.static('/staticResources');
        //???????
        //var showAllToDoList = function(req) {
        //    static('/showAllToDoList.html');
        //}; ????????
        //
        //var login = function(req) {
        //    if (hasValidCookies(req)) {
        //        sendResponse (to ajax) with body = "status: success#" + static('to-doListBody.txt');
        //    }
        //    else {
        //        sendResponse (to ajax) with body = "status: failed#invalid username or password".
        //            }
        //    }
        //
        //    server.put('/item', function(req, res, next) {
        //        if (hasValidCookies(req)) {
        //            bla bla
        //        }
        //        else {
        //            sendResponse (to ajax) with body = "status: failed#invalid username or password".
        //                redirect to ('/login');
        //        }
        //    });
        //
        //    server.delete('/item', function(req, res, next) {
        //        if (hasValidCookies(req)) {
        //            bla bla
        //        }
        //        else {
        //            redirect to ('/login');
        //        }
        //    });
        //
        //    server.post('/item', function(req, res, next) {
        //        if (hasValidCookies(req)) {
        //            bla bla
        //        }
        //        else {
        //            redirect to ('/login');
        //        }
        //    });
        //
        //    server.post('/login', function(req, res, next) {
        //        if (validLogin) {
        //            // make sure that we set cookies to the user and save it in the server
        //            redirect to ('/item'); // it supposed to be 'get' request by default
        //        }
        //        else {
        //            redirect to ('/login');
        //        }
        //    });
        //
        //    server.post('/register', function(req, res, next) {
        //        if (validLogin) {
        //            // make sure that we set cookies to the user and save it in the server
        //            redirect to ('/item'); // it supposed to be 'get' request by default
        //        }
        //        else {
        //            redirect to ('/login');
        //        }
        //    });
        //
        //    server.get('/:type', function(req, res, next) {
        //        if (req.params.type === 'login') {
        //            login(req);
        //        }
        //        else if (req.params.type === 'item') {
        //            if (hasValidCookies(req) {
        //                showAllToDoList(req);
        //            }
        //            else {
        //                login();
        //            }
        //        }
        //        else if (req.params.type === 'register') {
        //            if (hasValidCookies(req) {
        //                showAllToDoList(req);
        //            }
        //            else {
        //                login();
        //            }
        //        }
        //        else {
        //            login(req);
        //        }
        //    }
        //
        //    server.any('/' , function(req, res, next) {
        //        login(req);
        //    }

    });
}


runServer();


