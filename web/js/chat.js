var socket = io('localhost:9000');
var isPaired = false;

socket.on('connect', function(event){

	appendNotification('Connected with server');
});

socket.on('message', function(message){

	appendMessage(message);
});

socket.on('paired', function(message){

	isPaired = true;
	document.getElementById('chat-toggle').innerHTML = 'Stop';
	document.getElementById('chat-toggle').disabled = false;
	document.getElementById('chat-input').disabled = false;
	document.getElementById('chat-input').focus();
	appendNotification('Connected to user! Say Hi!');
});

socket.on('unpaired', function(message){

	isPaired = false;
	document.getElementById('chat-toggle').innerHTML = 'New';
	appendNotification('Stranger has disconnected.');
});

socket.on('clear', function(message){

	document.getElementById('chat-log').innerHTML = '';
});

document.getElementById('chat-input').addEventListener('keydown', function(e){

	if(e.keyCode == 13){

		var messageInput = document.getElementById('chat-input');

		if(messageInput.value != ''){

			socket.emit('message', messageInput.value);
			messageInput.value = '';
		}
	}
});

document.body.addEventListener('keydown', function(e){

	if(e.keyCode == 27){

		document.getElementById('chat-toggle').click();
	}
});

document.getElementById('chat-toggle').addEventListener('click',function(e){

	if(isPaired){

		unpair();
	}
	else{

		pair();
	}
});

function appendMessage(message){

	var messagecontainer = document.createElement('div');
	var messageauthor = document.createElement('span');
	var messagecontent = document.createElement('span');

	messagecontainer.setAttribute('class', 'chat-message');
	messageauthor.setAttribute('class', 'chat-message-author');
	messagecontent.setAttribute('class', 'chat-message-message');

	messageauthor.innerHTML = message.split(' ')[0];
	messagecontent.innerHTML = message.substring(message.indexOf(' ')+1);

	messagecontainer.appendChild(messageauthor);
	messagecontainer.appendChild(messagecontent);

	document.getElementById('chat-log').appendChild(messagecontainer);
	document.getElementById('chat-log').scrollTop = document.getElementById('chat-log').scrollHeight;
}

function appendNotification(message){

	var messagecontainer = document.createElement('div');
	var messageauthor = document.createElement('span');

	messagecontainer.setAttribute('class', 'chat-message');
	messageauthor.setAttribute('class', 'chat-message-author');

	messageauthor.innerHTML = message;

	messagecontainer.appendChild(messageauthor);

	document.getElementById('chat-log').appendChild(messagecontainer);
	document.getElementById('chat-log').scrollTop = document.getElementById('chat-log').scrollHeight;
}

function unpair(){

	socket.emit('unpair');
	isPaired = false;
	document.getElementById('chat-toggle').innerHTML = 'New';
	appendNotification('You have disconnected.');
}

function pair(){

	socket.emit('pair');
	document.getElementById('chat-toggle').innerHTML = 'Wait';
	document.getElementById('chat-toggle').disabled = true;
	document.getElementById('chat-input').disabled = true;
	appendNotification('Looking for someone...');
}