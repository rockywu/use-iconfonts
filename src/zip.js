"use strict";
/**
 * Created by rocky on 16/6/28.
 */
let jsZip = require("jszip");
let fs = require("fs");
let mkdirp = require("mkdirp");
let path = require("path");
let _ = require("underscore");
let promise = require("es6-promise").Promise;

class zip {
    constructor() {
    }

    readFilePromise(file) {
        return new promise((resolve, reject) => {
            fs.readFile(file, "utf8", (err, data) => {
                if(err) console.log(err);
                resolve(err ? null : data);
            })
        });
    }
    /**
     * 设置文件路径
     * @param files
     *  [
     *      {
     *       name : "outName",
     *       path : "filePath"
     *      }
     *  ]
     * @return promise
     */
    setFiles(files) {
        if(!(_.isArray(files) && files.length > 0)) {
            throw new Error("请设置压缩文件");
        }
        let _this = this;
        let ps = [];
        _.forEach(files, file => {
            let filePath = file.path;
            ps.push(_this.readFilePromise(filePath));
        });
        return promise.all(ps);
    }

    /**
     * 执行文件压缩
     * @param outFile
     * @param files
     * @param cb
     * @return
     */
    run(outFile, files, cb) {
        cb = _.isFunction(cb) ? cb : ()=> {};
        let  zip = new jsZip();
        this.setFiles(files)
        .then((contents) => {
            let content = null;
            _.forEach(files, (file, key) => {
                content = contents[key];
                if(content !== null) {
                    zip.file(file.name, content);
                }
            })
        })
        .then(() => {
            return zip.generateAsync({
                compression : "DEFLATE",
                type:"nodebuffer",
            });
        })
        .then((content)=> {
            let parse = path.parse(path.normalize(outFile));
            let filePath = parse.dir + "/";
            let fileName = parse.name + (!!parse.ext ? parse.ext : "");
            try {
                mkdirp.sync(filePath);
            } catch(e) {
                throw new Error("输出文件路径错误");
            }
            fs.writeFile(filePath + fileName, content, err => {
                cb(err);
            });
        });
    }
}
exports = module.exports = new zip();
