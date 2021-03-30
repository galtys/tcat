var WebSocketServer = require('websocket').server;
var http = require('http');

function originIsAllowed(origin) {
  return true;
}


var gameState = (function () {

  /* The object that holds the game state */
  var state = {};
  console.log("wsServer1----");

  var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
  });

  var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });



    
    
  return {
      newState : function () {
        state = { state: 'SAFE' };	  
    },
      
    readState : function () {
      return state.state;
    },
    
    readHealth : function () {
      return state.health;
    },
    
    readEnemy : function () {
      return state.enemy;
    },
    
    writeStateStr : function (stateStr) {
      state.state = stateStr;
    },
    
    writeHealth : function (health) {
      state.health = health;
    },

    echoWS2 : function (on_request) {
	wsServer.on('request', on_request);
    },
     
    writeEnemy : function (enemy) {
      state.enemy = enemy;
    },

    setConn : function (req) {
	var conn = req.accept('echo-protocol',req.origin);
	state.conn = conn
        //return c;
    },

    set_on_msg : function (fc) {
          state.conn.on('message', fc);
    },
    on_msg_fc : function (msg) {
        if (msg.type==='utf8') {
	    console.log("Msg recv: " + msg.utf8Data);
            state.conn.sendUTF( msg.utf8Data );
	}
    },
      
    echoWS : function (callback) {
        console.log("setting up echoWS  " )
  
  wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
	    
            connection.sendUTF( callback(message.utf8Data) );
        }
	/*
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
        */
    }); //connection.on
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
  }          ); //wsServer.on(
	
	
    }, //echoWS
      
  }
  
}());


/*
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
*/

/*


wsServer.on('request', function(request) {
    
    var connection = request.accept('echo-protocol', request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received MessageX4: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
    });
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

    
});

*/
