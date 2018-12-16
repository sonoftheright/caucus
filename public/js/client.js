//client.js

var socket = io();

var self = {"name": "", "id": ""};

var form = document.getElementById("form");
var chatBox = document.getElementById("m");
var msgHistoryLimit = 1000000; //1,000,000

function addMessageToDisplay(msg)
{
	let newMessage = document.createElement('li');
	newMessage.innerHTML = msg; 
	document.getElementById("messages").append(newMessage);	
}

msgLog = localforage.getItem("msgLog", (err, value) => {
	if(value)
	{
		var trimmedMsgLog = [];
		for(var x = 0; x < value.length && x < msgHistoryLimit; x++)
		{
			addMessageToDisplay(value[x]);
			trimmedMsgLog.push(value[x]);
		}
		msgLog = trimmedMsgLog;
	}
});

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
	addMessageToDisplay(msg);
	msgLog.push(msg);
	localforage.setItem("msgLog", msgLog, (err, value) => {
		if(err)
		{
			console.log("ERROR: " + err);
		}
	});
});

socket.on('force refresh', () =>
{
	console.log("Refreshing. . .");
	location.reload(true);
});
