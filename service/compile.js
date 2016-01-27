var http = require('http')
var fs = require('fs')
var path = require('path')
var UglifyJS = require("uglify-js");
var commonJS = require('../base/commonJS')
var commonCSS = require('../base/commonCSS')
var vueJS = require('../base/vueJS')
var getConfig = require('../config')

var defaults = require('../base/defaults')
var defaultJS = defaults.defaultJS
var defaultCSS = defaults.defaultCSS

function getName(urlpath){
	var reg = new RegExp('^(\/(dist|css)\/)|(\.(js|css))$', 'g')
	return urlpath.replace(reg, '')
}

function compileJS(srcPath, distPath){

	var jss = fs.readdirSync(srcPath)
	console.log(jss)
}

function compile(hostname, config){
	var srcPath = path.join(config.hosts[hostname], config[hostname].path.src)
	var distPath = path.join(config.hosts[hostname], config[hostname].path.dist)
	var lessPath = path.join(config.hosts[hostname], config[hostname].path.less)
	var cssPath = path.join(config.hosts[hostname], config[hostname].path.css)

	compileJS(srcPath, distPath)
} 

module.exports = function(config){
	config = getConfig(config) 

	for(var hostname in config.hosts){
		compile(hostname, config)
	}

}

