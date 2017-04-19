var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 9000;

var queue = [];
var pairs = [];

app.get('/chat', function(req, res){

	res.sendFile(__dirname + '/web/chat.html');
});

app.get('*', function(req, res){

	res.sendFile(__dirname + '/web/' + req.url);
});

io.on('connection', function(client){

	client.on('pair', function(message){

		if(!isClientInQueue(client.id) && !getClientPair(client.id)){

			queue.push(client.id);
		}

		findPair();
	});

	client.on('message', function(message){
		
		sendMessageToPair(client.id, message);
	});

	client.on('unpair', function(message){

		unpairClient(client.id);
	});

	client.on('disconnect', function(){

		if(isClientInQueue(client.id)){

			removeFromQueue(client.id);
		}
		unpairClient(client.id);
	});
});

http.listen(port, function(){

	console.log('Server started!');
});

function findPair(){

	if(queue.length > 1){

		pairClients(queue[0], queue[1]);
	}
}

function pairClients(client, client2){

	pairs.push([client, client2]);
	queue.splice(0, 2);

	sendNotificationToPair(client, 'clear');
	sendNotificationToPair(client, 'paired');
}

function unpairClient(client){

	var pair = getClientPair(client);

	if(!pair){

		return;
	}

	if(pair[0] == client){

		io.to(pair[1]).emit('unpaired');
	}
	else{

		io.to(pair[0]).emit('unpaired');
	}

	removePair(pair);
}

function sendMessageToPair(client, message){

	var pair = getClientPair(client);

	if(!pair){

		return;
	}

	message = message.replace(/<[^>]*>/gi, '');

	if(pair[0] == client){

		io.to(pair[0]).emit('message', 'You: ' + message);
		io.to(pair[1]).emit('message', 'Stranger: ' + message);
	}
	else{

		io.to(pair[0]).emit('message', 'Stranger: ' + message);
		io.to(pair[1]).emit('message', 'You: ' + message);
	}		
}

function sendNotificationToPair(client, type){

	var pair = getClientPair(client);

	if(!pair){

		return;
	}

	io.to(pair[0]).emit(type);
	io.to(pair[1]).emit(type);
}

function getClientPair(client){

	for(var i = 0; i < pairs.length; i++){

		if(pairs[i].indexOf(client) > -1){

			return pairs[i];
		}
	}

	return false;
}

function isClientInQueue(client){

	if(queue.indexOf(client) > -1){

		return true;
	}

	return false;
}

function removePair(pair){

	var pairIndex = pairs.indexOf(pair);
	pairs.splice(pairIndex, 1);
}

function removeFromQueue(client){

	var clientIndex = queue.indexOf(client);
	queue.splice(clientIndex, 1);
}