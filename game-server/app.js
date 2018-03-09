var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var abu = require("./app/servers/chat/filter/abuseFilter");
let consts = require("./app/servers/const/const.js");
let testcase = require("./app/servers/game/remote/gameRemote.js");
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 10,
			useDict : true,
			useProtobuf : true
		});
});

app.consts = consts;

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true,
            useDict: true,
            useProtobuf : true
		});
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});