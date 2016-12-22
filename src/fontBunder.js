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
/**
 * 运行生成字体文件
 */
class fontBunder{

    /**
     * 字体打包压缩
     */
    constructor() {
        this.isZip = true;
        this.hasDemo = true;
        this.viewBoxSize = true;
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
     * 格式化画布大小
     */
    resetViewBoxSize(bool) {
        this.viewBoxSize = bool === false ? false : true;
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
            startUnicode : 0xEA01, //自动开始编号
            className : "iconfont" //class样式名称
        };
        options = _.extend(def, options);
        _.forEach(options, (val, key) => {
            val === null && delete options[key];
        })
        options.fontName = options.fontName || def.fontName;
        options.className = options.className || def.className;
        this.fontOptions = options;
    }

    /**
     * 写入需要编辑的svg配置
     * @param array fonts
     * [
     *  {
     *      file : "filepath",//文件所在路径
     *      content : "content", //字体文件内容
     *      name : "name", //字体名称昵称
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
            if (_.isEmpty(font.file) && _.isEmpty(font.content)) {
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
            tmp.file = font.file ? path.normalize(font.file) : "";
            tmp.content = font.content || null;
            tmp.name = code;
            tmp.classname = font.classname || code;
            tmp.unicode = [String.fromCharCode(unicode)];
            tmp.code = code;
            return _.extend({}, font, tmp);
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
        let iconStreams = [];
        _.forEach(fonts, (font) => {
            let tmp = _this.newIconStream(font);
            if(tmp !== null) {
                iconStreams.push(tmp);
            }
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
            let ttfFont = _this.makeTTF(content);
            let eotFont = _this.makeEOT(ttfFont.buffer);
            let woffFont = _this.makeWOFF(ttfFont.buffer);
            let ttfBuffer = new Buffer(ttfFont.buffer);
            let ttfUint8Array = new Uint8Array(ttfBuffer);
            data.push({
                name: _this.fontOptions.fontName + ".ttf",
                content: ttfFont.buffer,
                buffer2Content : new Buffer(ttfFont.buffer),
            });
            //eot
            data.push({
                name : _this.fontOptions.fontName + ".eot",
                content : eotFont.buffer,
                buffer2Content : new Buffer(_this.makeEOT(ttfUint8Array).buffer),
            });
            //woff
            data.push({
                name : _this.fontOptions.fontName + ".woff",
                content : woffFont.buffer,
                buffer2Content : new Buffer(_this.makeWOFF(ttfUint8Array).buffer)
            });
            //woff2
            data.push({
                name : _this.fontOptions.fontName + ".woff2",
                content : _this.makeWOFF2(ttfFont.buffer),
                buffer2Content : new Buffer(_this.makeWOFF2(ttfUint8Array).buffer)
            });
            if (_this.isZip) {
                let zip = new jsZip();
                _.forEach(data, row => {
                    zip.file(row.name, row.content);
                });
                callback(zip.generate({type : "nodebuffer", compression: 'DEFLATE'}));
                zip = null;
            } else {
                data = _.map(data, row=> {
                    row.content = row.buffer2Content || row.content
                    return row;
                });
                _.forEach(fonts, (font, key) => {
                    delete fonts[key].content;
                    delete fonts[key].file;
                    delete fonts[key].unicode;
                });
                callback(data, fonts);
                data = null;
                fonts = null;
            }
        });
    }

    /**
     *
     * @param object file 文件字体格式
     * @return object
     */
    newIconStream(font) {
        let iconStream = new stream();
        let content = "";
        try {
            if(_.isString(font.content) && font.content != "") {
                content = font.content;
            } else {
                content = fs.readFileSync(font.file, "utf8");
            }
            //fixed bug 修复当画布大小不一致时导致的何必错误
            if(this.viewBoxSize) {
                let viewBoxRE = /viewBox=[^ ]+\s+[^ "']+\s+([^ "']+)\s+([^ "']+)/;
                let widthRE = /width=([^ <>]+)/;
                let heightRe = /height=([^ <>]+)/;
                let w;
                let h;
                //重新设置画布
                content.replace(viewBoxRE, function() {
                    w = RegExp.$1;
                    h = RegExp.$2;
                });
                if(w && h) {
                    content = content.replace(widthRE, 'width="' + w + '"');
                    content = content.replace(heightRe, 'height="'+ h +'"');
                }
            }
            iconStream.write(content, "utf8");
            iconStream.end();
        } catch(e) {
            iconStream.end();
            return null;
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
     * @return
     */
    makeTTF(svgFont) {
        return svg2ttf(svgFont);
    }

    /**
     * EOT字体数据
     * @param ttfFontBuffer
     * @return {*}
     */
    makeEOT(ttfFontBuffer) {
        return ttf2eot(ttfFontBuffer);
    }

    /**
     * WOFF字体文件
     * @param ttfFontBuffer
     * @return {*}
     */
    makeWOFF(ttfFontBuffer) {
        return ttf2woff(new Uint8Array(ttfFontBuffer.buffer));
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
                className : _this.fontOptions.className
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

