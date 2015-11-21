/*************************************
//
// roommate-tracker2 app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var device  = require('express-device');
var ping = require('ping');
var every = require('schedule').every;

var runningPortNumber = process.env.PORT;


app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});

app.get("/", function(req, res){
	res.render('index', {});
});

function runScan() {
    var hosts = ['forrest-s3', 'iphone'];
    hosts.forEach(function(host){
        ping.sys.probe(host, function(isAlive){
            var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
            console.log(msg);
            io.sockets.emit('blast', {msg: msg});
        });
    });
}

every('5m').do(runScan);

io.sockets.on('connection', function (socket) {

	io.sockets.emit('blast', {msg:"<span style=\"color:red !important\">someone connected</span>"});

        runScan();

	socket.on('blast', function(data, fn){
		console.log(data);
		io.sockets.emit('blast', {msg:data.msg});

		fn();//call the client back to clear out the field
	});
});


server.listen(runningPortNumber);

