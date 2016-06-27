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
const formats = ['svg', 'ttf', 'eot', 'woff', 'woff2'];
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
                tmp.unicode = font.unicode.map(code => {
                    return eval("'\\u" + code + "'");
                })
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

    /**
     * 执行生成fonts文件
     * @param outPath
     * @param cb
     */
    run(outPath, cb) {
        let _this = this;
        if(this.fonts.length < 1) {
            throw new Error("请先设置字体文件配置,可以使用setFonts函数进行设置");
        }
        let files = this.fonts.map(font => path.normalize(font.file));
        console.log(files)
        try {
            mkdirp(outPath);
        } catch(e) {
            throw new Error("输出文件路径错误");
        }
        gulp.src(files)
        .pipe(iconfont({
            fontName : "iconfonts",
            formats : _this.formats,
            centerHorizontally : true, //字体居中生成
            normalize : true, //所有字体标准输出
            fontHeight : 200, //字体高度为200
            metadataProvider : (file, cb) => {
                let font = _this.fonts.find(config => config.file == file);
                cb(null, {
                    name : font.name,
                    unicode : font.unicode,
                })
            }
        }))
        .on('glyphs',(glyphs, options) => {
            /**
             * 字体生成完成
             */
            cb(glyphs, options);
        })
        .pipe(gulp.dest(outPath))
    }
}
exports = module.exports = iconfonts;