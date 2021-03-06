//var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new WebSocket('ws://192.168.1.149:8080', 'echo-protocol');



client.onerror = function() {
    console.log('Connection Error');
};




client.onopen = function() {
    console.log('WebSocket Client Connected');

    console.log(client.readyState);
    console.log(client.OPEN);
    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 19000); //
        }
    }

    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};
