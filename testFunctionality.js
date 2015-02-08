/**
 * Created by orenstal on 03/02/2015.
 */

var dataModule = require('./www/dataModule.js');

var FAILURE_STATUS = 1;
var SUCCESS_STATUS = 0;
var ACTIVE_ITEM_CODE = 0;
var COMPLETED_ITEM_CODE = 1;
var USERNAME_IN_USED = 'This username in used';
var UNAUTHORIZED_USER = 'Unauthorized user';
var INVALID_ITEM_ID = 'invalid itemId';


function checkTest(testId, result, expectedStatus, expectedFailureMsg) {
    if (result['status'] !== expectedStatus) {
        console.log("failed test " + testId + ". received: " + result['status'] + ", expected: " + expectedStatus);
        return;
    }


    if (result['status'] === FAILURE_STATUS && result['msg'] !== expectedFailureMsg) {
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

    checkTest(2, serverDB.addToDo("orenstal", "13", 0, "tal first to do item"), SUCCESS_STATUS);  // itemId: 0
    checkTest(3, serverDB.addToDo("orenstal", "13", 1, "tal second to do item"), SUCCESS_STATUS); // itemId: 1
    checkTest(4, serverDB.addToDo("orenstal", "13", 2, "tal third to do item"), SUCCESS_STATUS);  // itemId: 2
    //checkTest(5, serverDB.changeTodoStatus("orenstal", "13", 2, "completed"), SUCCESS_STATUS); // the third item
    //checkTest(6, serverDB.changeTodoStatus("orenstal", "13", 0, "completed"), SUCCESS_STATUS); // the first item
    checkTest(5, serverDB.changeTodoItem("orenstal", "13", 2, COMPLETED_ITEM_CODE), SUCCESS_STATUS); // the third item
    checkTest(6, serverDB.changeTodoItem("orenstal", "13", 0, COMPLETED_ITEM_CODE), SUCCESS_STATUS); // the first item

    console.log("----------------------------------------");

    //checkTest(7, serverDB.changeTodoStatus("orenstal", "13", 0, "inProcess"), SUCCESS_STATUS); // the first item
    checkTest(7, serverDB.changeTodoItem("orenstal", "13", 0, ACTIVE_ITEM_CODE), SUCCESS_STATUS); // the first item

    console.log("----------------------------------------");

    checkTest(7, serverDB.addToDo("lzohar", "17", 3, "liraz first to do item"), SUCCESS_STATUS);  // itemId: 3
    checkTest(8, serverDB.addToDo("lzohar", "17", 4, "liraz second to do item"), SUCCESS_STATUS); // itemId: 4
    //checkTest(9, serverDB.changeTodoStatus("lzohar", "17", 3, "completed"), SUCCESS_STATUS);   // change itemId 3
    checkTest(9, serverDB.changeTodoItem("lzohar", "17", 3, COMPLETED_ITEM_CODE, "new content !!"), SUCCESS_STATUS);   // change itemId 3

    console.log("----------------------------------------");

    checkTest(10, serverDB.deleteTodoItem("orenstal", "13", 2), SUCCESS_STATUS);
    checkTest(11, serverDB.deleteTodoItem("orenstal", "13", 0), SUCCESS_STATUS);

    console.log("----------------------------------------");

    checkTest(12, serverDB.deleteTodoItem("lzohar", "17", 3), SUCCESS_STATUS);  // the first item
    checkTest(13, serverDB.deleteTodoItem("lzohar", "17", 4), SUCCESS_STATUS);  // the first left item

    console.log("----------------------------------------");

    checkTest(14, serverDB.deleteTodoItem("orenstal", "13", 1), SUCCESS_STATUS);    // the first left item

    console.log("----------------------------------------");

    checkTest(15, serverDB.addUser("orenstal", "otherPass", "12", "someone"), FAILURE_STATUS, USERNAME_IN_USED);
    //checkTest(16, serverDB.changeTodoStatus("lzohar", "17", 0, "completed"), FAILURE_STATUS, INVALID_ITEM_ID);
    checkTest(16, serverDB.changeTodoItem("lzohar", "17", 0, COMPLETED_ITEM_CODE), FAILURE_STATUS, INVALID_ITEM_ID);

    console.log("----------------------------------------");

    checkTest(17, serverDB.addToDo("bla", "13", "some content"), FAILURE_STATUS, UNAUTHORIZED_USER);

    //checkTest(18, serverDB.changeTodoStatus("bla", "13", 0, "completed"), FAILURE_STATUS, UNAUTHORIZED_USER);
    checkTest(18, serverDB.changeTodoItem("bla", "13", 0, COMPLETED_ITEM_CODE), FAILURE_STATUS, UNAUTHORIZED_USER);

    checkTest(19, serverDB.deleteTodoItem("orenstal", "13", 9), FAILURE_STATUS, INVALID_ITEM_ID);

    checkTest(20, serverDB.deleteTodoItem("bla", 13, 0), FAILURE_STATUS, UNAUTHORIZED_USER);

    console.log("----------------------------------------");
}

/*var d1 = new Date();
//d1.getTime();
console.log("d1: " + d1);

setTimeout(function() {
    var d2 = new Date();
    //d2.getTime();
    console.log("d2: " + d2);

    var d3 = new Date(d2-d1).getMinutes();
    console.log(d3);
}, 61000);*/


runDataModuleTests();
