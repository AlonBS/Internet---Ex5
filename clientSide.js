/**
 * Client Side.js - created By Alon Ben-Shimol & Tal Orenstein
 */

/*
    todo:
        1. @
        2. list
 */

function newItemListener()
{
    var inputField = $("#add_new_item");
    var content = inputField.val();
    var itemId = (nextId++).toString();

    $.ajax({
        type: "POST",
        url: "/item",
        data: {id: itemId, value: content},
        success: function (data)
        {
            if (data['status'] === 0 ) { // only upon success we display new item
                appendNewItem(itemId, 0, content); // new item is always uncompleted by default
                inputField.val('');
            }
            else {
                console.log("Unable to add item with id: " + itemId + ", with content: " + content);
                alert("Failed to add new item") //TODO - prompt in a more friendly way
            }
        }
    });
};



function appendNewItem(id, status, content) {

    var mark = "";
    var itemsStr;

    (status === 1) ? (++completedItems) : (++uncompletedItems)

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

    //$("#change_all_statuses").checked = false;
    $('#change_all_statuses').prop('checked',false);
    $("#change_all_statuses").show();
    //$("#items_left").show();
    $("#items_track").show();

    if (uncompletedItems === 1) {
        itemsStr = 'item left.';
    }
    else {
        itemsStr = 'items left.';
    }

    //itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
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
        itemsStatus[itemId] = newItemStatus;    // todo i think that it supposed to be inside the 'success'..

        $.ajax({
            type: "PUT",
            url: "/item",
            data: {id: itemId, value: undefined, status: newItemStatus },
            success: function (data)
            {
                if (data['status'] === 0 ) { // only upon success we change status of item

                    //tr.children("td:nth-child(1)").text(newItemStatus === 0 ? '\tU\t' : '\tC\t'); // TODO - edit
                    tr.children("td:nth-child(1)").toggleClass("item_completed_sign");
                    tr.children("td:nth-child(2)").toggleClass("item_completed_content");

                    newItemStatus === 1 ? (++completedItems , --uncompletedItems) : (--completedItems , ++uncompletedItems);

                    if (completedItems > 0 && uncompletedItems === 0) { // all the items were completed
                        //$("#change_all_statuses").checked = true;
                        $('#change_all_statuses').prop('checked',true);
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                    }
                    else {
                        //$("#change_all_statuses").checked = false;
                        $('#change_all_statuses').prop('checked',false);

                        if (completedItems > 0) {
                            $("#clear_completed").html("Clear completed.");
                            $("#clear_completed").show();
                        }
                        else {
                            $("#clear_completed").hide();
                        }
                    }

                    var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);

                }
                else {
                    console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                    alert("Unable to update item with id: " + itemId + ". Reason: " + data['msg']); //TODO - prompt in a more friendly way
                }
            }
        });
    });
}



function setChangeAllStatusesListener() {

    // update status of item
    //$("#change_all_statuses").unbind().click(function() {
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
                if (data['status'] === 0 ) { // only upon success we change status of item

                    $('#items_table > tbody  > tr').each(function() {

                        var currentRow = $(this); // cache this constructor
                        var trId = $(currentRow).attr('id').substring($(currentRow).attr('id').indexOf('-') + 1);
                        if (everyoneAlreadyCompleted) {
                            itemsStatus[trId] = 0;
                            --completedItems;
                            ++uncompletedItems;
                            //currentRow.children("td:nth-child(1)").text('\tU\t');
                            currentRow.children("td:nth-child(1)").toggleClass("item_completed_sign");
                            currentRow.children("td:nth-child(2)").toggleClass("item_completed_content");
                        }
                        else if (itemsStatus[trId] === 0) {
                            itemsStatus[trId] = 1;
                            ++completedItems;
                            --uncompletedItems;
                            //currentRow.children("td:nth-child(1)").text('\tC\t');
                            currentRow.children("td:nth-child(1)").toggleClass("item_completed_sign");
                            currentRow.children("td:nth-child(2)").toggleClass("item_completed_content");
                        }
                    });

                    if (completedItems > 0) {
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                        //$("#change_all_statuses").checked = true;
                        $('#change_all_statuses').prop('checked',true);
                    }
                    else {
                        $("#clear_completed").hide();
                        //$("#change_all_statuses").checked = false;
                        $('#change_all_statuses').prop('checked',false);
                    }

                    var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);

                }
                else {
                    console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                    alert("Unable to update item with id: " + itemId + ". Reason: " + data['msg']); //TODO - prompt in a more friendly way
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

        e.stopPropagation();    // todo relevant ??
        todoElement = $(this);
        currContent = $(this).html();

        $(todoElement).html('<input class="todoUpdateContent" type="text" value="' + currContent + '" />');

        // move the cursor to the last char
        var len= $(".todoUpdateContent").val().length * 2;
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
                $this.parent().text($this.val());
                $this.remove();
            }
            else {
                console.log("Unable to update item with id: " + itemId + ". Reason: " + data['msg']);
                alert("Unable to update item with id: " + itemId + ". Reason: " + data['msg']); //TODO - prompt in a more friendly way
            }
        }
    });


}


