var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var tmpFile = path.normalize(__dirname + "/../zipHtml/demo.html");
var tmp = fs.readFileSync(tmpFile).toString();
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
var compiled = _.template(tmp);
console.log(compiled(data));

