// Bind enter key to default button
$(document).on('keypress',function(e) {
  if(e.which == 13) {
    event.preventDefault();
    try {
      document.getElementById("join_btn").click();
    } catch (error) {
      document.getElementById("talk_btn").click();
    }
  }
});

class WSClient {
  
  constructor() {
    //this.server_websocket_url = 'wss://' + window.location.host + '/contest'; // wss for heroku-production
    this.server_websocket_url = 'ws://' + window.location.host + '/contest'; // ws for localhost debugging
    this.ws = new WebSocket(this.server_websocket_url);

  };
  
  join() {
    this.username = document.getElementById('username_box_id').value;
    this.contest_id = document.getElementById('contest_name_box_id').value;
    console.log('Sending user information to server.');
    this.problems_list = document.getElementById('problems_list_box_id').value;
    var text = '{ "type":"initial", "username":"'+ this.username +'", "contest_id": "'+ this.contest_id +'", "problems_list": "' + this.problems_list +'"}';
    this.ws.send(text);
  };

  ready() {
    var text = '{ "type":"ready" }';
    this.ws.send(text);
  };

  talk() {
    var box = document.getElementById('msg_box_id');
    var msg = box.value;
    var text = '{ "type":"talk", "message":"' + msg + '"}';
    this.ws.send(text);
    box.value = '';
  };

  exit() {
    document.getElementById('main-section').innerHTML = "Bye!";
    this.ws.close(1000); // Normal closure
  };

};

// Instantiate websocket client.
var client = new WSClient();

client.ws.addEventListener('message',
  function (event) {
    const obj = JSON.parse(event.data);
    if (obj.type == "heartbeat_ping") {
      console.log("Ping received. Responding.");
      var pong = '{"type":"pong"}';
      client.ws.send(pong);
    };
    if (obj.type == "log") {
      console.log(obj.data);
    };
    if (obj.type == "text_message") {
      let element = document.getElementById("message_pane");
      element.innerHTML += "<div>" + obj.data + "</div>";
      element.scrollTop = element.scrollHeight;
    };
    if (obj.type == "change_page") {
      document.getElementById('main-section').innerHTML = obj.data;
    };
  }
);
