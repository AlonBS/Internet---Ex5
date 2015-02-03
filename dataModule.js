/**
 * Created by orenstal on 03/02/2015.
 */


// todo maybe we should use 'const' instead of 'var' (checks ES !)
var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var ACTIVE_ITEM_CODE = 0;
var COMPLETED_ITEM_CODE = 1;
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';


function DataModule() {
    // key: username, value: {'password': password, 'sessionId': sessionId, 'fullName': fullName,
    // 'todoList': array of {'id': itemId, 'content': content, 'status': 'inProcess/completed'}}
    this.data = {};

    // for debug use
    this.data['tal'] = {'password': 'pass', 'sessionId': '0', 'fullName': 'fullName', 'lastConn': new Date(), 'todoList': []};
    // end debug
}

DataModule.prototype.addUser = function(username, password, sessionId, fullName) {

    if (this.isRegisteredUser(username)) {
        return {'status': FAILURE_STATUS, 'msg': USERNAME_IN_USED};
    }

    this.data[username] = {'password': password, 'sessionId': sessionId, 'fullName': fullName, 'lastConn': new Date(), 'todoList': []};

    return {'status': SUCCESS_STATUS, 'msg': ''};
};


DataModule.prototype.addToDo = function(username, sessionId, itemId, content) {
    if (this.isValidRequest(username, sessionId)) {

        // todo: i need to verify that itemId does not exist !!

        this.data[username]['todoList'].push({'id': itemId, 'content': content, 'status': ACTIVE_ITEM_CODE});
        this.updateLastConnection(username);
        return {'status': SUCCESS_STATUS, 'msg': ''};
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

        return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};




DataModule.prototype.deleteTodoItem = function(username, sessionId, itemId) {
    var index;

    if (this.isValidRequest(username, sessionId)) {
        if (itemId === -1) {
            this.deleteAllCompleted(username);
            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        index = this.getListIndex(username, itemId);

        if (index !== -1) {
            this.data[username]['todoList'].slice(index, 1);
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

    for (i=0; i<len; i++) {
        if (listArray[i]['status'] === COMPLETED_ITEM_CODE) {
            this.data[username]['todoList'].slice(i, 1);
        }
    }
};


DataModule.prototype.getAllTodoList = function(username, sessionId) {

    if (this.isValidRequest(username, sessionId)) {
        this.updateLastConnection(username);
        return {'status': SUCCESS_STATUS, 'msg': this.data[username]['todoList']};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.isRegisteredUser = function (username) {
    return (this.data[username] !== undefined);
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