function setDeleteImage() {

    // delete item
    $(".delete_icon").unbind().on("click", function(e) { // we don't delete only until approved by server

        e.preventDefault();

        var tr = $(this).parent().parent();
        var itemId = tr.attr('id').substring(tr.attr('id').indexOf('-') + 1);
        var itemStatus = itemsStatus[itemId];

        $.ajax({
            type: "DELETE",
            url: "/item",
            data: {id: itemId},
            success: function (data)
            {
                if (data['status'] === 0 ) { // only upon success we delete this row
                    tr.remove();
                    (itemStatus === 1) ? --completedItems : --uncompletedItems;
                    //console.log("upon delete: com:" + completedItems + ", uncom: " + uncompletedItems);

                    if (completedItems > 0 && uncompletedItems === 0) { // all the items were completed
                        //$("#change_all_statuses").checked = true;
                        $('#change_all_statuses').prop('checked',true);
                    }
                    else {
                        //$("#change_all_statuses").checked = false;
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

                    var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
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
                    alert("Failed to delete new item") //TODO - prompt in a more friendly way
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
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;

        if (keyCode == '13') newItemListener();
    });
}


function loadItems() {

    //request all items
    $.get("/item", function(data) { // TODO - if filters are added - this should become a method

        if (data['status'] === 1) {

            console.log("Failed to receive all items. Reason: " + data['msg']);
            alert("Failed. REASON: " + data['msg']); //TODO - do something more friendly
            return;
        }


        $("#change_all_statuses_checkbox").append("<input id='change_all_statuses' type='checkbox'>");

        var items = data['msg']['list'];

        nextId = data['msg']['nextId']; //If we now loaded n tasks from server, we want id assign to start with n+1

        var numOfItems = items.length;

        //if (numOfItems === 0) {
        //    $("#change_all_statuses_checkbox").html("<input id='change_all_statuses' type='checkbox'>");
        //}

        for (var i = 0 ; i < numOfItems; ++i) {

            var id = items[i]['id'];
            var status = items[i]['status'];
            var content = items[i]['content'];

            appendNewItem(id, parseInt(status), content);
        }

        //nextId = numOfItems; //If we now loaded n tasks from server, we want id assign to start with n+1

        if (completedItems > 0) {
            $("#clear_completed").html("Clear completed.");
            $("#clear_completed").show();
        }

        // display 'change all' button
        //$("#change_all_statuses").checked = false;
        $('#change_all_statuses').prop('checked',false);

        if (numOfItems === 0 ) {
            $("#change_all_statuses").hide();
        }
        else if (completedItems > 0 && completedItems === numOfItems) {
            //$("#change_all_statuses").checked = true;
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
                if (data['status'] === 0 ) { // only upon success we delete all rows

                    $('#items_table > tbody  > tr').each(function() {

                        var currentRow = $(this); // cache this constructor
                        var trId = $(currentRow).attr('id').substring($(currentRow).attr('id').indexOf('-') + 1);
                        if (itemsStatus[trId]) {
                            --completedItems;
                            $(this).remove();
                        }
                    });


                    $("#clear_completed").hide();
                    //$("#change_all_statuses").checked = false;
                    $('#change_all_statuses').prop('checked',false);

                    if (uncompletedItems === 0) {
                        $("#change_all_statuses").hide();
                        //$("#items_left").hide();
                        $("#items_track").hide();
                    }




                    ///////////////////


                    //if (completedItems > 0 && uncompletedItems === 0) { // all the items were completed
                    //    $("#change_all_statuses").checked = true;
                    //}
                    //else {
                    //    $("#change_all_statuses").checked = false;
                    //
                    //    if (completedItems > 0) {
                    //        $("#clear_completed").html("Clear completed.");
                    //        $("#clear_completed").show();
                    //        $("#change_all_statuses").show();
                    //    }
                    //    else {
                    //        $("#clear_completed").hide();
                    //    }
                    //}
                    //
                    //var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    //$("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);
                    //
                    //if (completedItems + uncompletedItems === 0) {
                    //    $("#change_all_statuses").hide();
                    //    $("#items_div").hide(200);
                    //}


                    ///////////////////




                }
                else {
                    console.log("Unable to delete all items. Reason: " + data['msg']);
                    alert("Failed to delete all messages") //TODO - prompt in a more friendly way
                }
            }
        });
    });
}


$(function() {

    nextId = uncompletedItems = completedItems = 0;
    itemsStatus = {}; // itemsStatus[id] -> gives this item's status

    setInputEventListener();

    loadItems();

    setClearCompletedListener();

    setChangeAllStatusesListener();
});


