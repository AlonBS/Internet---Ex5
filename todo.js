/**
 * Created by orenstal on 01/02/2015.
 */

/*
    instructions to run the application:
        1. open cmd and go to C:\Users\orenstal\WebstormProjects\InternetEx5
        2. type: node launchServer.js
        3. open browser, and type: http://localhost:8888/index.html
 */


$(document).ready(function() {

    runServerTests();









    /*
        1. the first thing to do is to create ajax call to understand which screen to show.
        2. right now i will assume that we need to display the to-do list screen. so, i will return this content

     */

    //$.get("/test", function(data, status){
    //    console.log("Data: " + data + "\nStatus: " + status);
    //});

    //$("p").click(function(){
    //    $(this).hide();
    //});


    // mouseenter event is good when we want to show the 'delete' icon when pointing on some to-do item.
    // i can use $("p").toggle(); for displaying the 'completed' to-do item
    // i can use also $("p").html(); for displaying the content of the main div..
    // i can use $.getJSON to get the json obj by using ajax
});


function printToConsole(data) {
    var status = data['status'];
    var msg = data['msg'];
    var content = "status: ";

    if (status === 0) {
        content += "success; msg is: ";

        for (var i= 0, leng = msg.length; i<leng; i++) {
            content += '[id: ' + msg[i]['id'] + ', content: \'' + msg[i]['content'] + '\', status: ';
            if (msg[i]['status'] === 0) {
                content += 'active]\t';
            }
            else {
                content += 'completed]\t';
            }
        }

        if (msg.length === 0) {
            content += '[]';
        }
    }
    else if (status === 1) {
        content += "failure; msg is: " + msg.toString();
    }

    content += "\n";

    console.log(content);

    return content;
}





function runServerTests() {
    $.ajax({
        type: "POST",
        url: "/item",
        cache: false,
        data: {'id': 0, 'value': 'first comment'},
        success: function (data) {
            var content = printToConsole(data);
            $("#mainDiv").html(content);
        }
    });

    $.ajax({
        type: "POST",
        url: "/item",
        cache: false,
        data: {'id': 1, 'value': 'second comment'},
        success: function (data) {
            var content = printToConsole(data);
            $("#mainDiv").html(content);
        }
    });


    $.ajax({
        type: "GET",
        url: "/item",
        success: function (data) {
            var content = printToConsole(data);
            $("#mainDiv").html(content);
        }
    });

    setTimeout(function() {
        $.ajax({
            type: "PUT",
            url: "/item",
            data: {'id': 1, 'value': 'new text for second comment - completed', 'status': 1},
            success: function (data) {
                var content = printToConsole(data);
                $("#mainDiv").html(content);
            }
        });

        $.ajax({
            type: "GET",
            url: "/item",
            success: function (data) {
                var content = printToConsole(data);
                $("#mainDiv").html(content);
            }
        });

        $.ajax({
            type: "POST",
            url: "/item",
            cache: false,
            data: {'id': 2, 'value': 'third comment'},
            success: function (data) {
                var content = printToConsole(data);
                $("#mainDiv").html(content);
            }
        });

        setTimeout(function() {
            $.ajax({
                type: "PUT",
                url: "/item",
                data: {'id': 2, 'value': 'third comment - completed', 'status': 1},
                success: function (data) {
                    var content = printToConsole(data);
                    $("#mainDiv").html(content);
                }
            });


            $.ajax({
                type: "DELETE",
                url: "/item",
                data: {'id': -1},
                success: function (data) {
                    var content = printToConsole(data);
                    $("#mainDiv").html(content);
                }
            });

            setTimeout(function() {
                $.ajax({
                    type: "GET",
                    url: "/item",
                    success: function (data) {
                        var content = printToConsole(data);
                        $("#mainDiv").html(content);
                    }
                });

                $.ajax({
                    type: "DELETE",
                    url: "/item",
                    data: {'id': 0},
                    success: function (data) {
                        var content = printToConsole(data);
                        $("#mainDiv").html(content);
                    }
                });

                setTimeout(function() {
                    $.ajax({
                        type: "GET",
                        url: "/item",
                        success: function (data) {
                            var content = printToConsole(data);
                            $("#mainDiv").html(content);
                        }
                    });
                }, 2000);

            }, 2000);
        }, 2000);

    }, 1000);
}