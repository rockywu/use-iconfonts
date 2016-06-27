"use strict";
/**
 * Created by rocky on 16/6/27.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var gulp = require("gulp");
var iconfont = require('gulp-iconfont');
var _ = require("underscore");
var utils = require("./utils");
var formats = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
/**
 * 是否为空
 * @param val
 * @return {boolean}
 */
function isEmpty(val) {
    return val == "" || val == undefined;
}

var iconfonts = function () {
    function iconfonts() {
        _classCallCheck(this, iconfonts);

        this.formats = formats;
        this.files = [];
    }

    /**
     * 设置字体创建格式,默认支持
     * @param types 设置生成类型格式
     * @return boolean 设置成功
     */


    _createClass(iconfonts, [{
        key: "setFormats",
        value: function setFormats(types) {
            var f = [];
            if (isEmpty(types)) return false;
            if (typeof types == 'string' && _.indexOf(formats, types) >= 0) {
                f.push(types);
            } else if (_.isArray(types)) {
                f = types.filter(function (val) {
                    return _.indexOf(formats, val) >= 0;
                });
            } else {
                return false;
            }
            if (f.length > 0) {
                this.formats = f;
                return true;
            } else {
                return false;
            }
        }

        /**
         * 清理文件
         */

    }, {
        key: "dumpFiles",
        value: function dumpFiles() {
            this.files = [];
        }

        /**
         * 写入需要编辑的svg配置
         * @param files
         * [
         *  {
         *      name : "filename",
         *      clasname : "classname",
         *      unicode : "ea00"
         *  }
         * ]
         * @return boolean
         */

    }, {
        key: "setFiles",
        value: function setFiles(files) {
            var f = [];
            if (!_.isArray(files)) {
                return false;
            } else {
                files = files.map(function (val) {
                    if (utils.hex2Int(val.unicode) === false) {
                        return false;
                    }
                    var name = val.name;
                    var classname = val.classname;
                    var unicode = val.unicode;

                    var tmp = {};
                    tmp.name = name || unicode;
                    tmp.classname = classname || unicode;
                    tmp.unicode = unicode;
                    return tmp;
                });
                files = files.filter(function (val) {
                    return val !== false;
                });
                if (files.length > 0) {
                    this.files = files;
                } else {
                    return false;
                }
            }
        }
    }]);

    return iconfonts;
}();

var f = new iconfonts();
f.setFormats(['svg', 1, 2, 3, 'ttf', 'woff1']);
f.setFiles([{
    unicode: "ea00"
}]);
console.log(f.formats, f.files);