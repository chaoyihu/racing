// In case user visits this page without logging in
if (get_cookie("session_id") == "") {
  my_redirect("/login", "https");
}

document.addEventListener('DOMContentLoaded', function() {
  var sp = window.location.pathname.split("/");
  var sprint_id = sp[sp.length - 1];
  set_cookie("sprint_id", sprint_id, 10);
  
  // Show sprint id
  document.getElementById("team-id-copy").innerHTML=`
    Click to copy sprint ID and share to invite:
    <p onclick="copy_invitation();">${sprint_id}</p>
  `;
  
  // Load sprint info
  console.log("Getting sprint info.")
  let data = JSON.stringify({
      "type"    : "get_sprint_info"
  });
  var xhr = new XMLHttpRequest();
  var url = window.location.href;
  var protocol = "https";
  if (!url.startsWith(protocol)) {
      url = protocol + "://" + url;
  };
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
      var parser = server_message_check(xhr.responseText);
      if (!parser.success) {
        console.log(parser.message);
      } else {
        var obj = parser.data;
        console.log(obj);
        if (obj["type"] == "alert") {
          console.log(obj["message"]);
        } else {
          document.sprint_info = obj;
          var sum_of_credits = 0;
          document.sprint_info["tasks"].forEach(function (value) {
            sum_of_credits += parseInt(value[3]);
          });
          document.sprint_info["sum_of_credits"] = sum_of_credits;
          document.getElementById("info-title").innerHTML = `
            <h1>${obj["title"]}</h1>
          `;
          document.getElementById("info-initiator").innerHTML = `
            <p><strong>Initiator</strong>: ${obj["initiator"]}</strong></p>
          `;
          document.getElementById("info-duration").innerHTML = `
            <p><strong>Duration</strong>: ${obj["duration"]} min(s)</p>
          `;
          document.getElementById('info-introduction').innerHTML = `
            <p><strong>Introduction</strong>:<br> ${obj["introduction"]}</p>
          `;
        }
      }
  };
  xhr.send(data);
    
  // Start websocket connection
  console.log("Establishing websocket connection.");
  document.ws = new WebSocket("wss://"+ window.location.host +"/pubsub");
  document.ws.addEventListener("message", (event) => {
    var parser = server_message_check(event.data);
    if (!parser.success) {
      console.log(parser.message);
    } else {
      var obj = JSON.parse(parser.data);   // parser.data here is a string
      console.log(obj);
      console.log(obj["type"]);
      console.log(obj["type"] == "new_sprinter");
      if (obj["type"] == "new_sprinter") {
        var name = obj["name"];
        add_sprinter_row(name);
      };
      if (obj["type"] == "chat_message") {
        add_chat_message(obj["publisher"], obj["message"], obj["timestamp"]);
      };
      if (obj["type"] == "ready") {
        add_ready_message(obj["publisher"], obj["timestamp"]);
      };
      if (obj["type"] == "finish_task") {
        var username = obj["publisher"];
        var tid = obj["task_id"];
        var timestamp = obj["timestamp"];
        var ttitle = "";
        var tcredits = 0;
        document.sprint_info["tasks"].forEach(function (value) {
          if (value[0] == tid) {
            ttitle = value[2];
            tcredits = value[3];
          }
        })
        // add task message
        add_task_message(username, timestamp, tid, ttitle);
        // add credit to sprinter row and refresh standing board.
        refresh_sprinter_row(username, timestamp, tcredits);
        // refresh_leaderboard();
      };
      if (obj["type"] == "start_sprint") {
        start_sprint();
      };
    }
  });
});

//////////////////////////////////////////////////////////////////////////

function join_sprint() {
  // send info to server
  var data = JSON.stringify({
    type: "join_sprint" 
  });
  document.ws.send(data);
  // change page
  document.getElementById("dynamic-zone-1").innerHTML = `
    <div id="timer">
      <button class="btn btn-primary" onclick="ready();">Ready</button>
    </div>
  `
}

