/**
 * Client Side.js - created By Alon Ben-Shimol & Tal Orenstein
 * Notes: this files contains the logic for both the login screen and the todo-lts
 * screen. The reason for that is to reduce as much as possible the number of http requests
 * from the server.
 * (This was a recommendation we read in many places:
 *  https://developer.yahoo.com/performance/rules.html
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                            login and registration page
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sets the click listener for the register-button.
 * This function also performs some input tests - in order to give one additional layer
 * of security before data is actually sent to the server
 */
function setRegisterListener() {

    $("#reg_submit").on("click", function () {

        console.log("on register..");

        var fullname = $("#reg_fullname").val();
        var username = $("#reg_username").val();
        var pass = $("#reg_password").val();
        var passVerification = $("#reg_password_verification").val();

        // in case some information is missing - we won't continue with registration
        emphasizesMissingRegisterData(fullname, username, pass, passVerification);
        if (!fullname || !username || !pass || !passVerification) {
            $("#loginPage_error_msg").text("Please fill in the missing information.");
            return;
        }

        // input legality testing
        var checkNameAndUsernameRegex = /^[A-Za-z0-9 _]{3,20}$/;
        var checkPasswordRegex = /^[A-Za-z0-9 _]{6,20}$/;

        if (!checkNameAndUsernameRegex.test(fullname)) {
            console.log("Illegal full name (not [a-zA-Z0-9 _]");
            $("#loginPage_error_msg").text("Full name must 3-20 characters long and include either letters numbers, spaces or underscores.");
            $("#reg_fullname").css({"border-color": "red"});
            return;

        }

        if (!checkNameAndUsernameRegex.test(username)) {
            console.log("Illegal user name (not [a-zA-Z0-9 _]");
            $("#loginPage_error_msg").text("Username must be 3-20 characters long and include either letters numbers, spaces or underscores.");
            $("#reg_username").css({"border-color": "red"});
            return;
        }

        if (!checkPasswordRegex.test(pass)) {
            console.log("password must include 6-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            $("#loginPage_error_msg").text("password must be 6-20 characters long and include either letters numbers, spaces or underscores.");
            $("#reg_password").css({"border-color": "red"});
            return;
        }

        if (pass !== passVerification) {
            console.log("Passwords mismatch");
            $("#loginPage_error_msg").text("Passwords verification failed. Passwords mismatch.");
            $("#reg_password").css({"border-color": "red"});
            $("#reg_password_verification").css({"border-color": "red"});
            return;
        }


        //if got here - everything is ok, character-wise

        $("#loginPage_error_msg").text("");
        console.log("send to server: fullname: " + fullname + ", username: " + username + ", pass: " + pass);
        $.ajax({
            type: "POST",
            url: "/register",
            data: {username: username, fullname: fullname, password: pass},
            success: function (data)
            {

                if (data['status'] === 0 ) {
                    showTodoListPage();
                }
                else {
                    console.log(data['msg']);
                    $("#loginPage_error_msg").text(data['msg']);
                }
            },
            error: function ()
            {
                console.log("Used username: " + username);
                $("#loginPage_error_msg").text("The chosen username is in use. Please choose a different one.");
            }
        });
    });
}


/**
 * Sets the click listener for the login-button.
 * This function also performs some input tests - in order to give one additional layer
 * of security before data is actually sent to the server
 */
function setLoginListener() {

    $("#login_submit").on("click", function () {

        var username = $("#login_username").val();
        var pass = $("#login_password").val();

        emphasizesMissingLoginData(username, pass);
        if (!username || !pass) {
            $("#loginPage_error_msg").text("Please fill in the missing information.");
            return;
        }

        var checkUsernameRegex = /^[A-Za-z0-9 _]{3,20}$/;
        var checkPasswordRegex = /^[A-Za-z0-9 _]{6,20}$/;

        if (!checkUsernameRegex.test(username) || !checkPasswordRegex.test(pass)) {
            console.log("Invalid username and/or password.");
            $("#loginPage_error_msg").text("Invalid username and/or password.");
            return;
        }

        // If got here, everythinkg is ok, character-wise

        $("#loginPage_error_msg").text("");
        $.ajax({
            type: "GET",
            url: "/login",
            data: {username: username, password: pass},
            success: function (data)
            {
                if (data['status'] === 0 ) {
                    showTodoListPage();
                }
                else {
                    console.log(data['msg']);
                    $("#loginPage_error_msg").text(data['msg']);
                }
            },
            error: function ()
            {
                console.log("Invalid username or password requested from server");
                $("#loginPage_error_msg").text("Invalid username or password, Please try again.");
            }
        });
    });
}


/*
 * Shows the user what fields he/she forgot to fill-in
 */
function emphasizesMissingRegisterData(fullname, username, pass, passVerification) {

    fullname ? $("#reg_fullname").css({ "border-color": ""}) : $("#reg_fullname").css({"border-color": "red"});
    username ? $("#reg_username").css({"border-color": ""}) : $("#reg_username").css({"border-color": "red"});
    pass ? $("#reg_password").css({ "border-color": ""}) : $("#reg_password").css({"border-color": "red"});
    passVerification ? $("#reg_password_verification").css({ "border-color": ""}) : $("#reg_password_verification").css({"border-color": "red"});

    $("#login_username").css({"border-color": ""});
    $("#login_password").css({ "border-color": ""});
}


/*
 * Shows the user what fields he/she forgot to fill-in
 */
function emphasizesMissingLoginData(username, pass) {

    username ? $("#login_username").css({"border-color": ""}) : $("#login_username").css({"border-color": "red"});
    pass ? $("#login_password").css({ "border-color": ""}) : $("#login_password").css({"border-color": "red"});

    $("#reg_fullname").css({ "border-color": ""});
    $("#reg_username").css({"border-color": ""});
    $("#reg_password").css({ "border-color": ""});
    $("#reg_password_verification").css({ "border-color": ""});
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                      to-do list page
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var nextId;             /* Holds the next available id for a new item */
var uncompletedItems;   /* Holds the number of uncompleted tasks */
var completedItems;     /* Holds the number of completed tasks */
var itemsStatus;        /* Maps an item to its status */


/**
 * Adds the input listener. This will take user input upon 'enter' or when
 * focus is changed.
 */
function setInputEventListener() {

    var newItem = $("#add_new_item");

    // bind on key press event to allow new item
    newItem.bind("keypress", function(e) {

        var keyCode;
        if (!e) e = window.event;
        keyCode = e.keyCode || e.which;

        // verify that not only 'enter' is pressed
        if (keyCode === 13 && newItem.val().length >= 1) requestAddNewItem();
    });


    $("#add_new_item").focusout(function() {
        var contentLen = $("#add_new_item").val().length;
        if (contentLen >= 1) requestAddNewItem();
    });
}


/**
 * Requests the server for a new item to be added into the items list.
 * Only upon success (signaled by the server) this item is added
 */
function requestAddNewItem()
{
    var inputField = $("#add_new_item");
    var content = scanUserInput(inputField.val()); // a security tests is performed here
    var itemId = (nextId++).toString();

    // todo i need to prevent xss and other attacks !!
    // TODO: Alon - go for it! but i really don't think you need to.
    // TODO: IOSI!

    $.ajax({
        type: "POST",
        url: "/item",
        data: {id: itemId, value: content},
        success: function (data)
        {
            if (data['status'] === 0 ) { // only upon success we display new item

                appendNewItem(itemId, 0, decodeURIComponent(content)); // new item is always uncompleted by default
                inputField.val('');
            }
            else {

                console.log("Unable to add item with id: " + itemId + ", with content: " + content);
                $("#errorMsg").text("Failed to add new item.");
            }
        }
    });
}


/**
 * This user performs a (client-side) security test on the user input. This method
 * is used in order to assure that the user input (given in a new 'add item' event) is legal,
 * and does not contain and scripting or injections of any kind.
 * @param content - the content of the new item as given by the user
 * @returns the content of the new item, after check it is ok, and after changing any
 * characters that could lead to attacks ('<' etc.).
 */
function scanUserInput(content) {
    if (content === undefined) return;

    console.log("content: " + content);

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
        content = content.replace(/<|%3C/g, '(');
        content = content.replace(/>|%3E/g, ')');
    }

    return content;
}


/**
 * This function is called only after approval to append a new item is given by the server.
 * This means that the server was able to successfully add the new item to its data-base, and
 * so the application should display the user with the right content of the message, a lot with
 * all the other features of the mvcTodo app.
 */
function appendNewItem(id, status, content) {

    var itemsStr;
    (status === 1) ? (++completedItems) : (++uncompletedItems);

    itemsStatus[id] = status;

    // appends the new data to the table
    $("#items_table tbody").append(
        "<tr id=tr-" + id + ">" +
        "<td class='item_status'>&rArr;</td>" +
        "<td class='item_content'>" + content + "</td>" +
        "<td><button class='delete_icon'/></td>" +
        "</tr>");


    // creates a mark 'x' for each row - to be displayed only when hover
    $("#tr-"+id).unbind().hover(
        function () {
            var btn = $(this).find('button');
            btn.show(1);
        },
        function () {
            var btn = $(this).find('button');
            btn.hide(1);
        }
    );

    // assign classes to this item (in case it was already stored before)
    if (status === 1) {
        $("#tr-"+id).children("td:nth-child(1)").toggleClass("item_completed_sign");
        $("#tr-"+id).children("td:nth-child(2)").toggleClass("item_completed_content");
    }

    $('#change_all_statuses').prop('checked',false);
    $("#change_all_statuses").show();
    $("#items_track").show();


    itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);
    $("#items_div").show(200);

    //sets the different events each item has - change status, edit or delete
    setChangeStatus();
    setEditContent();
    setDeleteImage();
}


