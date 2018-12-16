var app = require('express')();
var http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];
var request = {};

var guestcount = 100000; 			//100,000

function newUser(name, ip, userID)
{
	for(var x = 0; x < users.length; x++)
	{
		if(users[x].ip == ip)
		{
			return users[x];
		}
	}

	var user = { "name": name, "ip": ip, "userID": userID };
	users.push(user);
	return user;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
  request = req;
});

app.get('/client.js', function(req, res) {
	res.sendFile(__dirname + "/public/js/client.js");
	request = req;
});

app.get('/styles.css', (req, res) => {
	request = req;
	res.sendFile(__dirname + "/public/css/styles.css")
});

io.on('connection', (socket) => {
	var user = newUser("guest" + guestcount++, request.ip, socket.id);

	console.log("user " + user.name + " at " + user.ip + " using socket " + user.userID + " has connected");

	socket.broadcast.emit("login", user);

	socket.on('chat message', (msg) => {
		io.emit('chat message', user.name + ": " + msg);
	});

	socket.on('disconnect', () => { 
		console.log("user " + user.name + " at " + user.ip + " using socket " + user.userID + " has disconnected"); 
	}); 
});

http.listen(80, function(){
  console.log('server is up.');
});