// in case of a shared inviting link
if (get_cookie("session_id") == "") {
  my_redirect("/login", "https");
} else {
  sp = window.location.pathname.split("/");
  race_id = sp[sp.length - 1];
  set_cookie("race_id", race_id, 10);
  
  // Load race info
  console.log("Getting race info.")
  let data = JSON.stringify({
      "type"    : "get_race_info"
  });
  var url = window.location.href;
  var protocol = "https";
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
  var data = JSON.stringify({
    type: "join_race" 
  });
  ws.send(data);
  // change page
  // 1. change button zone html
  document.getElementById("btn-zone").innerHTML = `<section id="timer"><button class="btn btn-primary" onclick="ready();">Ready</button></section>`
  // 2. append racer row
  // add_racer_row(name) will be called when the reply from server gets handled by handle_server_message in static/common.js
}

function copy_invitation() {
  var sp = window.location.pathname.split("/");
  var race_id = sp[sp.length - 1];
  navigator.clipboard.writeText(race_id);
};

function start_race() {
  document.race_info["start_time"] = new Date();
  var timestamp = document.race_info["start_time"].toUTCString();
  // show start message
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message-info">
        <p name="signature-id"><small>${timestamp}</small></p>
        <p name="message-id">Race now starts!</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
  document.race_info["tasks"].forEach(add_task_row); // show tasks
  document.getElementById("btn-zone").innerHTML = `<div id="timer"></div>`
  start_timer(); // start timer
};


function start_timer() {
  // Set the time we're counting down to
  var endTime = document.race_info["start_time"].getTime() + document.race_info["duration"] * 60 * 1000;
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
      document.getElementById("timer").innerHTML = "Time Up!";
    }
  }, 1000);
};


function send_chat_message() {
  timestamp = new Date().toUTCString();
  text = document.getElementById("chat-input").value;
  document.getElementById("chat-input").value = "";
  data = JSON.stringify({
        type       : "chat_message",
        timestamp  : timestamp,
        message    : text
  });
  ws.send(data);
};


function ready() {
  timestamp = new Date().toUTCString();
  data = JSON.stringify({
    type : "ready",
    timestamp  : timestamp
  });
  ws.send(data);
};


function add_task_row(value) {
  var tid = value[0];
  var tlink = value[1];
  var ttitle = value[2];
  var tcredits = value[3];
  // new task
  var template = document.querySelector('#task-row');
  var row = template.content.cloneNode(true);
  row.querySelector("tr").id = `task_row_${tid.split('+').slice(-1)}`;
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = '<a href="'+ tlink +'" target="_blank">'+ ttitle +'</a>';
  td[1].textContent = tcredits;
  td[2].innerHTML = `<button class="btn btn-secondary" onclick="finish_task('${tid}');">Finish</button>`
  var tbody = document.querySelector("#tasks-tbody");
  tbody.appendChild(row);
};

function add_racer_row(username) {
  document.race_info[username + ":credits"] = 0;
  // new racer
  var template = document.querySelector('#racer-row');
  var row = template.content.cloneNode(true);
  row.querySelector("tr").id = `racer_row_${username}`;
  var sum_of_credits = document.race_info["sum_of_credits"];
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = username;
  td[1].innerHTML = `<p>0/${sum_of_credits}, 00:00:00</p>`;
  var tbody = document.querySelector("#racers-tbody");
  tbody.appendChild(row);
};


function add_ready_message(username, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message-info">
        <p name="signature-box"><small>${timestamp}</small></p>
        <p name="message-box"><strong>${username}</strong> is ready!</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};



function add_task_message(username, timestamp, ttitle) {
  var tcredits = 0;
  document.race_info["tasks"].forEach(function (value) {
        if (value[2] == ttitle) {
          tcredits = value[3];
        }
      })
  var c = parseInt(document.race_info[username + ":credits"]);
  c += parseInt(tcredits);
  document.race_info[username + ":credits"] = c;
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message-info">
        <p id="signature-box"><small>${timestamp}</small></p>
        <p id="message-box"><strong>${username}</strong> completed ${ttitle}!</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};


function add_chat_message(username, message, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
    <div class="message-user">
        <p name="signature-box"><small>${timestamp}</small><br><strong>${username}</strong></p>
        <p name="message-box">${message}</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};

function finish_task(tid) {
  var session_id = get_cookie("session_id");
  console.log("finish task:" + tid);
  var t = Date.now() - document.race_info["start_time"];
  var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((t % (1000 * 60)) / 1000);
  var finish_time = hours + ":" + minutes + ":" + seconds;
  console.log("finish time: " + finish_time);
  data = JSON.stringify({
    type      : "finish_task",
    timestamp : finish_time,
    task_id   : tid
  });
  console.log(data);
  ws.send(data);
};

function refresh_racer_row(username, timestamp, tcredits) {
  var current_credits = document.race_info[username + ":credits"];
  var sum_of_credits = document.race_info["sum_of_credits"];
  row = document.getElementById(`racer_row_${username}`);
  var td = row.querySelectorAll("td");
  td[1].innerHTML = `<p>${current_credits}/${sum_of_credits}, ${timestamp}</p>`;
};

