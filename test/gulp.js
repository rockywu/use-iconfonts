var fonts = require("../src/fonts");
var utils = require("../src/utils");
var path = require("path");
//var zip = require("../src/zip");

var p = __dirname + "/../template/svgs/";
var f = new fonts();
f.setFonts([
    {
        unicode : "e001",
        file : p + "add.svg",
    },
    {
        unicode : "e002",
        file : p + "upa.svg",
    },
    {
        unicode : "e003",
        file : p + "clear.svg",
    }
])
f.run(__dirname + "/../out/pp", function(gylphs, options) {
    console.log(1212, gylphs, options);
})

