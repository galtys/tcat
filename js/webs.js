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
     
    writeEnemy : function (enemy) {
      state.enemy = enemy;
    },


    wsServerOnRequest : function (on_request) {
	wsServer.on('request', on_request);
    },
    acceptConnection : function (req) {
	var conn = req.accept('echo-protocol',req.origin);
	//state.conn = conn;
        return conn;
    },
    
    set_on_msg2 : function (c,fc) {
          c.on('message', fc);
    },

    getUtf8Data : function (msg) {
        if (msg.type==='utf8') {
	    return msg.utf8Data;
	} else {
	    return "";
	}	    
    },
/*      
    send_msg : function (a) {
	  state.conn.sendUTF( a );
    },
*/
    sendUTF : function (c,a) {
	  c.sendUTF( a ); //connection.sendUTF
    },
/*    
    on_msg_fc : function (msg) {
        if (msg.type==='utf8') {
	    console.log("Msg recv: " + msg.utf8Data);
            state.conn.sendUTF( msg.utf8Data );
	}
    },
*/      
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
