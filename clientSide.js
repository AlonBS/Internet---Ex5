/**
 * Client Side.js - created By Alon Ben-Shimol & Tal Orenstein
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
    (status === 1) ? (++completedItems, mark = "\tC\t") : (++uncompletedItems, mark = "\tU\t")

    itemsStatus[id] = status;

    $("#items_table tbody").append(
        "<tr id=tr-" + id + ">" +
        "<td class='item_status'>" + mark + "</td>" +
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


    var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
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
        itemsStatus[itemId] = newItemStatus;

        $.ajax({
            type: "PUT",
            url: "/item",
            data: {id: itemId, value: undefined, status: newItemStatus },
            success: function (data)
            {
                if (data['status'] === 0 ) { // only upon success we change status of item

                    tr.children("td:nth-child(1)").text(newItemStatus === 0 ? '\tU\t' : '\tC\t'); // TODO - edit
                    newItemStatus === 1 ? (++completedItems , --uncompletedItems) : (--completedItems , ++uncompletedItems);

                    if (completedItems > 0) {
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                    }
                    else {
                        $("#clear_completed").hide();
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

                    if (completedItems > 0) {
                        $("#clear_completed").html("Clear completed.");
                        $("#clear_completed").show();
                    }
                    else {
                        $("#clear_completed").hide();
                    }

                    var itemsStr = (uncompletedItems === 1) ? 'item left.' : 'items left.';
                    $("#items_left").html("<strong> " + uncompletedItems + " </strong>" + itemsStr);

                    if (completedItems + uncompletedItems === 0)
                        $("#items_div").hide(200);

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

        var items = data['msg'];
        var numOfItems = items.length;
        for (var i = 0 ; i < numOfItems; ++i) {

            var id = items[i]['id'];
            var status = items[i]['status'];
            var content = items[i]['content'];

            appendNewItem(id, parseInt(status), content);
        }

        nextId = numOfItems; //If we now loaded n tasks from server, we want id assign to start with n+1

        if (completedItems > 0) {
            $("#clear_completed").html("Clear completed.");
            $("#clear_completed").show();
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
});