function copy_invitation() {
  var sp = window.location.pathname.split("/");
  var sprint_id = sp[sp.length - 1];
  navigator.clipboard.writeText(sprint_id);
  
};

function start_sprint() {
  document.sprint_info["start_time"] = new Date();
  var timestamp = document.sprint_info["start_time"].toUTCString();
  // show start message
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message message-info">
        <p name="signature-id"><small>${timestamp}</small></p>
        <p name="message-id">sprint now starts!</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
  document.sprint_info["tasks"].forEach(add_task_row); // show tasks
  document.getElementById("dynamic-zone-1").innerHTML = `<div id="timer"></div>`
  start_timer(); // start timer
};


function start_timer() {
  // Set the time we're counting down to
  var endTime = document.sprint_info["start_time"].getTime() + document.sprint_info["duration"] * 60 * 1000;
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
      document.getElementById("timer").style.backgroundColor = "#ffc107";
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
  document.ws.send(data);
};


function ready() {
  document.getElementById("timer").innerHTML=`
    <p>Waiting for other sprinters to get ready...</p>
  `;
  timestamp = new Date().toUTCString();
  data = JSON.stringify({
    type : "ready",
    timestamp  : timestamp
  });
  document.ws.send(data);
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
  td[2].innerHTML = `
    <button class="btn btn-action" onclick="finish_task('${tid}');">Finish</button>
  `
  var tbody = document.querySelector("#tasks-tbody");
  tbody.appendChild(row);
};

function add_sprinter_row(username) {
  document.sprint_info[username + ":credits"] = 0;
  // new sprinter
  var template = document.querySelector('#sprinter-row');
  var row = template.content.cloneNode(true);
  row.querySelector("tr").id = `sprinter_row_${username}`;
  var sum_of_credits = document.sprint_info["sum_of_credits"];
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = username;
  td[1].innerHTML = `<p>0/${sum_of_credits}, 00:00:00</p>`;
  var tbody = document.querySelector("#sprinters-tbody");
  tbody.appendChild(row);
};


function add_ready_message(username, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message message-info">
        <p name="signature-box"><small>${timestamp}</small></p>
        <p name="message-box"><strong>${username}</strong> is ready!</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};



function add_task_message(username, timestamp, tid, ttitle) {
  var tcredits = 0;
  document.sprint_info["tasks"].forEach(function (value) {
        if (value[2] == ttitle) {
          tcredits = value[3];
        }
      })
  var c = parseInt(document.sprint_info[username + ":credits"]);
  c += parseInt(tcredits);
  document.sprint_info[username + ":credits"] = c;
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
      <div class="message message-info">
        <p id="signature-box"><small>${timestamp}</small></p>
        <p id="message-box"><strong>${username}</strong> completed task: ${ttitle}!</p>
      </div>
    </div>`;
    document
      .getElementById(`task_row_${tid.split('+').slice(-1)}`)
      .querySelectorAll("td")[2]
      .innerHTML = 'Completed';
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};


function add_chat_message(username, message, timestamp) {
  document.getElementById("chat-pane").innerHTML += `
    <div class="chat-message-container">
    <div class="message message-user">
        <p name="signature-box"><strong>${username}</strong>, <small>${timestamp}</small></p>
        <p name="message-box">${message}</p>
      </div>
    </div>`;
  document.getElementById("chat-pane").scrollTop = 9e9; // always scroll to bottom
};

function finish_task(tid) {
  var session_id = get_cookie("session_id");
  console.log("finish task:" + tid);
  var t = Date.now() - document.sprint_info["start_time"];
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
  document.ws.send(data);
};

function refresh_sprinter_row(username, timestamp, tcredits) {
  var current_credits = document.sprint_info[username + ":credits"];
  var sum_of_credits = document.sprint_info["sum_of_credits"];
  row = document.getElementById(`sprinter_row_${username}`);
  var td = row.querySelectorAll("td");
  td[1].innerHTML = `<p>${current_credits}/${sum_of_credits}, ${timestamp}</p>`;
};

function refresh_leaderboard() {
  // to be completed
}