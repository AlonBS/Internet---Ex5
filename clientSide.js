/**
 * Client Side.js - created By Alon Ben-Shimol & Tal Orenstein
 */


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                      to-do list page
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// global variables
var nextId;
var uncompletedItems;
var completedItems;
var itemsStatus;




function newItemListener()
{
    var inputField = $("#add_new_item");
    var content = scanUserInput(inputField.val());
    var itemId = (nextId++).toString();

    // todo i need to prevent xss and other attacks !!

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
                $("#errorMsg").text("Failed to add new item");
            }
        }
    });
}



function appendNewItem(id, status, content) {

    var mark = "";
    var itemsStr;

    (status === 1) ? (++completedItems) : (++uncompletedItems);

    itemsStatus[id] = status;

    // ★
    $("#items_table tbody").append(
        "<tr id=tr-" + id + ">" +
        "<td class='item_status'>&rArr;</td>" +
        "<td class='item_content'>" + content + "</td>" +
        "<td><button class='delete_icon'/></td>" +
        "</tr>");



    // creates a mark x for each row - to be displayed only when hover
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

    setChangeStatus();

    setEditContent();

    setDeleteImage();
}



function setChangeStatus() {

    // update status of item
    $(".item_status").unbind().click(function() {

        var tr = $(this).parent();
        var itemId = tr.attr('id').substring(tr.attr('id').indexOf('-') + 1);
        var newItemStatus = (1 - itemsStatus[itemId]);
        //itemsStatus[itemId] = newItemStatus;    // todo i think that it supposed to be inside the 'success'..

        $.ajax({
            type: "PUT",
            url: "/item",
            data: {id: itemId, value: undefined, status: newItemStatus },
            success: function (data)
            {
                if (data['status'] === 0 ) { // only upon success we change status of item
                    var itemsStr;

                    $("#errorMsg").html("&nbsp;");

                    itemsStatus[itemId] = newItemStatus;

                    tr.children("td:nth-child(1)").toggleClass("item_completed_sign");
                    tr.children("td:nth-child(2)").toggleClass("item_completed_content");

                    newItemStatus === 1 ? (++completedItems , --uncompletedItems) : (--completedItems , ++uncompletedItems);

                    if (completedItems > 0 && uncompletedItems === 0) { // all the items were completed
                        $('#change_all_statuses').prop('checked',true);
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                    }
                    else {
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
                else {
                    console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                    $("#errorMsg").text("Failed to change item status: " + data['msg']);
                }
            }
        });
    });
}



function setChangeAllStatusesListener() {

    // update status of item
    $("#change_all_statuses_checkbox").on('click', "#change_all_statuses", (function() {

        var everyoneAlreadyCompleted = (completedItems > 0 && uncompletedItems === 0);
        var newStatus = 1;

        if (everyoneAlreadyCompleted) {
            newStatus = 0;
        }

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
            updateTodoContent(itemId);
        });

        $(".todoUpdateContent").dblclick(function() {
            updateTodoContent(itemId);
        });

        $(".todoUpdateContent").keyup(function (event) {
            if (event.keyCode == 13) {
                updateTodoContent(itemId);
            }
        });
    });
}

function updateTodoContent(itemId) {

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


    $(".delete_icon").hover(
        function() { // delete item hover-on animate
            $(this).fadeTo(100, 1);
        },
        function() { // delete item hover-out animate
            $(this).fadeTo(100, 0.4);
        }
    );

}


function setInputEventListener() {


    //bind input form
    $("#add_new_item").bind("keypress", function(e) {
        var keyCode;
        var contentLen = $("#add_new_item").val().length;

        if (!e) e = window.event;

        keyCode = e.keyCode || e.which;

        // verify that not only 'enter' is pressed
        if (keyCode === 13 && contentLen >= 1) newItemListener();
    });


    //$("#add_new_item").focus(); // todo maybe not relevant since the input button has "autofocus"...

    $("#add_new_item").focusout(function() {
        var contentLen = $("#add_new_item").val().length;

        if (contentLen >= 1) newItemListener();
    });
}


function loadItems() {

    //request all items
    $.get("/item", function(data) { // TODO - if filters are added - this should become a method

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


$(function() {

    nextId = uncompletedItems = completedItems = 0;
    itemsStatus = {}; // itemsStatus[id] -> gives this item's status

    $.ajax({
        type: "GET",
        url: "/activeSession",
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

    //setInputEventListener();
    //
    //loadItems();
    //
    //setClearCompletedListener();
    //
    //setChangeAllStatusesListener();

    //// register form
    //setRegisterListener();
    //
    //// login form
    //setLoginListener();
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//                                      login and registration page
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setRegisterListener() {

    //sets clear-completed onclick event
    $("#reg_submit").on("click", function () {

        console.log("on register..");

        var fullname = $("#reg_fullname").val();
        var username = $("#reg_username").val();
        var pass = $("#reg_password").val();
        var passVerification = $("#reg_password_verification").val();
        var checkNameAndUsernameRegex = /^[A-Za-z0-9 _]{3,20}$/;
        var checkPasswordRegex = /^[A-Za-z0-9 _]{6,20}$/;


        if (!checkNameAndUsernameRegex.test(fullname)) {
            console.log("full name must include 3-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            $("#loginPage_error_msg").text("full name must include 3-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            return;
        }
        else if (!checkNameAndUsernameRegex.test(username)) {
            console.log("username must include 3-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            $("#loginPage_error_msg").text("username must include 3-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            return;
        }
        else if (!checkPasswordRegex.test(pass)) {
            console.log("password must include 6-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            $("#loginPage_error_msg").text("password must include 6-20 of the following: a-z, A-Z, 0-9, ' ' or '_' signs!");
            return;
        }
        else if (pass !== passVerification) {
            console.log("pass: " + pass + " !== passVer: " + passVerification);
            $("#loginPage_error_msg").text("password differs than password verification");
            return;
        }

        $("#loginPage_error_msg").text("");
        console.log("send to server: fullname: " + fullname + ", username: " + username + ", pass: " + pass);
        $.ajax({
            type: "POST",
            url: "/register",
            data: {username: username, fullname: fullname, password: pass},
            success: function (data)
            {

                if (data['status'] === 0 ) { // only upon success we delete all rows
                    showTodoListPage();
                }
                else {
                    console.log("An error occured during registration. Reason: " + data['msg']);
                    $("#loginPage_error_msg").text("An error occured during registration. Reason: " + data['msg']);
                }
            }
        });
    });
}


function setLoginListener() {

    //sets clear-completed onclick event
    $("#login_submit").on("click", function () {
        console.log("on login..");

        var username = $("#login_username").val();
        var pass = $("#login_password").val();
        var checkUsernameRegex = /^[A-Za-z0-9 _]{3,20}$/;
        var checkPasswordRegex = /^[A-Za-z0-9 _]{6,20}$/;

        console.log("username: " + username + ", pass: " + pass);

        if (!checkUsernameRegex.test(username) || !checkPasswordRegex.test(pass)) {
            console.log("invalid username and/or password");
            $("#loginPage_error_msg").text("invalid username and/or password");
        }


        $("#loginPage_error_msg").text("");
        console.log("send to server: username: " + username + ", pass: " + pass);
        $.ajax({
            type: "GET",
            url: "/login",
            data: {username: username, password: pass},
            success: function (data)
            {

                if (data['status'] === 0 ) { // only upon success we delete all rows
                    showTodoListPage();
                }
                else {
                    console.log("An error occured during login. Reason: " + data['msg']);
                    $("#loginPage_error_msg").text("An error occured during login. Reason: " + data['msg']);
                }
            }
        });
    });
}



function scanUserInput(content) {
    if (content === undefined)
        return;

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

    //console.log("after replaces: " + content);

    return content;
}

function showTodoListPage() {
    console.log("show todo list page..");

    $("#loginPage").hide();
    $("#todo_list_page").show();

    setInputEventListener();

    loadItems();

    setClearCompletedListener();

    setChangeAllStatusesListener();
}


function showLoginPage() {
    console.log("show login page..");

    $("#loginPage").show();
    $("#todo_list_page").hide();

    // register form
    setRegisterListener();

    // login form
    setLoginListener();
}