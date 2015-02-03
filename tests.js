/**
 * Created by orenstal on 03/02/2015.
 */

var dataModule = require('./dataModule.js');

var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';


function checkTest(testId, result, expectedStatus, expectedFailureMsg) {
    if (result['status'] !== expectedStatus) {
        console.log("failed test " + testId + ". received: " + result['status'] + ", expected: " + expectedStatus);
        return;
    }


    if (result['status'] === dataModule.FAILURE_STATUS && result['msg'] !== expectedFailureMsg) {
        console.log("failed test " + testId + ". received: " + result['msg'] + ", expected: " + expectedFailureMsg);
        return;
    }

    console.log("pass test " + testId);

    //
    //if (result['status'] === SUCCESS_STATUS)
    //    console.log("status: success");
    //else
    //    console.log("status: failure, reason: " + result['msg']);
}

function runDataModuleTests() {

    var serverDB = new dataModule();

    checkTest(0, serverDB.addUser("orenstal", "talPass", "13", "tal orenstein"), SUCCESS_STATUS);
    checkTest(1, serverDB.addUser("lzohar", "lirazPass", "17", "liraz zohar"), SUCCESS_STATUS);

    console.log("----------------------------------------");

    checkTest(2, serverDB.addToDo("orenstal", "13", "tal first to do item"), SUCCESS_STATUS);
    checkTest(3, serverDB.addToDo("orenstal", "13", "tal second to do item"), SUCCESS_STATUS);
    checkTest(4, serverDB.addToDo("orenstal", "13", "tal third to do item"), SUCCESS_STATUS);
    checkTest(5, serverDB.changeTodoStatus("orenstal", "13", 2, "completed"), SUCCESS_STATUS); // the third item
    checkTest(6, serverDB.changeTodoStatus("orenstal", "13", 0, "completed"), SUCCESS_STATUS); // the first item

    console.log("----------------------------------------");

    checkTest(7, serverDB.changeTodoStatus("orenstal", "13", 0, "inProcess"), SUCCESS_STATUS); // the first item

    console.log("----------------------------------------");

    checkTest(7, serverDB.addToDo("lzohar", "17", "liraz first to do item"), SUCCESS_STATUS);
    checkTest(8, serverDB.addToDo("lzohar", "17", "liraz second to do item"), SUCCESS_STATUS);
    checkTest(9, serverDB.changeTodoStatus("lzohar", "17", 0, "completed"), SUCCESS_STATUS); // the first item

    console.log("----------------------------------------");

    checkTest(10, serverDB.deleteTodoItem("orenstal", "13", 2), SUCCESS_STATUS);    // the third item
    checkTest(11, serverDB.deleteTodoItem("orenstal", "13", 0), SUCCESS_STATUS);    // the first item

    console.log("----------------------------------------");

    checkTest(12, serverDB.deleteTodoItem("lzohar", "17", 0), SUCCESS_STATUS);  // the first item
    checkTest(13, serverDB.deleteTodoItem("lzohar", "17", 0), SUCCESS_STATUS);  // the first left item

    console.log("----------------------------------------");

    checkTest(14, serverDB.deleteTodoItem("orenstal", "13", 0), SUCCESS_STATUS);    // the first left item

    console.log("----------------------------------------");

    checkTest(15, serverDB.addUser("orenstal", "otherPass", "12", "someone"), FAILURE_STATUS, USERNAME_IN_USED);

    console.log("----------------------------------------");

    checkTest(16, serverDB.addToDo("bla", "13", "some content"), FAILURE_STATUS, UNAUTHORIZED_USER);

    checkTest(17, serverDB.changeTodoStatus("bla", "13", 0, "completed"), FAILURE_STATUS, UNAUTHORIZED_USER);

    checkTest(18, serverDB.deleteTodoItem("orenstal", "13", 9), FAILURE_STATUS, INVALID_ITEM_ID);

    checkTest(19, serverDB.deleteTodoItem("bla", 13, 0), FAILURE_STATUS, UNAUTHORIZED_USER);

    console.log("----------------------------------------");
}

runDataModuleTests();
