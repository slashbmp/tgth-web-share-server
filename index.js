var app = require("express")();
var cors = require("cors");
var http = require("http");
var fs = require("fs");
var bodyParser = require("body-parser");
var web = require("./modules/web-server.js");

var _isWin = (process.platform == "win32") ? true : false;
var _slash = (_isWin) ? "\\" : "/";

var _config = JSON.parse(fs.readFileSync(process.argv[2], {encoding: "utf8"}));

var nPort = _config.port;

function defaultContentTypeMiddleware(req, res, next) {
    req.headers['content-type'] = req.headers['content-type'] || 'application/json';
    next();
}

app.use(cors());

app.use(defaultContentTypeMiddleware);

app.use(function(req, res, next){

	req.body = req.body || {};
	if ('POST' != req.method) return next();
	var contenttype = req.headers['content-type'];
	if (/application\/json/.test(contenttype)) return next();
	req._body = true;
	var buf = '';
	req.setEncoding('utf8');
	req.on('data', function (chunk) { buf += chunk });
	req.on('end', function () {
		req.body = JSON.parse(buf);
		next();
	});
});

app.use(bodyParser.json());

web(app, _config, __dirname + _slash + _config.webRoot);

var httpServer = http.createServer(app);
httpServer.listen(nPort);

console.log("Server running on port " + (nPort) + "...");
