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
        unicode : "e001",
        file : p + "add.svg",
    },
    {
        unicode : "e002",
        content : content,
    },
    {
        unicode : "e003",
        file : p + "upa.svg",
    }
];
//fb.setHasDemo(false);
//fb.setIsZip(false);
fb.generate(fonts, {
    fontName : "myfont"
},function (rs) {
    var p = path.normalize(__dirname + "/../out/");
    mkdirp.sync(p);
    if(rs instanceof Array) {
        rs.map(function(val) {
            console.log(val.content)
            fs.writeFileSync(p + val.name, val.content);
        })
    } else {
        fs.writeFileSync(p + "aa1.zip", rs, "utf8");
    }
});

