//client.js

var socket = io();

var self = { "name": "", "id": ""};

var form = document.getElementById("form");
var chatBox = document.getElementById("m");

form.addEventListener('submit', (e) => {
	e.preventDefault();

	socket.emit('chat message', chatBox.value );
	chatBox.value = '';
	console.log('message sent.');
});

socket.on("login", (data) => {
	console.log("New user data: " + JSON.stringify(data));
	self.name = data.name;
	self.id = data.id;
});

socket.on('chat message', (msg) => {
	let newMessage = document.createElement('li');

	newMessage.innerHTML = msg; 

	document.getElementById("messages").append(newMessage);
});
