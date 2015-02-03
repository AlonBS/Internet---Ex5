/**
 * Created by Alon on 16/01/2015.
 */



var a = {
    userName : "blabla",
    passWord : "iosi"
}

var b = JSON.stringify(a);
console.log(b)
var c = JSON.parse(b);
console.log(c)
console.log(c.length)