var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var cssPath = path.normalize(__dirname + "/../zipHtml/iconfont.css");
var cssTmp = fs.readFileSync(cssPath).toString();
console.log(cssTmp);
var data = {
    nst : new Date().getTime(),
    icons : [
        {
            name : "ea01",
        },
        {
            name : "ea02",
        }
    ]
};
var cssCompile = _.template(cssTmp);
var h = cssCompile(data);
console.log(h);

