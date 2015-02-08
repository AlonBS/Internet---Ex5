/**
 * Created by orenstal on 03/02/2015.
 */

var jquery = require('./lib/jquery-2.1.3.js');

// todo maybe we should use 'const' instead of 'var' (checks ES !)
var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var ACTIVE_ITEM_CODE = '0';
var COMPLETED_ITEM_CODE = '1';
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';
var INVALID_LOGIN_INPUTS = 'invalid username and/or password';


function DataModule() {
    // key: username, value: {'password': password, 'sessionId': sessionId, 'fullName': fullName,
    // 'todoList': array of {'id': itemId, 'content': content, 'status': 'inProcess/completed'}}
    this.data = {};

    // for debug use
    //this.data['tal'] = {'password': 'pass', 'sessionId': '0', 'fullName': 'fullName', 'lastConn': new Date(), 'todoList': []};
    // end debug
}

DataModule.prototype.addUser = function(username, password, sessionId, fullName) {

    if (this.isRegisteredUser(username)) {
        console.log("username: " + username + " is in used !!");
        return {'status': FAILURE_STATUS, 'msg': USERNAME_IN_USED};
    }

    this.data[username] = {'password': password, 'sessionId': sessionId, 'fullName': fullName, 'lastConn': new Date(), 'todoList': []};

    return {'status': SUCCESS_STATUS, 'msg': ''};
};


DataModule.prototype.addToDo = function(username, sessionId, itemId, content) {
    if (this.isValidRequest(username, sessionId)) {

        if (this.getListIndex(username, itemId) === -1) {
            this.data[username]['todoList'].push({'id': itemId, 'content': content, 'status': ACTIVE_ITEM_CODE});
            this.updateLastConnection(username);
            return {'status': SUCCESS_STATUS, 'msg': ''};
        }
        else {
            return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
        }
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.changeTodoItem = function(username, sessionId, itemId, newStatus, newContent) {
    var index;

    if (this.isValidRequest(username, sessionId)) {

        index = this.getListIndex(username, itemId);

        if (index !== -1) {
            //console.log("before- status: " + this.data[username]['todoList'][index]['status'] + ", content: " +
            //    this.data[username]['todoList'][index]['content']);

            if (newStatus === ACTIVE_ITEM_CODE || newStatus === COMPLETED_ITEM_CODE) {
                this.data[username]['todoList'][index]['status'] = newStatus;
            }

            if (newContent !== undefined) {
                this.data[username]['todoList'][index]['content'] = newContent;
            }

            //console.log("after- status: " + this.data[username]['todoList'][index]['status'] + ", content: " +
            //this.data[username]['todoList'][index]['content']);

            this.updateLastConnection(username);

            return {'status': SUCCESS_STATUS, 'msg': ''};
        }
        else if (newStatus !== undefined) {  //change status to all items
            var len = this.data[username]['todoList'].length;
            var i;

            for (i=0; i<len; i++) {
                this.data[username]['todoList'][i]['status'] = newStatus;
            }

            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};




DataModule.prototype.deleteTodoItem = function(username, sessionId, itemId) {
    var index;

    if (this.isValidRequest(username, sessionId)) {
        if (itemId === '-1') {
            this.deleteAllCompleted(username);
            this.updateLastConnection(username);
            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        index = this.getListIndex(username, itemId);

        if (index !== -1) {
            this.data[username]['todoList'].splice(index, 1);
            this.updateLastConnection(username);
            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.getListIndex = function(username, itemId) {
    var i;
    var listArray = this.data[username]['todoList'];
    var len = listArray.length;

    if (itemId === -1)
        return -1;

    for (i=0; i<len; i++) {
        if (listArray[i]['id'] === itemId) {
            return i;
        }
    }

    return -1;
};


DataModule.prototype.deleteAllCompleted = function(username) {
    var i;
    var listArray = this.data[username]['todoList'];
    var len = listArray.length;

    for (i=listArray.length-1; i>=0 ;i--) {
        if (listArray[i]['status'] === COMPLETED_ITEM_CODE) {
            this.data[username]['todoList'].splice(i, 1);
        }
    }
};


DataModule.prototype.getAllTodoList = function(username, sessionId) {

    if (this.isValidRequest(username, sessionId)) {
        this.updateLastConnection(username);

        var lastCellIndex = this.data[username]['todoList'].length-1;
        var nextValidId;

        if (lastCellIndex === -1)
            nextValidId = 0;
        else
            nextValidId = this.data[username]['todoList'][lastCellIndex]['id']+1;

        return {'status': SUCCESS_STATUS,
            'msg': {'list': this.data[username]['todoList'], 'nextId': nextValidId}};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.isRegisteredUser = function (username) {
    return (this.data[username] !== undefined);
};

DataModule.prototype.isCorrectLoginInputs = function(username, password) {
    if (username !== undefined && this.data[username] !== undefined && this.data[username]['password'] === password) {
        return {'status': SUCCESS_STATUS, 'msg': ''};
    }

    return {'status': FAILURE_STATUS, 'msg': INVALID_LOGIN_INPUTS};
};

DataModule.prototype.setSessionId = function(username, sessionId) {
    if (username !== undefined) {
        this.data[username]['sessionId'] = sessionId;
    }
};

DataModule.prototype.isValidRequest = function(username, sessionId) {

    var currTime = new Date();

    if (this.data[username] !== undefined && this.data[username]['sessionId'] === sessionId &&
        username !== undefined && sessionId !== undefined) {

        if (new Date(currTime - this.data[username]['lastConn']).getMinutes() <= 30) {
            return true;
        }
    }

    return false;
};

DataModule.prototype.updateLastConnection = function(username) {
    this.data[username]['lastConn'] = new Date();
};

module.exports = DataModule;