/**
 * Defines the event 'change status' on a newly created event
 */
function setChangeStatus() {

    // update status of item
    $(".item_status").unbind().click(function() {

        var tr = $(this).parent();
        var itemId = tr.attr('id').substring(tr.attr('id').indexOf('-') + 1);
        var newItemStatus = (1 - itemsStatus[itemId]);

        $.ajax({
            type: "PUT",
            url: "/item",
            data: {id: itemId, value: undefined, status: newItemStatus },
            success: function (data)
            {
                if (data['status'] === 0 )  // only upon success we change status of item
                {

                    var itemsStr;
                    $("#errorMsg").html("&nbsp;");
                    itemsStatus[itemId] = newItemStatus;

                    tr.children("td:nth-child(1)").toggleClass("item_completed_sign");
                    tr.children("td:nth-child(2)").toggleClass("item_completed_content");

                    // update the number of total remaining completed and uncompleted tasks
                    newItemStatus === 1 ? (++completedItems , --uncompletedItems) : (--completedItems , ++uncompletedItems);

                    if (completedItems > 0 && uncompletedItems === 0)  // all the items were completed
                    {
                        $('#change_all_statuses').prop('checked',true);
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                    }

                    else
                    {
                        $('#change_all_statuses').prop('checked',false);
                        if (completedItems > 0) {
                            $("#clear_completed").html("Clear completed.");
                            $("#clear_completed").show();
                        }
                        else {
                            $("#clear_completed").hide();
                        }
                    }

                    itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);
                }
                else // request failed
                {
                    console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                    $("#errorMsg").text("Failed to change item status: " + data['msg']);
                }
            }
        });
    });
}


