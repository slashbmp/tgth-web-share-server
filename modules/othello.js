function OthelloClient(socket, server, name, id) {

	var _socket = socket;
	var _server = server;
	var _name = name;
	var _id = id;

	var onDisconnect = () => {
		console.log(_name + " (" + _id + ") disconnected!");
	}

	this.getName = () => {
		return _name;
	};

	this.getId = () => {
		return _id;
	};

	_socket.on("disconnect", onDisconnect);
	_socket.emit("msg", "I am " + _id + ", " + _name);
}

function OthelloServer(io) {

	var _clients = []
	var _inc = 0;

	function uuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	var onConnect = (socket) => {
		_inc++;
		var name = "Guest" + _inc;
		var client = new OthelloClient(socket, this, name, uuid());
		_clients.push(client);
	}

	io.on("connection", onConnect);

}

module.exports = (io) => {
	return new OthelloServer(io);
};