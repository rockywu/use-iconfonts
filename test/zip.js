var fonts = require("../src/fonts");
var zip = require("../src/zip");
var path = require("path");

var p = __dirname + "/../template/svgs/";
var files = [
    {
        name : "e001.svg",
        path : p + "add.svg",
    },
    {
        name : "e002.svg",
        path : p + "upa.svg",
    },
    {
        name : "e003.svg",
        path : p + "clear.svg",
    }
];
zip.run(__dirname + "/../out/pp/aaa.zip", files, function(err) {
    console.log(err)
});