/**
 * Sets the change all status listener. This allows the user to choose all his
 * tasks, and mark them as uncompleted.
 */
function setChangeAllStatusesListener() {

    // update status of item
    $("#change_all_statuses_checkbox").on('click', "#change_all_statuses", (function() {

        var everyoneAlreadyCompleted = (completedItems > 0 && uncompletedItems === 0);
        var newStatus = 1;

        if (everyoneAlreadyCompleted) newStatus = 0;

        $.ajax({
            type: "PUT",
            url: "/item",
            data: {id: -1, value: undefined, status: newStatus },
            success: function (data)
            {
                var itemsStr;
                if (data['status'] === 0 ) { // only upon success we change status of item

                    $("#errorMsg").html("&nbsp;");
                    $('#items_table > tbody  > tr').each(function() {

                        var currentRow = $(this); // cache this constructor
                        var trId = $(currentRow).attr('id').substring($(currentRow).attr('id').indexOf('-') + 1);

                        if (everyoneAlreadyCompleted) {
                            itemsStatus[trId] = 0;
                            --completedItems;
                            ++uncompletedItems;
                            currentRow.children("td:nth-child(1)").toggleClass("item_completed_sign");
                            currentRow.children("td:nth-child(2)").toggleClass("item_completed_content");
                        }
                        else if (itemsStatus[trId] === 0) {
                            itemsStatus[trId] = 1;
                            ++completedItems;
                            --uncompletedItems;
                            currentRow.children("td:nth-child(1)").toggleClass("item_completed_sign");
                            currentRow.children("td:nth-child(2)").toggleClass("item_completed_content");
                        }
                    });

                    if (completedItems > 0) {
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                        $('#change_all_statuses').prop('checked',true);
                    }
                    else {
                        $("#clear_completed").hide();
                        $('#change_all_statuses').prop('checked',false);
                    }

                    itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);

                }
                else {
                    console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                    $("#errorMsg").text("Failed to change items status: " + data['msg']);
                }
            }
        });
    }));
}


