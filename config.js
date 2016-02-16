var fs = require('fs')
var path = require('path')
var objectAssign = require('object-assign');
var file = require('./base/file')

var defaultConfig = require('./config/server.json')
var defaultAppConfig = require('./config/apps.json')

module.exports = function(config){
	config = objectAssign({}, defaultConfig, config || {})

	for(var hostname in config.hosts){
		var hostPath = path.join(config.appPath, config.hosts[hostname])

		if(!fs.existsSync(hostPath)){
			file.mkDir(hostPath)
		}

		if(/^\//ig.test(hostname)){
			hostname = '127.0.0.1:' + config.onPort + hostname
		}

		setConfig(hostname, hostPath)

	}

	function setConfig(hostname, hostPath){

		var configPath = path.join(hostPath, 'config.json')
		var appConfig = JSON.parse(JSON.stringify(defaultAppConfig))

		if(fs.existsSync(configPath)){
			configs = JSON.parse(fs.readFileSync(configPath, 'utf8')||'{}')

			for(var name in configs){
				if(typeof configs[name] == 'object'){
					appConfig[name] = objectAssign({}, appConfig[name], configs[name])

				}else if(name == 'version'){

					if(configs[name]){
						appConfig[name] = configs[name]+1
					}

				}else{
					appConfig[name] = appConfig[name] || configs[name]

				}
			}
		}

		appConfig.JCSTATIC_BASE = 'http://' + hostname + '/'
		appConfig.hostPath = hostPath

		file.mkFile(configPath, JSON.stringify(appConfig, null, 4))

		config.apps[hostname] = appConfig
	}

	return config
}

