
var items  = {
    1 : 4,
    2 : 1

}

function appendNewItem(id, content) {

    $("#itemsTable tbody").append(
        "<tr id=id status="">"+
        "<td class='itemStatus'>Mark: + </td>"+
        "<td class='itemContent'>Content: " + content + "</td>"+
        "<td></td>"+
        "<td><button class='btnDelete'> DELETE </button></td>"+
        "</tr>");


    $(".itemContent").click(function() {



        //TODO implement
    });


    $(".itemContent").dblclick(function() {

        //TODO implement
    });



    $(".btnDelete").click(function() { // we don't delete only until approved by server

        var tr = $(this).parent().parent();
        var itemId = tr.attr('id');

        $.ajax({
            type: "DELETE",
            url: "/item",
            data: {id: itemId},
            success: function (data)
            {
                if (data['status'] === 0 ) { // only upon success we delete this row
                    tr.remove();
                }
                else {
                    console.log("Unable to delete item with id: " + itemId + ", with content: " + tr.children("td:nth-child(2)").val());
                    alert("Failed to delete new item") //TODO - prompt in a more friendly way
                }
            }
        });
    });





}


function newItemListener()
{
    var content = $("#addNewItem").val();
    var itemId = nextId++;

    $.ajax({
        type: "GET",
        url: "/test",
        data: {id: itemId.toString(), value: content},
        success: function (data)
        {
            if (data['status'] === 0 ) { // only upon success we display new item
                appendNewItem(content);
            }
            else {
                console.log("Unable to add item with id: " + itemId + ", with content: " + content);
                alert("Failed to add new item") //TODO - prompt in a more friendly way
            }
        }

    });
};




$(function() {

    //bind input form
    $("#addNewItem").bind("keypress", function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;

        if (keyCode == '13') newItemListener();
    });

    //request all items
    $.get("/item", function(data) {

        var val = data['content'];
        $("#mainDiv").html(val);
    });







});


/*



 //Add, Save, Edit and Delete functions code
 // $(".btnEdit").bind("click", Edit);
 //$(".btnDelete").bind("click", Delete);
 //$("#btnAdd").bind("click", Add);

 function Save()
 {
 var par = $(this).parent().parent(); //tr
 var tdName = par.children("td:nth-child(1)");
 var tdPhone = par.children("td:nth-child(2)");
 var tdEmail = par.children("td:nth-child(3)");
 var tdButtons = par.children("td:nth-child(4)");
 tdName.html(tdName.children("input[type=text]").val());
 tdPhone.html(tdPhone.children("input[type=text]").val());
 tdEmail.html(tdEmail.children("input[type=text]").val());
 tdButtons.html("<button class='btnDelete'>DELETE</button><button class='btnEdit'>EDIT</button>");

 $(".btnEdit").bind("click", Edit);
 $(".btnDelete").bind("click", Delete);
 };


 function Edit()
 {
 var par = $(this).parent().parent(); //tr
 var tdName = par.children("td:nth-child(1)");
 var tdPhone = par.children("td:nth-child(2)");
 var tdEmail = par.children("td:nth-child(3)");
 var tdButtons = par.children("td:nth-child(4)");
 tdName.html("<input type='text' id='txtName' value='"+tdName.html()+"'/>");
 tdPhone.html("<input type='text' id='txtPhone' value='"+tdPhone.html()+"'/>");
 tdEmail.html("<input type='text' id='txtEmail' value='"+tdEmail.html()+"'/>");
 tdButtons.html("<button  class='btnSave'>EDIT MADAFACKA</button>");

 $(".btnSave").bind("click", Save);
 $(".btnEdit").bind("click", Edit);
 $(".btnDelete").bind("click", Delete);

 };


 function Delete()
 {
 var par = $(this).parent().parent(); // tr
 par.remove();
 };

 */