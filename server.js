var app = require('express')();
var http = require('http').Server(app);
const io = require('socket.io')(http);

let users = {};
let guestlist = {};
var request = {};

var system = "<strong>SYSTEM</strong>";

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
	res.sendFile(__dirname + "/public/css/styles.css");
});

/* SOCKET CONNECTION PROTOCOL - USER HANDLING*/

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
		TODO:
		Guests are inserted into the local storage object according to their ip address.
		Users coming from the same source - such as those behind the same router - might 
		make things confusing later, so this should probably be made more robust.
	*/

	// Check to make sure there's an ip address and it's not undefined
	if(!users[request.ip] && request.ip !== undefined)
	{
		io.emit('chat message', system + ": User has connected on " + request.ip);
	}
	// if the ip is undefined, refresh and ditch - which should bring them back here
	// with corrected data

	else if( request.ip == undefined )
	{
		console.log('User on socket ' + socket.id + ' has invalid ip; force refreshing.');
		socket.emit('force refresh');
		return;
	}

	// establish server identity for use
	var user = newUser(request.ip, socket.id);

	// add user to current guest list and log user details
	guestlist[user.ip] = { "name" : user.name, "typing" : false };

	console.log("user " + user.name 
				+ " at " + user.ip 
				+ " using socket " + user.userID 
				+ " has connected");

	// update everyone's guest lists
	io.emit("guestlistupdate", guestlist);

	// when a chat message happens client-side, update all the things
	socket.on('chat message', (msg) => {
		io.emit('chat message', user.name + ": " + msg);
	});

	// when a client disconnects, update the clients' guest list but RETAIN
	// USER IDENTITY
	socket.on('disconnect', () => {
		delete guestlist[user.ip];
		io.emit("guestlistupdate", guestlist);
		io.emit("chat message", system +": User " + user.name + " has disconnected.");
		console.log("user " + user.name 
					+ " at " + user.ip 
					+ " using socket " + user.userID 
					+ " has disconnected"); 
	});

	socket.on('typing', () =>
	{
		guestlist[user.ip]["typing"] = true;
		io.emit("guestlistupdate", guestlist);
		setTimeout(() => {
			guestlist[user.ip]["typing"] = false;
			io.emit("guestlistupdate", guestlist);
		}, 1000);
	});
});

/* RUN SERVER */

http.listen(80, function(){
  console.log('server is up.');
});


/*
TODO (from notes):

- Store list of connected clients in database
	- Serve list on request or on change
- Establish 'rooms', each with its own database storing the above


Room data:
	- clients
		- Name
		- Timestamp joined
		- Idle?
		- Typing? 
*/