/**
 * Enables the user to edit a content of an item after it was already inserted.
 */
function setEditContent() {

    var todoElement, currContent;

    // update content of item
    $(".item_content").unbind().dblclick(function (e) {

        var tr = $(this).parent();
        var itemId = tr.attr('id').substring(tr.attr('id').indexOf('-') + 1);
        var len;

        todoElement = $(this);
        currContent = $(this).html();

        $(todoElement).html('<input class="todoUpdateContent" type="text" value="' + currContent + '" />');

        // move the cursor to the last char
        len= $(".todoUpdateContent").val().length * 2;
        $(".todoUpdateContent").focus();
        $(".todoUpdateContent")[0].setSelectionRange(len, len);


        $(".todoUpdateContent").focusout(function() {
            requestUpdateTodoContent(itemId);
        });

        $(".todoUpdateContent").dblclick(function() {
            requestUpdateTodoContent(itemId);
        });

        $(".todoUpdateContent").keyup(function (event) {
            if (event.keyCode == 13) {
                requestUpdateTodoContent(itemId);
            }
        });
    });
}

/**
 * Requests the server to update the content of an existing todo-item.
 */
function requestUpdateTodoContent(itemId) {

    var $this = $(".todoUpdateContent");

    $.ajax({
        type: "PUT",
        url: "/item",
        data: {id: itemId, value: $this.val(), status: itemsStatus[itemId] },
        success: function (data)
        {
            if (data['status'] === 0 ) { // only upon success we change status of item
                $("#errorMsg").html("&nbsp;");
                $this.parent().text($this.val());
                $this.remove();
            }
            else {
                console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                $("#errorMsg").text("Failed to update item content: " + data['msg']);
            }
        }
    });
}


/**
 * Sets the delete item event for a newly created item.
 */
function setDeleteImage() {

    // delete item
    $(".delete_icon").unbind().on("click", function(e) { // we don't delete only until approved by server

        var tr = $(this).parent().parent();
        var itemId = tr.attr('id').substring(tr.attr('id').indexOf('-') + 1);
        var itemStatus = itemsStatus[itemId];

        $.ajax({
            type: "DELETE",
            url: "/item",
            data: {id: itemId},
            success: function (data)
            {
                var itemsStr;

                if (data['status'] === 0 ) { // only upon success we delete this row
                    $("#errorMsg").html("&nbsp;");
                    tr.remove();
                    (itemStatus === 1) ? --completedItems : --uncompletedItems;

                    if (completedItems > 0 && uncompletedItems === 0) { // all the items were completed
                        $('#change_all_statuses').prop('checked',true);
                    }
                    else {
                        $('#change_all_statuses').prop('checked',false);

                        if (completedItems > 0) {
                            $("#clear_completed").html("Clear completed.");
                            $("#clear_completed").show();
                            $("#change_all_statuses").show();
                        }
                        else {
                            $("#clear_completed").hide();
                        }
                    }

                    itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);

                    if (completedItems + uncompletedItems === 0) {
                        //$("#change_all_statuses").checked = false;
                        $('#change_all_statuses').prop('checked',false);
                        $("#change_all_statuses").hide();
                        $("#items_div").hide(200);
                    }

                }

                else {
                    console.log("Unable to delete item with id: " + itemId + ", with content: " + tr.children("td:nth-child(2)").val());
                    $("#errorMsg").text("Failed to delete item: " + data['msg']);
                }
            }
        });
    });


    // sets the animation for hover on 'x' mark
    $(".delete_icon").hover(
        function() { // delete item hover-on animate
            $(this).fadeTo(100, 1);
        },
        function() { // delete item hover-out animate
            $(this).fadeTo(100, 0.4);
        }
    );
}


