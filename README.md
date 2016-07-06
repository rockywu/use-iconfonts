# use-iconfonts
借鉴[nfroidure/svgiconfont](https://github.com/nfroidure/svgiconfont)字体打包工具,扩展了功能提供svg内容可以直接作为数据源编译成字体。

### feature
can build font's file

* .woff2 ** browser chrome、firefox **
* .woff ** browser chrome、firefox **
* .ttf ** browser chrome、firefox、opera、Safari, Android, iOS 4.2+ **
* .eot ** browser IE+ **
* .svg ** browser iOS 4.1- **


### Install
````
npm install --save use-iconfonts
````

### demo


### example
````
/* 第一步：使用font-face声明字体 */
@font-face {font-family: 'iconfonts';
  src: url('iconfonts.eot'); /* IE9*/
  src: url('iconfonts.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
  url('iconfonts.woff2') format('woff2'),/* chrome、firefox, the latest version*/
  url('iconfonts.woff') format('woff'), /* chrome、firefox */
  url('iconfonts.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
  url('iconfonts.svg#iconfont') format('svg'); /* iOS 4.1- */
}
/* 第二步：定义使用iconfont的样式 */
.iconfont{
  font-family:"iconfont" !important;
  font-size:16px;font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
/* 第三步：挑选相应图标并获取字体编码，应用于页面 */
/* <i class="iconfont">&#xea01;</i> */
````

