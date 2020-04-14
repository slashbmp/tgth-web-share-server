/*
Web Server created by SlashBMP 2016
*/

function WebServer(expressObj, config, webRoot) {
	//local setting variables
	var _allowedExtensions = [".htm", ".html", ".css", ".csv",
		".pdf", ".zip", ".js", ".jpg", ".png", ".gif",
		".eot", ".svg", ".ttf", ".woff", ".woff2", ".appcache",
		".obj", ".mtl", ".tga", ".ico", ".map"
		];
	var _defaultFiles = ["index.htm", "index.html", "default.htm", "default.html"];
	var _express = expressObj;
	var _webRoot = webRoot;
	var _config = config
	var _fs = require("fs");
	var _readline = require("linebyline");
	var _isWin = (process.platform == "win32") ? true : false;
	var _slash = (_isWin) ? "\\" : "/";
	var Client = require("node-rest-client").Client;
	var _indexLines = [];
	var _indexLineMark = 0;
	var _tgthClient = require("./tgth-client");
	_tgthClient.setConfig(_config);
	
	var create, getDefaultFileName, request, fileExists, dirExists, sendInjectedIndex;
	
	getDefaultFileName = function (dir) {
		if (!dirExists(dir)) {
			// console.log("The dir \"" + dir + "\" is not exists");
			return null;
		}
		for (var k in _defaultFiles) {
			var file = _defaultFiles[k];
			if (fileExists(dir + _slash + file)) return file;
		}
		return "";
	};
	
	fileExists = function (file) {
		//console.log("file exists: ", file);
		try {
			return _fs.statSync(file).isFile();
		}
		catch (e) {
			//
		}
		return false;
	};
	
	dirExists = function (dir) {
		//console.log("dir exists: ", dir);
		try {
			return _fs.statSync(dir).isDirectory();
		}
		catch (e) {
			//
		}
		return false;
	}
	
	request = function (file, req, res) {
		var arr = file.split("/");
		
		//remove last element to get dir name
		var l = arr.length - 1;
		var dir = "";
		for (var i = 0; i < l; i++) {
			if (arr[i] == ".") continue;
			dir += arr[i] + _slash;
		}
		if (dir != "") dir = dir.substr(0, dir.length - 1);
		
		//the last element is file name
		var file = arr[l];
		
		//get default file name if file name didn't required.
		if (file == null || file == "") {
			// console.log("get default file from: " + _webRoot + dir);
			file = getDefaultFileName(_webRoot + dir);
		}
		if (file != null && file != "") {
			if (file.indexOf(".") < 0) {
				sendInjectedIndex(req, res, _webRoot + _slash + "index.html");
				return;
			}
			var arrUrl = file.split(".");
			var ext = "." + arrUrl[arrUrl.length - 1];
			var fullPathFile = _webRoot + _slash + dir + _slash + file;

			if (_allowedExtensions.indexOf(ext.toLowerCase()) < 0) {
				res.status(403);
				res.send("Forbidden");
				console.log("unknown file type: " + file);
				return;
			}
			
			if (!fileExists(fullPathFile)) {
				res.status(404);
				res.send("File not found.");
				return;
			}
			res.sendFile(fullPathFile);
		}
		else {
			res.status(404);
			res.send("File not found.");
		}
	};

	sendInjectedIndex = async (req, res, file) => {
		if (_indexLines.length == 0) {
			var rl = _readline(file);
			rl.on('line', function (line, lineCount, byteCount) {
				// do something with the line of text
				if (line.indexOf("<base ") >= 0) {
					_indexLineMark = lineCount - 1;
				}
				_indexLines.push(line);
			})
				.on('error', function (e) {
					// something went wrong
					console.log("Error: ", e);
				})
				.on('close', () => {
					sendInjectedIndex(req, res, file);
				});
				return;
		}

		var strIndex = "";

		for (var i = 0; i < _indexLines.length; i++) {
			strIndex += _indexLines[i] + "\r\n";
			if (i === _indexLineMark) {
				var jsonShare = {
					"title": _config.socialShare.title.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"),
					"url": _config.url + req.url,
					"description": _config.socialShare.description.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"),
					"image": _config.socialShare.image,
					"type": "website"
				};
				var arrChk = req.url.substr(1).split("/");
				if (arrChk[0] == "content") {
					try {
						var jsonGot = await _tgthClient.getContent(arrChk[1], arrChk[2]);
						jsonShare.title = jsonGot.title.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						jsonShare.description = jsonGot.body.substr(0, 255).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						jsonShare.image = jsonGot.images[0].imageUrl;
					}
					catch (e) {
						console.log("Error: ", e);
					}
				}
				else if (arrChk[0] == "story") {
					try {
						var jsonGot = await _tgthClient.getStory(arrChk[1], arrChk[2]);
						jsonShare.title = jsonGot.storyTitle.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						jsonShare.description = jsonGot.body.substr(0, 255).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						jsonShare.image = jsonGot.images[0].imageUrl;
					}
					catch (e) {
						console.log("Error: ", e);
					}
				}
				else if (arrChk[0] == "trip") {
					try {
						var jsonGot = await _tgthClient.getTrip(arrChk[1], arrChk[2]);
						jsonShare.title = jsonGot.title.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						jsonShare.description = jsonGot.body.substr(0, 255).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
						for (var content of jsonGot.trip) {
							if (content.images && content.images.length > 0) {
								jsonShare.image = content.images[0].imageUrl;
								break;
							}
						}
					}
					catch (e) {
						console.log("Error: ", e);
					}
				}
				strIndex += "<meta property=\"og:title\" content=\"" + jsonShare.title + "\" />\r\n";
				strIndex += "<meta property=\"og:url\" content=\"" + _config.url + req.url + "\" />\r\n";
				strIndex += "<meta property=\"og:description\" content=\"" + jsonShare.description + "\" />\r\n";
				strIndex += "<meta property=\"og:image\" content=\"" + jsonShare.image + "\" />\r\n";
				strIndex += "<meta property=\"og:type\" content=\"" + jsonShare.type + "\" />\r\n";
			}
		}

		res.set('Content-Type', 'text/html');
		res.send(strIndex);

	};
	
	_express.get("/*", function (req, res) {
		var url = req.url;
		var nChk = url.indexOf("?");
		if (nChk >= 0) url = url.substr(0, nChk);

		request(url, req, res);
	});
	
}

module.exports = function (expressObj, config, webRoot) {
	return new WebServer(expressObj, config, webRoot);
};