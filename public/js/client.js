//client.js

var socket = io();

var self = {"name": "", "id": ""};

var form = document.getElementById("form");
var chatBox = document.getElementById("m");
var msgHistoryLimit = 1000000; //1,000,000
var idleTime = 10000;

var guestList = {};

function getTimestamp() 
{
	var d, day, month, year, hours, minutes, seconds;
	d = new Date(); 
	day = d.getDate();
	month = d.getMonth() + 1;
	year = d.getFullYear();
	hours = d.getUTCHours() - (d.getTimezoneOffset() / 60);
	minutes = d.getMinutes();
	seconds = d.getSeconds();
	
	return month + "/" 
			+ day + "/" 
			+ year + ":("
			+ hours + ":"
			+ minutes + ":"
			+ seconds + "):";
}

function addMessageToDisplay(msg)
{
	if(msg.length < 1) { return; }
	
	let newMessage = document.createElement('li');
	newMessage.innerHTML = msg; 
	document.getElementById("messages").append(newMessage);	
}

function updateGuestList(users)
{
//	console.log("Updating guest list: %s", JSON.stringify(users));
	document.getElementById('guestlist').innerHTML = "";
	for (var user in users)
	{
		if(document.getElementById(users[user]["name"])) { continue; }
		var userNameDiv = document.createElement('div');
		userNameDiv.className = "guest";
		var userListItem = document.createElement('span');
		userListItem.id = users[user]["userID"];
		userListItem.innerHTML = users[user]["name"];
		userListItem.typing = false;

		userNameDiv.append(userListItem);

		if(users[user].typing) { 
			var typingEllipsis = document.createElement('span');
			typingEllipsis.className = "typing";
			typingEllipsis.innerHTML = " &#8230; ";
			userNameDiv.append(typingEllipsis);
		}

		document.getElementById('guestlist').append(userNameDiv);
	}
}

var msgLog = [];
localforage.getItem("msgLog", (err, value) => {
	var trimmedMsgLog = [];
	if(value)
	{
		for(var x = 0; x < value.length && x < msgHistoryLimit; x++)
		{
			addMessageToDisplay(value[x]);
			trimmedMsgLog.push(value[x]);
		}
	}
	msgLog = trimmedMsgLog;
});

form.addEventListener('submit', (e) => {
	e.preventDefault();

	socket.emit('chat message', chatBox.value );
	chatBox.value = '';
	console.log('message sent.');
});

chatBox.addEventListener('input', (e) => {
	idleTime = 0;
	socket.emit('typing');
});

socket.on("guestlogin", (data) => {
	console.log("New user data: " + JSON.stringify(data));
	guestList = data;
	updateGuestList(data);
});

socket.on("guestlistupdate", (users) => {
	updateGuestList(users);
});

socket.on('chat message', (msg) => {
	msg = getTimestamp() + msg;
	addMessageToDisplay(msg);
	msgLog.push(msg);
	localforage.setItem("msgLog", msgLog, (err, value) => {
		if(err)
		{
			console.log("ERROR SETTING ITEM: " + err);
		}
	});
});

socket.on('force refresh', () =>
{
	console.log("Refreshing. . .");
	location.reload(true);
});

function clearCache()
{
	console.log("Clearing entire cache at request of server.");
	localforage.clear((err) => {
		console.log("ERROR CLEARING CACHE: " + err);
	});
}

socket.on('force clear cache', () => {
	clearCache();
});

function forceClearAll()
{
	socket.emit('force clear all');
}