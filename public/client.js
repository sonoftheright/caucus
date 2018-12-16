//client.js

var socket = io();

var chatBox = document.getElementById("m");

function submitform(){
	socket.emit('chat message', chatBox.value);
	chatBox.value = '';
	console.log('message sent.');
}