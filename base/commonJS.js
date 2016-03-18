var path = require('path')
var fs = require('fs')
var vueJS = require('./vueJS')
var Promise = require('bluebird')
var file = require('./file')

var defaults = require('../base/defaults')
var defaultJS = defaults.defaultJS
var singleJS = defaults.singleJS

module.exports = function(config, mainPath){
	var excludes = (config.depends.global || '').split('+')
	var srcPath = path.join(config.hostPath, config.path.src)
	var mainSource = file.getSource(path.join(srcPath, mainPath))

	return new Promise(function(resolve, reject) {
		var reg = /\brequire\(["']([^,;\n]*)["']\)/ig
		var depends = []
		var code = []
		var len = 0

		getDepends(mainPath, mainSource)	

		function done(){
			if(len) return;

			depends.push(mainPath)
			code.push(file.getJSContent(mainPath, mainSource))
			resolve(code.join('\n'));
		}

		function getDepends(modPath, modSource){
			modSource = modSource.replace(/(\/\/([^,;\n]*))/ig, '\n')

			var requires = modSource.match(reg) || []
			len += requires.length
			done()

			requires.map(function(line){
				try {
					var evaFn = new Function('require' , line)
					evaFn(require)

				}catch(err){
					console.log(err, line)
				}

			})

			function require(modName){
				if (modName === modPath){
					console.log('Error File "' + modPath + '" 调用自身.');
					len--;
					done()
					return;
				}

				if (modName && depends.indexOf(modName) == -1 && excludes.indexOf(modName) == -1 && modName != mainPath){
					depends.push(modName)

					switch(path.extname(modName)){
						case '.vue':
							vueJS(config, modName).then(function(source){
								code.push(file.getJSContent(modName, source))
								getDepends(modName, source)

								len--;
								done()
							})
							break;

						default:
							var source = ''
							if(singleJS[modName]){
								source = singleJS[modName]

							}else if(defaultJS[modName]){
								source = file.getJSContent(defaultJS[modName])

							}else{
								source = file.getSource(path.join(srcPath, modName))
							}

							code.push(file.getJSContent(modName, source))
							getDepends(modName, source)

							len--;
							done()
							break;
					}

				}else{
					len--;
					done()
				}
			}
		}
	})
} 

