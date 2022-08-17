// Create new race
let data = `{
    "type"    : "request_race"
}`;
var url = window.location.href;
var protocol = "http";
var header_params = new Map();
header_params.set("Content-Type", "application/json");
my_xhr_post(data, url, protocol, header_params);
// Server will reply with a race_id, which will be handled by 
// `handle_server_message` and race_id will be added to cookie.
 
var counter = 0;
var all_tasks = new Map();

function add_task() {
  document.querySelector("#confirm_edit").addEventListener("click", () => confirm_edit("new_tid"));
  document.getElementById("complete_overlay").style.display = "block";
};

function confirm_edit(tid) {
  console.log(tid);
  if (tid == "new_tid") {
    counter += 1;
    race_id = JSON.parse(document.cookie)["race_id"]
    var tid = race_id + '+task+' + counter;
    console.log(`Editing new task, tid: ${tid}`);
    var existing = false;
  } else {
    console.log(`Editing existing task, tid: ${tid}`);
    var existing = true;
  };
  ttitle = document.getElementById("task_title_box_id").value;
  tdescription = document.getElementById("description_box_id").value;
  tcredits = document.getElementById("credit_box_id").value;
  tlink = "/task/" + tid;

  // front-end: show new row on page or update row if just editing existing task.
  insert_task_row(tid, ttitle, tdescription, tcredits, tlink, existing);

  // back-end: create/update task info in database.
  console.log(`Sending task info to server, tid: ${tid}`);
  let data = `{
      "type"       : "task_info", 
      "id"         : "${tid}",
      "title"      : "${ttitle}", 
      "description": "${tdescription}",
      "credits"    : "${tcredits}"
  }`;
  var url = window.location.host + window.location.pathname;
  var protocol = "http";
  var header_params = new Map();
  header_params.set("Content-Type", "application/json");
  my_xhr_post(data, url, protocol, header_params);
  // reply will be handled by function in common.js

  //remove event listener
  var old_element = document.getElementById("confirm_edit");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  // close overlay and clear input fields
  overlay_off();
  document.getElementById("task_title_box_id").value = "";
  document.getElementById("description_box_id").value = "";
  document.getElementById("credit_box_id").value = null;
};

function overlay_off() {
  document.getElementById("complete_overlay").style.display = "none";
};

function insert_task_row(tid, ttitle, tdescription, tcredits, tlink, existing) {
  if (!existing) {
    // new task
    var template = document.querySelector('#task_row');
    var row = template.content.cloneNode(true);
    row.querySelector("tr").id = `task_row_${tid.split('+').slice(-1)}`
    var tbody = document.querySelector("tbody");
    tbody.appendChild(row);
  }
  var row = document.querySelector(`#task_row_${tid.split('+').slice(-1)}`);
  // define row content
  var td = row.querySelectorAll("td");
  td[0].innerHTML = '<a href="'+ tlink +'">'+ ttitle +'</a>';
  td[1].textContent = tcredits;
  td[2].innerHTML = `<button onclick="edit_task('${tid}');"> Edit</button><button onclick="delete_task('${tid}');">Delete</button>`
  // define row info (for display in edit_task)
  row.info = {
    "tid"         : tid,
    "ttitle"      : ttitle, 
    "tdescription": tdescription,
    "tcredits"    : tcredits
  }
  all_tasks[tid] = row;
};

function edit_task(tid) {
  document.querySelector("#confirm_edit").addEventListener("click", () => confirm_edit(`${tid}`));
  document.getElementById("complete_overlay").style.display = "block";

  var dom_task_row = all_tasks[tid];
  document.getElementById("task_title_box_id").value = dom_task_row.info["ttitle"];
  document.getElementById("description_box_id").value = dom_task_row.info["tdescription"];
  document.getElementById("credit_box_id").value = dom_task_row.info["tcredits"];
};

function delete_task(tid) {
  document.getElementById(`task_row_${tid.split('+').slice(-1)}`).remove();
  console.log(`Deleting task, tid: ${tid}`);
  let data = `{
      "type"       : "delete_task", 
      "id"         : "${tid}",
  }`;
  var url = window.location.host + window.location.pathname;
  var protocol = "http";
  var header_params = new Map();
  header_params.set("Content-Type", "application/json");
  my_xhr_post(data, url, protocol, header_params);
};

function initiate() {
  // rid is in cookie["race_id"]
  rtitle = document.getElementById("race-title-box-id").value;
  rintroduction = document.getElementById("race-introduction-box-id").value;
  rduration = document.getElementById("race-duration-box-id").value;
  //rtasks will be retrieved in database by `keys rid+task*`
  let data = `{
      "type"         : "initiate_race",
      "title"        : "${rtitle}",
      "introduction" : "${rintroduction}",
      "duration"    :  ${rduration}
  }`;
  var url = window.location.href;
  var protocol = "http";
  var header_params = new Map();
  header_params.set("Content-Type", "application/json");
  my_xhr_post(data, url, protocol, header_params);
  // server will redirect
};

