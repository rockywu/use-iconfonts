"use strict";
/**
 * Created by rocky on 16/7/1.
 */
var fs = require("fs");
var fontBunder = require("../src/fontBunder");
var iconPath = __dirname + "/icons/";
var fb = new fontBunder();
var mkdirp = require("mkdirp");
var path = require("path");
var dirs = fs.readdirSync(iconPath);
var fonts = [];
dirs.forEach(function(v, k) {
    if(v.indexOf(".") == 0) {
        return;
    }
    fonts.push({
        file : iconPath + v,
    })
});
//fb.setHasDemo(false);// 是否输出demo
fb.setIsZip(false).setCleanCss(false);
// fb.resetViewBoxSize(false); //重新设置viewBox宽高
fb.generate(fonts, {
    className : "myclass",
    fontName : "myfont",
    iconPrefix: "i",
    prependUnicode : true, //自动生成unicode
    startUnicode : 0xEA01 //自动开始编号
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


