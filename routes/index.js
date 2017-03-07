var express = require('express');
var router = express.Router();
var net = require('net');

var client;
var output = new Array();
var restData;
var heartPackage;

var PORT = 1552;
var HOST = 'hopefulme.cn'; //hopefulme.cn

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/compile', function(req, res, next) {
	if (! connect(res)) return;
	client.on('connect', function() {
		res.status(200).send('');
		sendHeartPackage();
		sendCommand('compile');
		sendCode(req.query.code);
	});
});

router.get('/run', function(req, res, next) {
	if (! connect(res)) return;
	client.on('connect', function() {
		res.status(200).send('');
		sendHeartPackage();
		sendCommand('run');
		sendCode(req.query.code);
	});
});

router.get('/input', function(req, res, next) {
	if (req.query.content)
		sendInput(req.query.content);
	res.status(200).send('');
});

router.get('/poll', function(req, res, next) {
	res.status(200).send(output.join('\n'));
	output.length = 0;
});

function sendHeartPackage() {
	heartPackage = setInterval(function() {
		if (client) 
			client.write('**##*#*#heart package**##*#*#\n');
	}, 500);
}

function endHeartPackage() {
	if(heartPackage) {
		clearInterval(heartPackage);
		heartPackage = null;
	}
}

function connect(res) {
	if (client) return;
	client = new net.Socket();
	if (! client) {
		res.status(500).send('connected failed!');
		return false;
	}
	client.connect(PORT, HOST);
	client.on('error', function(error) {
		res.status(500).send('connection error:'+error);
		close();
	});
	client.on('data', function(data) {
		var to = data.toString().replace(/(^\n*)|(\n*$)/g, "").split('\n');
		output.push(to);
	});
	client.on('end', function() {
		close();
	});
	return true;
}

function close() {
	endHeartPackage();
	if (client) {
		client.destroy();
		client = null;
		output.push('**##*#*#finished**##*#*#');
	}
}

function sendCommand(cmd) {
	if (! client) return;
	client.write(cmd + '\n');
}

function sendInput(input) {
	if (! client) return;
	client.write(input + '\n**##*#*#input ended**##*#*#\n');
}

function sendCode(code) {
	if (! client) return;
	client.write(code + '\n**##*#*#code ended**##*#*#\n');
}

module.exports = router;
