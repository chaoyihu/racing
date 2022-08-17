console.log("Getting race info.")
let data = `{
    "type"    : "get_race_info"
}`;
var url = window.location.href;
var protocol = "http";
var header_params = new Map();
header_params.set("Content-Type", "application/json");
my_xhr_post(data, url, protocol, header_params);


console.log("Establishing websocket connection.");
var ws = new WebSocket("ws://"+ window.location.host +"/pubsub");
ws.addEventListener("message", (event) => { 
  console.log("server message:", event.data); 
  handle_server_message(event.data);
});

function join_race() {
  // send info to server
  // change page
  // 1. change button zone
  document.getElementById("btn-zone").innerHTML = `<section id="timer" style="padding: 20px; text-align: center; height: 120px;"><button class="btn btn-primary rounded" onclick="start_timer();">Start Timer</button></section>`
  // 2. append racer row
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

function finish_task(tid) {
  var finish_time = Date.now();
  var session_id = document.cookie["session_id"];
  data = `
    "type"      : "finish_task",
    "timestamp" : ${finish_time},
    "session_id": "${session_id}",
    "task_id"   : "${tid}"
  `;
  ws.send(data);
};
