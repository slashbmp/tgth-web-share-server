const _fs = require("fs");
var _config = null;
var Client = require("node-rest-client").Client;

var setConfig = (config) => {
	_config = config;
};

var getContent = (id, lang) => {
	return new Promise((resolve, reject) => {
		var client = new Client();
		var args = {
			"headers": { "Content-Type": "application/json" }
		};
		client.get(_config.endpoints.tgthExplore + "/v1/web/explore?id=" + id + "&lang=" + lang + "&type=content", args, (data, response) => {
			resolve(data.objectValue[0]);
		});
	});
}

var getStory = (id, lang) => {
	return new Promise((resolve, reject) => {
		var client = new Client();
		var args = {
			"headers": { "Content-Type": "application/json" }
		};
		client.get(_config.endpoints.tgthExplore + "/v1/web/explore?id=" + id + "&lang=" + lang + "&type=story", args, (data, response) => {
			resolve(data.objectValue[0]);
		});
	});
}

var getTrip = (id, lang) => {
	return new Promise((resolve, reject) => {
		var client = new Client();
		var args = {
			"headers": { "Content-Type": "application/json" }
		};
		client.get(_config.endpoints.tgthTrip + "/v1/web/trip?id=" + id + "&lang=" + lang + "&day=1", args, (data, response) => {
			resolve(data.objectValue[0]);
		});
	});
}

module.exports = {
	"getContent": getContent,
	"getStory": getStory,
	"getTrip": getTrip,
	"setConfig": setConfig
};