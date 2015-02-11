/**
 * Created by Alon Ben-Shimol & Tal Orenstein on 03/02/2015.
 * This file manages the database of the items on the backend side.
 */

var jquery = require('./jquery-2.1.3.js');

var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var ACTIVE_ITEM_CODE = '0';
var COMPLETED_ITEM_CODE = '1';
var USERNAME_IN_USED = 'The chosen username is in used. Please choose different username';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';
var INVALID_LOGIN_INPUTS = 'invalid username and/or password';
var EXPIRATION_TIME = 30;


/**
 * Constructor for a data module.
 */
function DataModule() {

    this.data = {};
    this.sessionIdToUsernameMap = {};
}

/**
 * Adds a new user to the data base.
 * @param username - the user's name
 * @param password - the user's password
 * @param sessionId - the user's session id
 * @param fullName - the user's full name
 * @returns message with approval or disapproval of the request to the remote end.
 */
DataModule.prototype.addUser = function(username, password, sessionId, fullName) {

    if (this.isRegisteredUser(username)) {
        return {'status': FAILURE_STATUS, 'msg': USERNAME_IN_USED};
    }

    this.data[username] = {'password': password, 'sessionId': sessionId, 'fullName': fullName, 'lastConn': new Date(), 'todoList': []};
    this.sessionIdToUsernameMap[sessionId] = username;

    return {'status': SUCCESS_STATUS, 'msg': ''};
};


/**
 * Adds a new item for the currently logged-on session.
 * @param sessionId - the currently logged-on session
 * @param itemId - new item's id
 * @param content - the content of the new item
 */
DataModule.prototype.addToDo = function(sessionId, itemId, content) {

    var username = this.sessionIdToUsernameMap[sessionId];

    if (this.isValidRequest(sessionId)) {

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


/**
 * Updates the content and status (possibly both) of an existing item.
 */
DataModule.prototype.changeTodoItem = function(sessionId, itemId, newStatus, newContent) {

    var index;
    var username = this.sessionIdToUsernameMap[sessionId];

    if (this.isValidRequest(sessionId)) {

        index = this.getListIndex(username, itemId);

        if (index !== -1 && itemId >= 0) {

            if (newStatus === ACTIVE_ITEM_CODE || newStatus === COMPLETED_ITEM_CODE) {
                this.data[username]['todoList'][index]['status'] = newStatus;
            }

            if (newContent !== undefined) {
                this.data[username]['todoList'][index]['content'] = newContent;
            }


            this.updateLastConnection(username);
            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        else if (newStatus !== undefined && itemId === '-1') {  //change status to all items

            var len = this.data[username]['todoList'].length;
            var i;

            for (i = 0; i < len; ++i) {
                this.data[username]['todoList'][i]['status'] = newStatus;
            }

            return {'status': SUCCESS_STATUS, 'msg': ''};
        }

        return {'status': FAILURE_STATUS, 'msg': INVALID_ITEM_ID};
    }

    return {'status': FAILURE_STATUS, 'msg': UNAUTHORIZED_USER};
};


/**
 * Deletes an item from the DB (if exists)
 */
DataModule.prototype.deleteTodoItem = function(sessionId, itemId) {

    var index;
    var username = this.sessionIdToUsernameMap[sessionId];

    if (this.isValidRequest(sessionId)) {

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


/*
 * Returns the index of an item of a specific user
 */
DataModule.prototype.getListIndex = function(username, itemId) {
    var i;
    var listArray = this.data[username]['todoList'];
    var len = listArray.length;

    if (itemId === -1) return -1;

    for (i=0; i<len; i++) {
        if (listArray[i]['id'] === itemId) {
            return i;
        }
    }

    return -1;
};


/**
 * Deletes all completed tasks for a specific user
 */
DataModule.prototype.deleteAllCompleted = function(username) {

    var i;
    var listArray = this.data[username]['todoList'];

    for (i = listArray.length-1 ; i >= 0 ; --i) {
        if (listArray[i]['status'] === COMPLETED_ITEM_CODE) {
            this.data[username]['todoList'].splice(i, 1);
        }
    }
};


/**
 * Returns all the items of a specific user
 */
DataModule.prototype.getAllTodoList = function(sessionId) {
    var username = this.sessionIdToUsernameMap[sessionId];

    if (this.isValidRequest(sessionId)) {
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


/**
 * Returns true is 'username' already exists in this server's DB, and false otherwise.
 */
DataModule.prototype.isRegisteredUser = function (username) {
    return (this.data[username] !== undefined);
};


/**
 * Returns true if current login information was given (matching username and password)
 */
DataModule.prototype.isCorrectLoginInputs = function(username, password) {
    if (username !== undefined && this.data[username] !== undefined && this.data[username]['password'] === password) {
        return {'status': SUCCESS_STATUS, 'msg': ''};
    }

    return {'status': FAILURE_STATUS, 'msg': INVALID_LOGIN_INPUTS};
};


/**
 * Sets the username session id.
 */
DataModule.prototype.setSessionId = function(username, sessionId) {
    if (username !== undefined) {
        // delete the previous session id
        delete this.sessionIdToUsernameMap[this.data[username]['sessionId']];

        this.data[username]['sessionId'] = sessionId;
        this.sessionIdToUsernameMap[sessionId] = username;
    }
};


/**
 * Checks if a specific session is yet to be expired. (30 minutes)
 */
DataModule.prototype.isValidRequest = function(sessionId) {

    var username = this.sessionIdToUsernameMap[sessionId];
    var currTime = new Date();

    if (this.data[username] !== undefined && this.data[username]['sessionId'] === sessionId &&
        username !== undefined && sessionId !== undefined) {

        if (new Date(currTime - this.data[username]['lastConn']).getMinutes() <= EXPIRATION_TIME) {
            return true;
        }
    }

    return false;
};


/**
 * Only opon valid request (for instance - add new item) we extend the time of the current
 * session - to allow disconnection of the remove and after x time, and with continuous usage.
 */
DataModule.prototype.updateLastConnection = function (username) {
    this.data[username]['lastConn'] = new Date();
};


module.exports = DataModule;