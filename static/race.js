console.log("Establishing websocket connection.");
var ws = new WebSocket("ws://"+ window.location.host +"/pubsub");
ws.addEventListener("message", (event) => { 
  console.log("server message:", event.data); 
  handle_server_message(event.data);
});

