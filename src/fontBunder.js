"use strict";
/**
 * Created by rocky on 16/7/1.
 */
const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const jsZip = require('jszip');
const stringDecoder = require('string_decoder').StringDecoder;
const _ = require("underscore");
const stream = require("stream").PassThrough;
const fs = require("fs");
const utils = require("./utils");
const path = require("path");
const mkdirp = require("mkdirp");
/**
 * 运行生成字体文件
 */
class fontBunder{

    /**
     *
     * @param boolean isDemo 是否生成demo default : true;
     * @param boolean isZip 是否生成zip文件
     */
    constructor(isDemo, isZip) {
        this.isZip = true;
        this.hasDemo = true;
        this.fontOptions = null;
    }

    /**
     * setHasDemo
     * @param boolean bool bool为 输出demo文件，不输出
     * @return self
     */
    setHasDemo(bool) {
        this.hasDemo = bool === false ? false : true;
        return this;
    }

    /**
     * setIsZip
     * @param boolean bool bool 为 输出zip文件流，否则输出若干个文件内容
     * @return self
     */
    setIsZip(bool) {
        this.isZip = bool === false ? false : true;
        return this;
    }

    /**
     * 格式化路径
     * @param dir
     * @param filePath
     */
    formatPath(dir, filePath) {
        dir = dir || "";
        filePath = filePath || "";
        return path.normalize((dir + path).replace("//", "/"));
    }
    /**
     * 格式化字体参数
     * @param object options 字体配置
     * @return {*}
     */
    formatFontOptions(options) {
        let def = {
            fontName: "iconfonts",
            normalize : true, //所有字体标准输出
            fontHeight : 200, //字体高度200
            centerHorizontally : true, //字体居中生成
            prependUnicode : false, //自动生成unicode
            startUnicode : 0xEA01 //自动开始编号
        };
        options = _.extend(def, options);
        _.forEach(options, (val, key) => {
            val === null && delete options[key];
        })
        options.fontName = options.fontName || "iconfonts";
        this.fontOptions = options;
    }

    /**
     * 写入需要编辑的svg配置
     * @param array fonts
     * [
     *  {
     *      file : "filepath",//文件所在路径
     *      name : "name", //文件名称
     *      clasname : "classname", //文件自定义classname
     *      unicode : "ea00", //自定义字体编码
     *  }
     * ]
     * @param object fontOptions
     * @return boolean
     */
    formatFonts(fonts) {
        var _this = this;
        if(!_.isArray(fonts)) {
            return [];
        }
        fonts = fonts.map(font => {
            if (_.isEmpty(font.file)) {
                return false;
            }
            let unicode = null;
            if (!!_this.fontOptions.prependUnicode) {
                unicode = _this.fontOptions.startUnicode++;
            } else {
                unicode = utils.hex2Int(font.unicode);
                if(false === unicode) {
                    return false;
                }
            }
            let code = utils.int2Hex(unicode);
            let tmp = {};
            tmp.file = path.normalize(font.file);
            tmp.name = font.name || code;
            tmp.classname = font.classname || code;
            tmp.unicode = [String.fromCharCode(unicode)];
            tmp.code = code;
            return tmp;
        });
        return fonts.filter(font => font !== false);
    }

    /**
     * 运行生成文件
     * @param string files 文件格式集合,可以查看formatFonts注释
     * @param fontOptions 字体配置
     */
    generate(fonts, fontOptions, callback) {
        let _this = this;
        if(_.isFunction(fontOptions)) {
            callback = fontOptions;
            fontOptions = {};
        }
        fontOptions = this.formatFontOptions(fontOptions);
        fonts = this.formatFonts(fonts);
        if(fonts.length < 1) {
            callback("files is empty || fonts is a invalid data");
            return;
        }
        let iconStreams = _.map(fonts, (font) => {
            return _this.newIconStream(font);
        });
        let data = [];
        if(this.hasDemo) {
            data = this.fontDemo(fonts);
        }
        this.makeSVG(iconStreams, (content) => {
            //svg
            data.push({
                name : _this.fontOptions.fontName + ".svg",
                content : content
            });
            //ttf
            let ttfFontBuffer = _this.makeTTF(content);
            data.push({
                needBuffer : "ttf",
                name: _this.fontOptions.fontName + ".ttf",
                content: ttfFontBuffer
            });
            //eot
            data.push({
                needBuffer : "eot",
                name : _this.fontOptions.fontName + ".eot",
                content : _this.makeEOT(ttfFontBuffer)
            });
            //woff
            data.push({
                needBuffer : "woff",
                name : _this.fontOptions.fontName + ".woff",
                content : _this.makeWOFF(ttfFontBuffer)
            });
            //woff2
            data.push({
                needBuffer : "woff2",
                name : _this.fontOptions.fontName + ".woff2",
                content : _this.makeWOFF2(ttfFontBuffer)
            });
            if (_this.isZip) {
                let zip = new jsZip();
                _.forEach(data, row => {
                    zip.file(row.name, row.content);
                });
                callback(zip.generate({type : "nodebuffer", compression: 'DEFLATE'}));
                zip = null;
            } else {
                //todo 存在无法进行正常转码错误,当不压缩文件时
                //data = _.map(data, row=> {
                //    if(row.needBuffer === true) {
                //        row.content = new Buffer(row.content).buffer;
                //    }
                //    return row;
                //});
                callback(data);
            }
        });
    }

