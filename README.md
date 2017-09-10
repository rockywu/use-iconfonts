# use-iconfonts
暂时只能运行在node环境下
借鉴[nfroidure/svgiconfont](https://github.com/nfroidure/svgiconfont)字体打包工具,扩展了功能提供svg内容可以直接作为数据源编译成字体。

## Please Use New Version "use-icons"

New version of the library has migrated to the [Use-Icons](https://www.npmjs.com/package/use-icons)

### future
之后版本 - 可以运行在游览器环境

### feature
can build font's file

* .woff2 **browser chrome、firefox**
* .woff **browser chrome、firefox**
* .ttf **browser chrome、firefox、opera、Safari, Android, iOS 4.2+**
* .eot **browser IE+**
* .svg **browser iOS 4.1-**


### Install
```
npm install --save use-iconfonts
```

### demo
```
"use strict";
/**
 * Created by rocky on 16/7/1.
 */
var fs = require("fs");
var mkdirp = require("mkdirp");
var path = require("path");
var fontBunder = require("use-iconfonts").fontBunder;
//svg dir
var p = __dirname + "/../template/svgs/";
var fb = new fontBunder();
var content = fs.readFileSync(p + "clear.svg", "utf8");
var fonts = [
    {
        unicode : "e001",
        file : p + "add.svg", //test use file path
    },
    {
        unicode : "e002",
        content : content,//test use file content
    },
    {
        unicode : "e003",
        file : p + "upa.svg",
    }
];
// 设置输出是可以生成demo.html 默认为true
fb.setHasDemo(false);
// 设置输出文件格式为zip 默认为true
fb.setIsZip(false);
// 设置css不压缩
fb.setCleanCss(false);
// 重新设置viewBox大小 默认为true
fb.resetViewBoxSize(false);
//开始生成文件
fb.generate(fonts, {
    fontName : "myfont" //设置字体名
},function (rs) {
    //当setIsZip(false), rs返回一个文件二进制内容数组，否则返回zip文件对象二进制内容
    var p = path.normalize(__dirname + "/../out/");
    mkdirp.sync(p);
    if(rs instanceof Array) {
        rs.map(function(val) {
            fs.writeFileSync(p + val.name, val.content);
        })
    } else {
        fs.writeFileSync(p + "aa1.zip", rs, "utf8");
    }
});
```
### document

#### Api

* setHasDemo(bool)
    * boolean  set:**false** 不输出demo例子， **Default**: true
* setIsZip(bool)
    * boolean  set:**false** 不作为zip输出，**Default**: ture
* setCleanCss(bool)
    * boolean  set:**false** 不输出压缩有的css，**Default**: ture
* resetViewBoxSize(bool)
    * boolean  set:**false** 使用默认svg width and height, **Default**: true, 重新设置viewBox width height
* generate(fontConfings, options, callback)
    * fontConfigs  **array**
    
        ```
        [
            {
                file : "path/file/aaa.svg", //可以输入file文件地址
                unicode : "ea01",字体unicode码，
            },
            {
                content : "svg-content", //也可以输入文件内容
                unicode : "ea01",字体unicode码，
            },
        ]
        ```
    * options **object**
        * 可以参考[svgicons2svgfont.options](https://github.com/nfroidure/svgicons2svgfont#svgicons2svgfontoptions),中options配置介绍。
        * prependUnicode 自动生成unicode, default - false, true - auto unicode
        * startUnicode  自动开始编号 start unicode, default - 0xEA01
        * fontName 生成的字体模板名称 fontName
        * className 生成的字体模板样式名称 className
        * iconPrefix 生成字体样式模板的class前缀 如.icon-ea01 (icon为前缀)
    * callback **function**
        * example
        
        ```
        var callback = function (rs) {
            if(rs instanceof Array) {
                rs.map(function(val) {
                fs.writeFileSync(p + val.name, val.content);
                })
            } else {
                fs.writeFileSync(p + "aa1.zip", rs, "utf8");
            }
        }
        ```
        
### use font example
```
/* 第一步：使用font-face声明字体 */
@font-face {font-family: 'iconfonts';
  src: url('iconfonts.eot'); /* IE9*/
  src: url('iconfonts.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
  url('iconfonts.woff2') format('woff2'),/* chrome、firefox, the latest version*/
  url('iconfonts.woff') format('woff'), /* chrome、firefox */
  url('iconfonts.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
  url('iconfonts.svg#iconfont') format('svg'); /* iOS 4.1- */
}
/* 第二步：定义使用iconfont的样式(use iconfont.css) */
.iconfont{
  font-family:"iconfont" !important;
  font-size:16px;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}

[class*="icon-"]:before{
  font-family:"iconfont" !important;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
/* 第三步：挑选相应图标并获取字体编码，应用于页面
 * 1、在支持css3游览器。建议使用
 *   eg: <div class="icon-eb01"></div>;
 * 2、在支持伪类:before,:after游览器下。建议使用
 *   eg:<div class="iconfont icon-eb01"></div>
 * 3、低版本游览器模式（如：IE6,IE7,IE8...）。建议使用
 *   eg:<div class="iconfont">&#xeb01</div>
 */
<i class="icon-ea01"></i> //support Css3
<i class="iconfont icon-ea01"></i> //support IE9+
<i class="iconfont">&#xea01;</i> //support IE6,7,8

```

### author

rockywu <wjl19890427@hotmail.com>

