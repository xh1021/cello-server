var path = require('path')
var fs = require('fs')
var Promise = require('bluebird')
var file = require('./file')
var less = require('less')

var defaults = require('./defaults')
var defaultCSS = defaults.defaultCSS

module.exports = function(config, mainPath){
	var lessPath = path.join(config.hostPath, config.path.less)
	var mainFilepath = path.join(lessPath, mainPath+'.less')
	var mainSource = ''

	if(defaultCSS[mainPath]){
		mainSource = defaultCSS[mainPath]

	}else{
		mainSource = file.getSource(mainFilepath)
	}

	return new Promise(function(resolve, reject) {
		less.render(mainSource, {
			paths:lessPath ? [lessPath] : []
			, compress:true

		}, function(error, output){
			if(error){
//				reject(error);
				resolve(error);

			}else{

				resolve(output.css);
			}
		})
	})
} 