    /**
     *
     * @param object file 文件字体格式
     * @return {*}
     */
    newIconStream(font) {
        let iconStream = new stream();
        try {
            iconStream.write(fs.readFileSync(font.file, "utf8"), "utf8");
            iconStream.end();
        } catch(e) {
            iconStream.end();
        }
        iconStream.metadata = {
            unicode : font.unicode,
            name : font.name
        };
        return iconStream;
    }

    /**
     * SVG字体数据
     * @param iconStreams
     * @param callback
     */
    makeSVG(iconStreams, callback) {
        let parts = [];
        let decoder = new stringDecoder('utf8');
        let fontStream = svgicons2svgfont(this.fontOptions);
        fontStream.on('data', function(chunk) {
            parts.push(decoder.write(chunk));
        });
        fontStream.on('finish', function() {
            callback(parts.join(''));
        });
        iconStreams.forEach(fontStream.write.bind(fontStream));
        fontStream.end();
    }

    /**
     * TTF字体数据
     * @param svgFont
     * @return {*}
     */
    makeTTF(svgFont) {
        return svg2ttf(svgFont).buffer;
    }

    /**
     * EOT字体数据
     * @param ttfFontBuffer
     * @return {*}
     */
    makeEOT(ttfFontBuffer) {
        return ttf2eot(ttfFontBuffer).buffer;
    }

    /**
     * WOFF字体文件
     * @param ttfFontBuffer
     * @return {*}
     */
    makeWOFF(ttfFontBuffer) {
        return ttf2woff(new Uint8Array(ttfFontBuffer.buffer)).buffer;
    }

    /**
     * WOFF字体文件
     * @param ttfFontBuffer
     * @return {Uint8Array}
     */
    makeWOFF2(ttfFontBuffer) {
        ttfFontBuffer = new Uint8Array(ttfFontBuffer);
        let buf = new Buffer(ttfFontBuffer.length);
        let i = 0;
        let j = 0;
        for(i = 0, j = ttfFontBuffer.length; i < j; i++) {
            buf.writeUInt8(ttfFontBuffer[i], i);
        }
        buf = ttf2woff2(buf);
        let woff2FontBuffer = new Uint8Array(buf.length);
        for(i = 0, j = buf.length; i < j; i++) {
            woff2FontBuffer[i] = buf.readUInt8(i);
        }
        return woff2FontBuffer;
    }

    /**
     * demo例子
     */
    fontDemo(fonts) {
        let _this = this;
        let timestamp = Math.round(Date.now()/1000);
        let p = path.normalize(__dirname + "/../iconsTmp/");
        let iconsTemplate = ["demo.css", "demo.html", "iconfont.css"];
        let result = [];
        _.forEach(iconsTemplate, fileName => {
            let content = _this.template(fs.readFileSync(p + fileName, "utf8"), {
                fonts : fonts,
                fontName : _this.fontOptions.fontName,
                timestamp : timestamp,
            });
            result.push({
                name : fileName,
                content : content
            })
        });
        return result;
    }

    /**
     * 运行模板替换
     * @param string content
     * @param object data
     * @return string
     */
    template(content, data) {
        data = data || {};
        return _.template(content.toString())(data);
    }
}

exports = module.exports = fontBunder;

