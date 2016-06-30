"use strict";
/**
 * Created by rocky on 16/6/27.
 */
const gulp = require("gulp");
const iconfont = require('gulp-iconfont');
const _ = require("underscore");
const mkdirp = require("mkdirp");
const path = require("path");
const utils = require("./utils");
const promise = require("es6-promise").Promise;
const formats = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
const fs = require("fs");
/**
 * 是否为空
 * @param val
 * @return {boolean}
 */
function isEmpty(val) {
    return val == "" || val == undefined;
}

class iconfonts {
    constructor() {
        this.formats = formats;
        this.fonts = [];
    }

    /**
     * 设置字体创建格式,默认支持
     * @param types 设置生成类型格式
     * @return boolean 设置成功
     */
    setFormats(types) {
        let f = [];
        if(isEmpty(types)) return false;
        if(typeof types == 'string' && _.indexOf(formats, types) >= 0) {
            f.push(types);
        } else if(_.isArray(types)) {
            f = types.filter(val=> _.indexOf(formats, val) >= 0);
        } else {
            return false;
        }
        if(f.length > 0) {
            this.formats = f;
            return true;
        } else  {
            return false;
        }
    }

    /**
     * 获得字体格式
     * @return Array
     */
    getFormats() {
        return this.formats;
    }

    /**
     * 清理缓存
     */
    dumpCache() {
        this.fonts = [];
        this.formats = formats;
    }

    /**
     * 写入需要编辑的svg配置
     * @param fonts
     * [
     *  {
     *      file : "filepath",
     *      name : "name",
     *      clasname : "classname",
     *      unicode : "ea00",
     *  }
     * ]
     * @return boolean
     */
    setFonts(fonts) {
        let f = [];
        if(!_.isArray(fonts)) {
            return false;
        } else {
            fonts = fonts.map(font => {
                if(isEmpty(font.file)) {
                    return false;
                }
                if(_.isString(font.unicode)) {
                    font.unicode = [font.unicode];
                }
                if(!_.isArray(font.unicode)) {
                    return false;
                }
                let find = font.unicode.find(code => {
                    return utils.hex2Int(code) === false
                });
                if(find !== undefined) {
                    throw new Error("存在输入的unicode错误，无法进行16进制计算");
                }
                let tmp = {};
                tmp.file = path.normalize(font.file);
                tmp.name = font.name || font.unicode.join("-");
                tmp.classname = font.classname || font.unicode.join("-");
                tmp.code = font.unicode;
                tmp.unicode = font.unicode.map(code => {
                    return eval("'\\u" + code + "'");
                });
                return tmp;
            });
            fonts = fonts.filter(font => font !== false);
            if(fonts.length > 0) {
                this.fonts = fonts
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * 获得字体配置
     * @return array
     */
    getFonts() {
        return this.fonts;
    }

    formatOptions(options) {
        let _this = this;
        this.setFormats(options.formats || null);
        let def = {
            fontName : "iconfonts",
            formats : this.formats,
            centerHorizontally : true, //字体居中生成
            normalize : true, //所有字体标准输出
            fontHeight : 200, //字体高度为200
            timestamp : Math.round(Date.now()/1000),
            metadataProvider : (file, cb) => {
                let font = _this.fonts.find(config => config.file == file);
                cb(null, {
                    name : font.name,
                    unicode : font.unicode,
                })
            }
        }
        options = _.extend(def, options);
        _.map(options, (val, key) => {
            val === null && delete options[key];
        })
        return options;
    }

    /**
     * 执行生成fonts文件
     * @param outPath
     * @param cb
     */
    run(outPath, options, cb) {
        if(typeof options == 'function') {
            cb = options;
            options = {};
        }
        let _this = this;
        if(this.fonts.length < 1) {
            throw new Error("请先设置字体文件配置,可以使用setFonts函数进行设置");
        }
        let files = this.fonts.map(font => path.normalize(font.file));
        try {
            mkdirp.sync(outPath);
        } catch(e) {
            throw new Error("输出文件路径错误");
        }
        gulp.src(files)
        .pipe(iconfont(_this.formatOptions(options)))
        .on('glyphs',(glyphs, options) => {
            /**
             * 字体生成完成
             */
            _this.runDemo(outPath, options).then(function() {
                cb(glyphs, options);
            });
        })
        .pipe(gulp.dest(outPath))
    }

    /**
     * 生成字体demo
     * @param outPath
     * @return void
     */
    runDemo(outPath, options) {
        try {
            mkdirp.sync(outPath);
        } catch(e) {
            throw new Error("输出文件路径错误");
        }
        let _this = this;
        let p = path.normalize(__dirname + "/../iconsTmp/");
        let outParse = path.parse(path.normalize(outPath));
        let iconsTemplate = ["demo.css", "demo.html", "iconfont.css"];
        let ps = [];
        _.forEach(iconsTemplate, template => {
            ps.push(_this.runTemplate(p + template, {
                fonts : _this.fonts,
                fontName : options.fontName,
                timestamp : options.timestamp
            }));
        });
        return promise.all(ps).then(function(templates) {
            _.forEach(templates, (content, key) => {
                fs.writeFileSync(outParse.dir + "/" + outParse.base + "/" + iconsTemplate[key], content);
            })
        }).catch((err) => {
            console.log(err);
        });
    }

    /**
     * 运行模板替换
     * @param filePath
     * @param data
     */
    runTemplate(filePath, data) {
        data = data || {};
        return new promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, content) => {
                if(err)  {
                    resolve(null);
                    return;
                } else {
                    resolve(_.template(content.toString())(data));
                }
            });
        }).catch(function(err) {
            console.log(err)
        })
    }
}
exports = module.exports = iconfonts;
