"use strict";
/**
 * Created by rocky on 16/7/1.
 */
var fs = require("fs");
var fontBunder = require("../src/fontBunder");
var p = __dirname + "/";
var fb = new fontBunder();
var mkdirp = require("mkdirp");
var path = require("path");
var content = fs.readFileSync(p + "clear.svg", "utf8");
var fonts = [
    {
        unicode : "e007",
        hash : "asdfasdf1",
        file : p + "add.svg",
    },
    {
        unicode : "e006",
        hash : "asdfasdf2",
        content : content,
    },
    {
        unicode : "e005",
        hash : "asdfasdf3",
        file : p + "upa.svg",
    }
];
//fb.setHasDemo(false);
fb.setIsZip(false);
fb.generate(fonts, {
    fontName : "myfont",
    prependUnicode : true,
    startUnicode : 0xEB01
},function (rs, fonts) {
    var p = path.normalize(__dirname + "/../out/");
    mkdirp.sync(p);
    if(rs instanceof Array) {
        console.log(fonts)
        rs.map(function(val) {
            fs.writeFileSync(p + val.name, val.content);
        })
    } else {
        fs.writeFileSync(p + "aa1.zip", rs, "utf8");
    }
});


