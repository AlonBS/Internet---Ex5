/**
 * Created by orenstal on 03/02/2015.
 */


// todo maybe we should use 'const' instead of 'var' (checks ES !)
var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';


function DataModule() {
    // key: username, value: {'password': password, 'sessionId': sessionId, 'fullName': fullName, 'listLength': 0,
    // 'todoList': array of {'content': content, 'status': 'inProcess/completed'}}
    this.data = {};
}

DataModule.prototype.addUser = function(username, password, sessionId, fullName) {
    //var that = this;

    if (this.isRegisteredUser(username)) {
        return {'status': FAILURE_STATUS, 'msg': USERNAME_IN_USED};
    }

    this.data[username] = {'password': password, 'sessionId': sessionId, 'fullName': fullName, 'listLength': 0, 'todoList': []};

    return {'status': SUCCESS_STATUS};
};


DataModule.prototype.addToDo = function(username, sessionId, content) {
    if (this.isValidRequest(username, sessionId)) {
        this.data[username]['todoList'].push({'content': content, 'status': 'inProcess'});
        this.data[username]['listLength'] = this.data[username]['listLength']+1;
        return {'status': SUCCESS_STATUS};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};

DataModule.prototype.changeTodoStatus = function(username, sessionId, itemId, newStatus) {
    if (this.isValidRequest(username, sessionId)) {
        if (!this.isValidItemId(username, itemId)) {
            return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
        }

        this.data[username]['todoList'][itemId]['status'] = newStatus;
        return {'status': SUCCESS_STATUS};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.deleteTodoItem = function(username, sessionId, itemId) {
    if (this.isValidRequest(username, sessionId)) {
        if (!this.isValidItemId(username, itemId)) {
            return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
        }

        this.data[username]['todoList'].slice(itemId, 1);
        this.data[username]['listLength'] = this.data[username]['listLength']-1;

        return {'status': SUCCESS_STATUS};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.getAllTodoList = function(username, sessionId) {

    if (this.isValidRequest(username, sessionId)) {
        return {'status': SUCCESS_STATUS, 'msg': {'listLength': this.data[username]['listLength'],
            'todoList': this.data[username]['todoList']}};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


DataModule.prototype.isRegisteredUser = function (username) {
    //var that = this;
    return (this.data[username] !== undefined)
};


DataModule.prototype.isValidItemId = function(username, itemId) {
    return (itemId > -1 && itemId < this.data[username]['listLength']);
}


DataModule.prototype.isValidRequest = function(username, sessionId) {
    return (this.data[username] !== undefined && this.data[username]['sessionId'] === sessionId);
}

module.exports = DataModule;