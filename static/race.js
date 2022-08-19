// in case of a shared inviting link
if (get_cookie("session_id") == "") {
  my_redirect("/login", "http");
} else {
  sp = window.location.pathname.split("/");
  race_id = sp[sp.length - 1];
  set_cookie("race_id", race_id, 10);
  
  // Load race info
  console.log("Getting race info.")
  let data = `{
      "type"    : "get_race_info"
  }`;
  var url = window.location.href;
  var protocol = "http";
  var header_params = new Map();
  header_params.set("Content-Type", "application/json");
  my_xhr_post(data, url, protocol, header_params);
  
  // Start websocket connection
  console.log("Establishing websocket connection.");
  var ws = new WebSocket("ws://"+ window.location.host +"/pubsub");
  ws.addEventListener("message", (event) => { 
    handle_server_message(event.data);
  });
}

function join_race() {
  // send info to server
  var data = `{ "type": "join_race" }`
  ws.send(data);
  // change page
  // 1. change button zone html
  document.getElementById("btn-zone").innerHTML = `<section id="timer" style="padding: 20px; background-color: #f8f9fa; font-color: white; font-size: 40px; text-align: center; height: 120px;"><button class="btn btn-primary rounded" onclick="ready();">Ready</button></section>`
  // 2. append racer row
  // add_racer_row(name) will be called when the reply from server gets handled by handle_server_message in static/common.js
}

function copy_invitation() {
  var race_link = window.location.href;
  navigator.clipboard.writeText(race_link);
  alert("Copied to clipboard: " + race_link);
};

function start_race() {
  // notify server
  // change page:
  document.race_info["tasks"].forEach(add_task_row); // 1. show tasks
  document.getElementById("btn-zone").innerHTML = `<div id="timer" style="text-align: center; padding: 10px; font-size: large"></div>`
  start_timer(); // 2. start timer
};

function add_task_row(value) {
  var tid = value[0];
  var tlink = value[1];
  var ttitle = value[2];
  var tcredits = value[3];
  // new task
  var template = document.querySelector('#task-row');
  var row = template.content.cloneNode(true);
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = '<a href="'+ tlink +'">'+ ttitle +'</a>';
  td[1].textContent = tcredits;
  td[2].innerHTML = `<button onclick="finish_task('${tid}');">Finish</button>`
  var tbody = document.querySelector("#tasks-tbody");
  tbody.appendChild(row);
};

function add_racer_row(name) {
  // new racer
  var template = document.querySelector('#racer-row');
  var row = template.content.cloneNode(true);
  var sum_of_credits = 0;
  document.race_info["tasks"].forEach(function (value) {sum_of_credits += parseInt(value[3]);}); // 1. show tasks
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = name;
  td[1].innerHTML = `<p>0/${sum_of_credits}, 00:00:00</p>`;
  var tbody = document.querySelector("#racers-tbody");
  tbody.appendChild(row);
};


function start_timer() {
  // Set the time we're counting down to
  var endTime = Date.now() + document.race_info["duration"] * 60 * 1000;
  // Update the count down every 1 second
  var x = setInterval(function() {
    var now = Date.now();
    // Find the remain between now and the count down date
    var remain = endTime - now;
    // Time calculations for hours, minutes and seconds
    var hours = Math.floor((remain % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((remain % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((remain % (1000 * 60)) / 1000);
    // Display the result in the element
    document.getElementById("timer").innerHTML = hours + ":" + minutes + ":" + seconds;
    // If the count down is finished, write some text
    if (remain < 0) {
      clearInterval(x);
      document.getElementById("demo").innerHTML = "EXPIRED";
    }
  }, 1000);
};

function ready() {
  timestamp = new Date().toUTCString();
  data = `{
    "type" : "ready",
    "timestamp"  : "${timestamp}"
  }`;
  ws.send(data);
};

function add_ready_message(username, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message" style="padding:2px;">
      <div style="background-color:#17a2b8;">
        <div name="signature" style="padding:5px; font-color:gray;"><small>${timestamp}</small></div>
        <div name="message" style="padding:5px;"><strong>${username}</strong> is ready!</div>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};

function add_task_message(username, timestamp, ttitle) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message" style="padding:2px;">
      <div style="background-color:#17a2b8;">
        <div name="signature" style="padding:5px; font-color:gray;"><small>${timestamp}</small></div>
        <div name="message" style="padding:5px;"><strong>${username}</strong> solved ${ttitle}!</div>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};

function add_chat_message(username, message, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message" style="padding:2px;">
      <div style="background-color:#f8f9fa;">
        <div name="signature" style="padding:5px; font-color:gray;"><small>${timestamp}</small><br><strong>${username}</strong></div>
        <div name="message" style="padding:5px;">${message}</div>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};

function finish_task(tid) {
  console.log(tid);
  var finish_time = Date.now();
  console.log(finish_time);
  var session_id = get_cookie("session_id");
  console.log(session_id);
  data = `{
    "type"      : "finish_task",
    "timestamp" : ${finish_time},
    "task_id"   : "${tid}"
  }`;
  console.log(data);
  ws.send(data);
};

function send_chat_message() {
  timestamp = new Date().toUTCString();
  text = document.getElementById("chat-input").value;
  document.getElementById("chat-input").value = "";
  data = `{
        "type"       : "chat_message",
        "timestamp"  : "${timestamp}",
        "message"    : "${text}"
  }`
  ws.send(data);
};