/**
 * Loads all the items currently held (if any) by the server for this specific session.
 */
function loadItems() {

    //request all items
    $.get("/item", function(data) {

        var items, numOfItems, id, status, content ;
        if (data['status'] === 1) {

            console.log("Failed to receive all items. Reason: " + data['msg']);
            $("#errorMsg").text("Failed to load items: " + data['msg']);
            return;
        }

        $("#errorMsg").html("&nbsp;");
        $("#change_all_statuses_checkbox").append("<input id='change_all_statuses' type='checkbox'>" +
        "<label for='change_all_statuses'>Mark all as complete</label>");

        items = data['msg']['list'];

        nextId = data['msg']['nextId']; //If we now loaded n tasks from server, we want id assign to start with n+1
        numOfItems = items.length;

        for (var i = 0 ; i < numOfItems; ++i) {

            id = items[i]['id'];
            status = items[i]['status'];
            content = decodeURIComponent(items[i]['content']);

            appendNewItem(id, parseInt(status), content);
        }

        if (completedItems > 0) {
            $("#clear_completed").html("Clear completed.");
            $("#clear_completed").show();
        }

        // display 'change all' button
        $('#change_all_statuses').prop('checked',false);

        if (numOfItems === 0 ) {
            $("#change_all_statuses").hide();
        }
        else if (completedItems > 0 && completedItems === numOfItems) {
            $('#change_all_statuses').prop('checked',true);
        }
    });
}


/**
 * Sets the clear all completed tasks event-listener.
 */
function setClearCompletedListener() {

    //sets clear-completed onclick event
    $("#clear_completed").on("click", function () {

        $.ajax({
            type: "DELETE",
            url: "/item",
            data: {id: -1},
            success: function (data)
            {
                var currentRow, trId;

                if (data['status'] === 0 ) { // only upon success we delete all rows
                    $("#errorMsg").html("&nbsp;");

                    $('#items_table > tbody  > tr').each(function() {

                        currentRow = $(this); // cache this constructor
                        trId = $(currentRow).attr('id').substring($(currentRow).attr('id').indexOf('-') + 1);
                        if (itemsStatus[trId]) {
                            --completedItems;
                            $(this).remove();
                        }
                    });

                    $("#clear_completed").hide();
                    $('#change_all_statuses').prop('checked',false);

                    if (uncompletedItems === 0) {
                        $("#change_all_statuses").hide();
                        $("#items_track").hide();
                    }
                }
                else {
                    console.log("Unable to delete all items. Reason: " + data['msg']);
                    $("#errorMsg").text("Failed to clear completed items: " + data['msg']);
                }
            }
        });
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                             Initial request from server
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Main execution starts from here
$(function() {

    nextId = uncompletedItems = completedItems = 0;
    itemsStatus = {}; // itemsStatus[id] -> returns the status of the item with id 'id'.

    $.ajax({
        type: "GET",
        url: "/showPage",
        success: function (data)
        {
            if (data['page'] === 'todolist' ) {
                showTodoListPage();
            }
            else if (data['page'] === 'login' ){
                showLoginPage();
            }
        }
    });
});


/**
 * Displays the logic to allow user to perform registration or login
 */
function showLoginPage() {

    console.log("show login page..");

    $("#loginPage").show();
    $("#todo_list_page").hide();

    // register form
    setRegisterListener();

    // login form
    setLoginListener();
}


/**
 * If the user is identified (by a valid session) or has completed the registration successfully,
 * or logged-in successfully, the todo-list is displayed.
 */
function showTodoListPage() {

    console.log("show todo list page..");

    $("#loginPage").hide();
    $("#todo_list_page").show();

    setInputEventListener();

    loadItems();

    setClearCompletedListener();

    setChangeAllStatusesListener();
}
