var app = require('express')();
var http = require('http').Server(app);
const io = require('socket.io')(http);

let users = {};
var request = {};

var guestcount = 100000; 			//Max guest count: 100,000

function newUser(ip, userID)
{
	if(users[ip]) { return users[ip]; console.log("User with same IP found: " + ip); }

	var user = { "name": "guest" + guestcount++, "ip": ip, "userID": userID };
	users[ip] = user;
	return user;
}

/* BASIC ROUTING */

app.get('/', (req, res) => {
  	res.sendFile(__dirname + '/public/index.html');
  	request = req;
});

app.get('/client.js', (req, res) => {
	res.sendFile(__dirname + "/public/js/client.js");
	request = req;
});

app.get('/localforage.js', (req, res) => {
	res.sendFile(__dirname + "/public/js/localforage.js");
	request = req;
});

app.get('/styles.css', (req, res) => {
	request = req;
	res.sendFile(__dirname + "/public/css/styles.css")
});

/* SOCKET CONNECTION PROTOCOL */

io.on('connection', (socket) => {
	/* 
		This will happen if the server resets but the client is still on the page. The 
		client will establish a reconnect without sending a GET request first, so 
		'request'  will be null. The 'force refresh' emit is pretty self-explanatory.
	*/
	if(!request.ip)
	{
		console.log("Forcing refresh for user on socket " + socket.id);
		socket.emit('force refresh');
	}

	/*
		Guests are inserted into the 
	*/

	if(!users[request.ip])
	{
		io.emit('chat message', "SYSTEM: User has connected on " + request.ip);
	}

	var user = newUser(request.ip, socket.id);

	console.log("user " + user.name + " at " + user.ip + " using socket " + user.userID + " has connected");

	socket.emit("guestlogin", user);

	socket.on('chat message', (msg) => {
		io.emit('chat message', user.name + ": " + msg);
	});

	socket.on('disconnect', () => {
		console.log("user " + user.name + " at " + user.ip + " using socket " + user.userID + " has disconnected"); 
	}); 
});

/* RUN SERVER */


http.listen(80, function(){
  console.log('server is up.');
});