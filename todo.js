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

    //try {
    //    $.ajax({
    //        type: "GET",
    //        url: "/test",
    //        cache: false,
    //        success: function (data) {
    //            var val = data['typ'];
    //            $("#mainDiv").text(val);
    //        }
    //    });
    //} catch (e) {
    //    console.log("error !!");
    //}

    // working example:
    $.get("/test", function(data){
        var val = data['content'];
        $("#mainDiv").html(val);
    });







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


